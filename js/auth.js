/* ==========================================================================
   ServiceFlow - Module d'Authentification (Inscription, Connexion, Recovery)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Attachement des écouteurs d'événements selon la page active
  initLoginForm();
  initRegisterForm();
  initForgotPasswordForm();
  initResetPasswordForm();
});

/**
 * Gère le formulaire de connexion (login.html)
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearAlert('alert-container');
    Utils.setButtonLoading('btn-submit', true);

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      // 1. Fermer les sessions existantes par sécurité
      try {
        await account.deleteSession('current');
      } catch (err) {
        // Ignorer si aucune session active
      }

      // 2. Créer la session email / mot de passe
      await account.createEmailPasswordSession(email, password);

      // 3. Récupérer l'utilisateur connecté
      const authUser = await account.get();

      // 4. Récupérer le profil dans la collection 'profiles'
      const profilesResponse = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        [Query.equal('userId', authUser.$id)]
      );

      if (profilesResponse.documents.length === 0) {
        throw new Error("Aucun profil associé à ce compte utilisateur.");
      }

      const profile = profilesResponse.documents[0];

      if (profile.status === 'suspended') {
        await account.deleteSession('current');
        throw new Error("Votre compte utilisateur a été suspendu.");
      }

      // 5. Redirection selon le rôle
      if (profile.role === 'super_admin') {
        window.location.href = 'admin/index.html';
      } else {
        window.location.href = 'dashboard.html';
      }

    } catch (error) {
      Utils.showAlert('alert-container', Utils.handleAppwriteError(error), 'danger');
      Utils.setButtonLoading('btn-submit', false);
    }
  });
}

/**
 * Gère le formulaire d'inscription d'une nouvelle entreprise (register.html)
 */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // Pré-sélection du plan via les paramètres d'URL (ex: ?plan=pro)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get('plan') || 'starter';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearAlert('alert-container');

    const companyName = document.getElementById('companyName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      Utils.showAlert('alert-container', 'Les mots de passe ne correspondent pas.', 'danger');
      return;
    }

    Utils.setButtonLoading('btn-submit', true);

    try {
      // 1. Créer le compte Appwrite Auth
      const newUserId = ID.unique();
      const authUser = await account.create(newUserId, email, password, `${firstName} ${lastName}`);

      // 2. Connecter l'utilisateur automatiquement pour obtenir la session active
      await account.createEmailPasswordSession(email, password);

      // 3. Créer l'entreprise dans la collection 'companies'
      const companyId = ID.unique();
      const now = new Date().toISOString();

      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
        companyId,
        {
          id: companyId,
          name: companyName,
          email: email,
          phone: phone,
          plan: selectedPlan.toLowerCase(),
          subscriptionStatus: 'active',
          status: 'active',
          createdAt: now,
          updatedAt: now
        }
      );

      // 4. Créer le profil utilisateur avec le rôle company_admin et le companyId
      const profileId = ID.unique();
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        profileId,
        {
          id: profileId,
          userId: authUser.$id,
          companyId: companyId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          role: 'company_admin',
          status: 'active',
          createdAt: now
        }
      );

      // 5. Redirection directe vers le dashboard
      window.location.href = 'dashboard.html';

    } catch (error) {
      Utils.showAlert('alert-container', Utils.handleAppwriteError(error), 'danger');
      Utils.setButtonLoading('btn-submit', false);
    }
  });
}

/**
 * Gère le formulaire de demande de réinitialisation de mot de passe (forgot-password.html)
 */
function initForgotPasswordForm() {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearAlert('alert-container');
    Utils.setButtonLoading('btn-submit', true);

    const email = document.getElementById('email').value.trim();
    const redirectUrl = `${window.location.origin}/reset-password.html`;

    try {
      await account.createRecovery(email, redirectUrl);
      Utils.showAlert(
        'alert-container',
        'Un e-mail contenant les instructions de réinitialisation vous a été envoyé.',
        'success'
      );
      form.reset();
    } catch (error) {
      Utils.showAlert('alert-container', Utils.handleAppwriteError(error), 'danger');
    } finally {
      Utils.setButtonLoading('btn-submit', false);
    }
  });
}

/**
 * Gère la validation du nouveau mot de passe (reset-password.html)
 */
function initResetPasswordForm() {
  const form = document.getElementById('reset-password-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const secret = urlParams.get('secret');

  if (!userId || !secret) {
    Utils.showAlert(
      'alert-container',
      'Lien de réinitialisation invalide ou expiré. Veuillez refaire une demande.',
      'danger'
    );
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearAlert('alert-container');

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      Utils.showAlert('alert-container', 'Les mots de passe ne correspondent pas.', 'danger');
      return;
    }

    Utils.setButtonLoading('btn-submit', true);

    try {
      await account.updateRecovery(userId, secret, password, password);
      Utils.showAlert(
        'alert-container',
        'Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...',
        'success'
      );
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2500);
    } catch (error) {
      Utils.showAlert('alert-container', Utils.handleAppwriteError(error), 'danger');
      Utils.setButtonLoading('btn-submit', false);
    }
  });
}