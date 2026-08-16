/**
 * Gestion de la session et des accès (RBAC)
 */
const Session = {
  currentUser: null,
  currentProfile: null,

  async requireAuth(allowedRoles = []) {
    try {
      // 1. Récupérer l'utilisateur connecté via Appwrite Auth
      this.currentUser = await AppwriteConfig.account.get();
      
      if (!this.currentUser) {
        this.redirectToLogin();
        return null;
      }

      // 2. Tenter de récupérer le profil (si la collection existe)
      try {
        const profileRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.profiles,
          [Appwrite.Query.equal('userId', this.currentUser.$id)]
        );

        if (profileRes.documents && profileRes.documents.length > 0) {
          this.currentProfile = profileRes.documents[0];
        }
      } catch (err) {
        console.warn("Collection 'profiles' introuvable ou inaccessible. Utilisation du profil de secours.");
      }

      // Profil par défaut si non trouvé
      if (!this.currentProfile) {
        this.currentProfile = {
          $id: this.currentUser.$id,
          userId: this.currentUser.$id,
          role: 'company_admin', // Rôle par défaut temporaire pour débloquer
          companyId: 'default'
        };
      }

      // 3. Vérification des rôles (si spécifié)
      if (allowedRoles.length > 0) {
        const userRole = this.currentProfile.role || 'user';
        const hasAccess = userRole === 'super_admin' || allowedRoles.includes(userRole);

        if (!hasAccess) {
          console.warn(`Accès refusé. Rôle requis: ${allowedRoles.join(', ')} | Votre rôle: ${userRole}`);
          window.location.href = 'dashboard.html';
          return null;
        }
      }

      return {
        user: this.currentUser,
        profile: this.currentProfile
      };

    } catch (error) {
      console.error("Erreur de session Appwrite :", error);
      this.redirectToLogin();
      return null;
    }
  },

  redirectToLogin() {
    const currentPath = window.location.pathname;
    if (!currentPath.endsWith('login.html') && !currentPath.endsWith('register.html')) {
      window.location.href = 'login.html';
    }
  }
};