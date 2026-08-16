/* ==========================================================================
   ServiceFlow - Gestion des Sessions et Protection des Routes Privées
   ========================================================================== */

// Objet global de session utilisateur
window.CurrentSession = {
  authUser: null,
  profile: null,
  company: null,
  isLoggedIn: false
};

/**
 * Vérifie la session active et protège la page courante.
 * À exécuter au chargement de chaque page privée.
 * @param {Array<string>} requiredRoles - Liste optionnelle des rôles autorisés (ex: ['company_admin', 'agent'])
 */
async function checkSession(requiredRoles = []) {
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.includes('/admin/');

  try {
    // 1. Récupérer l'utilisateur Appwrite actif
    const authUser = await account.get();
    window.CurrentSession.authUser = authUser;

    // 2. Charger le profil utilisateur depuis la collection 'profiles'
    const profilesResponse = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      [Query.equal('userId', authUser.$id)]
    );

    if (!profilesResponse || profilesResponse.documents.length === 0) {
      throw new Error("Profil utilisateur non trouvé.");
    }

    const profile = profilesResponse.documents[0];

    // Vérifier si le compte est actif
    if (profile.status === 'suspended') {
      await account.deleteSession('current');
      window.location.href = '/login.html?error=suspended';
      return null;
    }

    window.CurrentSession.profile = profile;

    // 3. Charger les données de l'entreprise si ce n'est pas un super_admin
    if (profile.role !== 'super_admin' && profile.companyId) {
      try {
        const company = await databases.getDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
          profile.companyId
        );

        if (company.status === 'suspended') {
          await account.deleteSession('current');
          window.location.href = '/login.html?error=company_suspended';
          return null;
        }

        window.CurrentSession.company = company;
      } catch (compErr) {
        console.error("Erreur de chargement de l'entreprise:", compErr);
      }
    }

    window.CurrentSession.isLoggedIn = true;

    // 4. Contrôle d'accès par rôle et par route
    const userRole = profile.role;

    // Protection des routes /admin/
    if (isAdminRoute && userRole !== 'super_admin') {
      window.location.href = 'dashboard.html';
      return null;
    }

    // Redirection si un super_admin tente d'accéder à la partie client
    if (!isAdminRoute && userRole === 'super_admin') {
      window.location.href = 'admin/index.html';
      return null;
    }

    // Vérification des rôles spécifiques autorisés sur la page
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      window.location.href = 'dashboard.html?error=unauthorized';
      return null;
    }

    return window.CurrentSession;

  } catch (error) {
    console.warn("Session non valide ou expirée :", error.message);
    window.CurrentSession.isLoggedIn = false;

    // Si on est sur une page privée, rediriger vers login.html
    const publicPages = ['/index.html', '/login.html', '/register.html', '/forgot-password.html', '/reset-password.html', '/'];
    const isPublicPage = publicPages.some(page => currentPath.endsWith(page));

    if (!isPublicPage) {
      window.location.href = 'login.html';
    }

    return null;
  }
}

/**
 * Déconnecte l'utilisateur et ferme la session Appwrite
 */
async function logout() {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.error("Erreur lors de la déconnexion:", err);
  } finally {
    window.CurrentSession = { authUser: null, profile: null, company: null, isLoggedIn: false };
    window.location.href = '/login.html';
  }
}