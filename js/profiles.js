/* ==========================================================================
   ServiceFlow - Gestion des Profils et Membres (ProfileService)
   ========================================================================== */

const ProfileService = {
  /**
   * Récupère le profil associé à un ID de document profil
   */
  async getById(profileId) {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        profileId
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      throw error;
    }
  },

  /**
   * Récupère le profil associé à un userId Appwrite Auth
   */
  async getByUserId(userId) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        [Query.equal('userId', userId)]
      );

      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error("Erreur lors de la recherche du profil par userId:", error);
      throw error;
    }
  },

  /**
   * Liste tous les membres de la même entreprise
   */
  async getCompanyMembers(companyId, roleFilter = '') {
    try {
      const queries = [
        Query.equal('companyId', companyId),
        Query.orderAsc('lastName'),
        Query.limit(100)
      ];

      if (roleFilter) {
        queries.push(Query.equal('role', roleFilter));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        queries
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des membres d'entreprise:", error);
      throw error;
    }
  },

  /**
   * Met à jour les informations d'un profil personnel
   */
  async updateProfile(profileId, profileData) {
    try {
      const data = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '',
        jobTitle: profileData.jobTitle || '',
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        profileId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  /**
   * Change le rôle ou le statut d'un membre (Réservé Admin d'entreprise / Super Admin)
   */
  async updateMemberRoleAndStatus(profileId, newRole, newStatus) {
    try {
      const data = {
        role: newRole,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        profileId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la modification des autorisations du membre:", error);
      throw error;
    }
  }
};