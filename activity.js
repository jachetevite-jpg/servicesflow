/* ==========================================================================
   ServiceFlow - Journal d'Activité et d'Audit (ActivityService)
   ========================================================================== */

const ActivityService = {
  /**
   * Enregistre une entrée dans le journal d'activité
   */
  async log({ action, entityType, entityId = '', details = '' }) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId || null,
        actorProfileId: SessionManager.currentProfile.$id,
        actorName: `${SessionManager.currentProfile.firstName} ${SessionManager.currentProfile.lastName}`,
        action, // ex: 'CLIENT_CREATED', 'INTERVENTION_COMPLETED', 'USER_ROLE_UPDATED'
        entityType, // ex: 'client', 'intervention', 'complaint', 'user'
        entityId: entityId || '',
        details: details || '',
        createdAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.ACTIVITY_LOGS,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      // On ne lève pas l'erreur pour ne pas bloquer le flux utilisateur principal
      return null;
    }
  },

  /**
   * Récupère le journal d'activité de l'entreprise
   */
  async getCompanyLogs(limit = 50, offset = 0) {
    try {
      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.equal('companyId', SessionManager.currentProfile.companyId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des logs d'entreprise:", error);
      throw error;
    }
  },

  /**
   * Récupère l'intégralité du journal global (Réservé au Super Admin)
   */
  async getAllLogs(limit = 100, offset = 0) {
    try {
      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du journal global:", error);
      throw error;
    }
  }
};