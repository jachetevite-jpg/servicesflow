/* ==========================================================================
   ServiceFlow - Gestion du Profil Utilisateur & Mot de passe
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const session = await checkSession();
  if (!session) return;

  loadUserProfile();

  const profileForm = document.getElementById('user-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', updateUserProfile);
  }

  const passwordForm = document.getElementById('change-password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', updateUserPassword);
  }
});

/**
 * Remplit le formulaire de profil avec les données actuelles
 */
function loadUserProfile() {
  const profile = window.CurrentSession.profile;
  const authUser = window.CurrentSession.authUser;

  if (!profile) return;

  document.getElementById('profile-firstname').value = profile.firstName || '';
  document.getElementById('profile-lastname').value = profile.lastName || '';
  document.getElementById('profile-email').value = authUser.email || '';
  document.getElementById('profile-phone').value = profile.phone || '';
  document.getElementById('profile-role').value = Utils.formatRole(profile.role);
}

/**
 * Mettre à jour les informations personnelles du profil
 */
async function updateUserProfile(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('btn-save-profile');
  const alertEl = document.getElementById('profile-alert');

  Utils.showLoading(submitBtn, 'Mise à jour...');
  Utils.hideAlert(alertEl);

  const profileId = window.CurrentSession.profile.$id;

  const updatedData = {
    firstName: document.getElementById('profile-firstname').value.trim(),
    lastName: document.getElementById('profile-lastname').value.trim(),
    phone: document.getElementById('profile-phone').value.trim()
  };

  try {
    const updatedProfile = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      profileId,
      updatedData
    );

    window.CurrentSession.profile = updatedProfile;
    Utils.showAlert(alertEl, 'Votre profil a été mis à jour avec succès.', 'success');
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    Utils.showAlert(alertEl, error.message || 'Erreur lors de la mise à jour du profil.', 'danger');
  } finally {
    Utils.hideLoading(submitBtn, 'Mettre à jour le profil');
  }
}

/**
 * Modifier le mot de passe de l'utilisateur
 */
async function updateUserPassword(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('btn-save-password');
  const alertEl = document.getElementById('password-alert');

  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (newPassword !== confirmPassword) {
    Utils.showAlert(alertEl, 'Le nouveau mot de passe et sa confirmation ne correspondent pas.', 'danger');
    return;
  }

  if (newPassword.length < 8) {
    Utils.showAlert(alertEl, 'Le nouveau mot de passe doit contenir au moins 8 caractères.', 'danger');
    return;
  }

  Utils.showLoading(submitBtn, 'Changement...');
  Utils.hideAlert(alertEl);

  try {
    await account.updatePassword(newPassword, oldPassword);
    Utils.showAlert(alertEl, 'Mot de passe modifié avec succès.', 'success');
    document.getElementById('change-password-form').reset();
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    Utils.showAlert(alertEl, error.message || 'Erreur lors de la modification du mot de passe.', 'danger');
  } finally {
    Utils.hideLoading(submitBtn, 'Changer le mot de passe');
  }
}