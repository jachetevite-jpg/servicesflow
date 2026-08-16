/* ==========================================================================
   ServiceFlow - Gestion des Contrats et Garanties (ContractService)
   ========================================================================== */

const ContractService = {
  /**
   * Crée un nouveau contrat pour un client
   */
  async create(contractData) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId,
        clientId: contractData.clientId,
        title: contractData.title,
        type: contractData.type || 'maintenance', // 'maintenance', 'warranty', 'support'
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        terms: contractData.terms || '',
        status: contractData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CONTRACTS,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de la création du contrat:", error);
      throw error;
    }
  },

  /**
   * Récupère la liste des contrats associés à un client spécifique
   */
  async getByClient(clientId) {
    try {
      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CONTRACTS,
        [
          Query.equal('companyId', SessionManager.currentProfile.companyId),
          Query.equal('clientId', clientId),
          Query.orderDesc('endDate')
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des contrats du client:", error);
      throw error;
    }
  },

  /**
   * Vérifie si un client possède un contrat actif à la date actuelle
   */
  async hasActiveContract(clientId) {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CONTRACTS,
        [
          Query.equal('companyId', SessionManager.currentProfile.companyId),
          Query.equal('clientId', clientId),
          Query.equal('status', 'active'),
          Query.lessThanEqual('startDate', now),
          Query.greaterThanEqual('endDate', now)
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error("Erreur lors de la vérification du contrat actif:", error);
      return false;
    }
  },

  /**
   * Met à jour un contrat existant
   */
  async update(contractId, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CONTRACTS,
        contractId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contrat:", error);
      throw error;
    }
  }
};