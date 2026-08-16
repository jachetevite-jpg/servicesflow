/**
 * Gestion stricte de la session Appwrite
 */
const Session = {
  currentUser: null,
  currentProfile: null,

  async requireAuth(allowedRoles = []) {
    // 1. Masquer le body immédiatement pendant la vérification
    document.body.style.display = 'none';

    try {
      // 2. Vérifier si une session Appwrite valide existe
      this.currentUser = await AppwriteConfig.account.get();
      
      if (!this.currentUser) {
        this.redirectToLogin();
        return null;
      }

      // 3. Tenter de récupérer le profil utilisateur
      try {
        const profileRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.profiles,
          [Appwrite.Query.equal('userId', this.currentUser.$id)]
        );

        if (profileRes.documents && profileRes.documents.length > 0) {
          this.currentProfile = profileRes.documents[0];
        }
      } catch (e) {
        console.warn("Collection 'profiles' absente ou inaccessible.");
      }

      // Profil par défaut si non trouvé
      if (!this.currentProfile) {
        this.currentProfile = {
          $id: this.currentUser.$id,
          userId: this.currentUser.$id,
          role: 'company_admin'
        };
      }

      // 4. Si tout est valide, afficher la page
      document.body.style.display = 'block';

      return {
        user: this.currentUser,
        profile: this.currentProfile
      };

    } catch (error) {
      console.error("Session non authentifiée :", error);
      this.redirectToLogin();
      return null;
    }
  },

  redirectToLogin() {
    // Redirection propre vers login.html
    const currentPath = window.location.pathname;
    if (!currentPath.endsWith('login.html') && !currentPath.endsWith('register.html')) {
      window.location.href = '/login.html';
    } else {
      // Si on est déjà sur login.html, réafficher la page
      document.body.style.display = 'block';
    }
  }
};