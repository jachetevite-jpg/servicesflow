/* ==========================================================================
   ServiceFlow - Gestion des Clients (ClientService)
   ========================================================================== */

const ClientService = {
  /**
   * Crée une nouvelle fiche client
   */
  async create(clientData) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId,
        name: clientData.name,
        type: clientData.type || 'individual', // 'individual' ou 'company'
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        city: clientData.city || '',
        postalCode: clientData.postalCode || '',
        notes: clientData.notes || '',
        status: clientData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CLIENTS,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw error;
    }
  },

  /**
   * Récupère un client par son ID
   */
  async getById(clientId) {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CLIENTS,
        clientId
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du client:", error);
      throw error;
    }
  },

  /**
   * Liste les clients de l'entreprise avec filtres et pagination
   */
  async list(searchQuery = '', statusFilter = '', limit = 50, offset = 0) {
    try {
      const queries = [
        Query.equal('companyId', SessionManager.currentProfile.companyId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ];

      if (statusFilter) {
        queries.push(Query.equal('status', statusFilter));
      }

      if (searchQuery) {
        queries.push(Query.search('name', searchQuery));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CLIENTS,
        queries
      );
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      throw error;
    }
  },

  /**
   * Met à jour les informations d'un client
   */
  async update(clientId, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.CLIENTS,
        clientId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      throw error;
    }
  },

  /**
   * Archive / Désactive un client
   */
  async archive(clientId) {
    return this.update(clientId, { status: 'archived' });
  }
};