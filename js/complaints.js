/* ==========================================================================
   ServiceFlow - Gestion des Réclamations & Tickets (ComplaintService)
   ========================================================================== */

const ComplaintService = {
  /**
   * Crée un nouveau ticket de réclamation
   */
  async create(complaintData) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId,
        clientId: complaintData.clientId,
        title: complaintData.title,
        description: complaintData.description || '',
        priority: complaintData.priority || 'medium', // 'low', 'medium', 'high', 'urgent'
        status: complaintData.status || 'new', // 'new', 'assigned', 'in_progress', 'resolved', 'closed'
        assignedTo: complaintData.assignedTo || null,
        createdBy: SessionManager.currentProfile.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPLAINTS,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de la création de la réclamation:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une réclamation par son ID
   */
  async getById(complaintId) {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPLAINTS,
        complaintId
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la réclamation:", error);
      throw error;
    }
  },

  /**
   * Liste les réclamations avec filtres (statut, priorité) et recherche
   */
  async list({ searchQuery = '', statusFilter = '', priorityFilter = '', clientId = '', limit = 50, offset = 0 } = {}) {
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
      if (priorityFilter) {
        queries.push(Query.equal('priority', priorityFilter));
      }
      if (clientId) {
        queries.push(Query.equal('clientId', clientId));
      }
      if (searchQuery) {
        queries.push(Query.search('title', searchQuery));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPLAINTS,
        queries
      );
    } catch (error) {
      console.error("Erreur lors du chargement des réclamations:", error);
      throw error;
    }
  },

  /**
   * Met à jour une réclamation (statut, priorité, détails)
   */
  async update(complaintId, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.COMPLAINTS,
        complaintId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réclamation:", error);
      throw error;
    }
  },

  /**
   * Assigne une réclamation à un intervenant/technicien
   */
  async assign(complaintId, profileId) {
    return this.update(complaintId, {
      assignedTo: profileId,
      status: 'assigned'
    });
  }
};