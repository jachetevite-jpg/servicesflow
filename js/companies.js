/* ==========================================================================
   ServiceFlow - Gestion des Entreprises (CompanyService)
   ========================================================================== */

const CompanyService = {
  /**
   * Récupère les détails d'une entreprise par son ID
   */
  async getById(companyId) {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
        companyId
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entreprise:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle entreprise
   */
  async create(companyData) {
    try {
      const data = {
        name: companyData.name,
        email: companyData.email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        status: companyData.status || 'active',
        plan: companyData.plan || 'trial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
      throw error;
    }
  },

  /**
   * Met à jour les informations d'une entreprise
   */
  async update(companyId, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
        companyId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entreprise:", error);
      throw error;
    }
  },

  /**
   * Liste toutes les entreprises (Réservé au Super Admin)
   */
  async listAll(searchQuery = '', statusFilter = '') {
    try {
      const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];

      if (searchQuery) {
        queries.push(Query.search('name', searchQuery));
      }
      if (statusFilter) {
        queries.push(Query.equal('status', statusFilter));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
        queries
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste des entreprises:", error);
      throw error;
    }
  }
};