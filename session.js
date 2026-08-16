/**
 * ServicesFlow - Contrôleur de Session et Protection des Routes Multi-tenant
 */

const Session = {
  currentUser: null,
  currentProfile: null,
  currentCompany: null,

  /**
   * Initialise et protège l'accès aux pages
   * @param {Array<string>} allowedRoles Rôles autorisés ('super_admin', 'company_admin', 'agent', 'technician')
   */
  async requireAuth(allowedRoles = []) {
    try {
      // 1. Récupérer l'utilisateur Appwrite Auth
      this.currentUser = await AppwriteConfig.account.get();
      
      // 2. Récupérer le profil utilisateur associé dans la DB
      const profileRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.profiles,
        [Appwrite.Query.equal('userId', this.currentUser.$id)]
      );

      if (profileRes.documents.length === 0) {
        throw new Error("Profil utilisateur introuvable.");
      }

      this.currentProfile = profileRes.documents[0];

      // 3. Charger les informations de l'entreprise si non Super Admin
      if (this.currentProfile.role !== 'super_admin' && this.currentProfile.companyId) {
        this.currentCompany = await AppwriteConfig.databases.getDocument(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.companies,
          this.currentProfile.companyId
        );

        // Vérifier si l'entreprise n'est pas suspendue
        if (this.currentCompany.status === 'suspended') {
          alert("Votre entreprise a été suspendue. Veuillez contacter le support.");
          await AppwriteConfig.account.deleteSession('current');
          window.location.href = 'login.html';
          return null;
        }
      }

      // 4. Contrôle d'accès basé sur les Rôles (RBAC)
      if (allowedRoles.length > 0 && !allowedRoles.includes(this.currentProfile.role)) {
        alert("Accès non autorisé à cette section.");
        this.redirectUserByRole(this.currentProfile.role);
        return null;
      }

      return {
        user: this.currentUser,
        profile: this.currentProfile,
        company: this.currentCompany
      };

    } catch (error) {
      console.warn("Utilisateur non authentifié ou session invalide :", error);
      // Redirection vers login.html si la page courante n'est pas publique
      if (!window.location.pathname.includes('login.html') && 
          !window.location.pathname.includes('register.html') && 
          !window.location.pathname.includes('forgot-password.html') &&
          !window.location.pathname.includes('reset-password.html') &&
          !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'login.html';
      }
      return null;
    }
  },

  /**
   * Redirige l'utilisateur en fonction de son rôle après la connexion
   */
  redirectUserByRole(role) {
    if (role === 'super_admin') {
      window.location.href = 'admin/index.html';
    } else if (role === 'technician') {
      window.location.href = 'interventions.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  },

  /**
   * Filtre automatique Appwrite Query pour garantir l'isolation Multi-tenant
   */
  getTenantQuery() {
    if (!this.currentProfile || !this.currentProfile.companyId) {
      throw new Error("Viol de sécurité Multi-tenant : companyId manquant.");
    }
    return Appwrite.Query.equal('companyId', this.currentProfile.companyId);
  }
};