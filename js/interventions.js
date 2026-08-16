/* ==========================================================================
   ServiceFlow - Gestion des Interventions Techniques (InterventionService)
   ========================================================================== */

const InterventionService = {
  /**
   * Planifie une nouvelle intervention
   */
  async create(interventionData) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId,
        clientId: interventionData.clientId,
        complaintId: interventionData.complaintId || null,
        technicianId: interventionData.technicianId || null,
        title: interventionData.title,
        description: interventionData.description || '',
        address: interventionData.address || '',
        scheduledAt: interventionData.scheduledAt, // ISO Date String
        status: interventionData.status || 'scheduled', // 'scheduled', 'in_progress', 'completed', 'cancelled'
        report: interventionData.report || '',
        createdBy: SessionManager.currentProfile.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const intervention = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INTERVENTIONS,
        ID.unique(),
        data
      );

      // Si l'intervention est liée à une réclamation, passe la réclamation en "in_progress"
      if (interventionData.complaintId) {
        try {
          await ComplaintService.update(interventionData.complaintId, { status: 'in_progress' });
        } catch (e) {
          console.warn("Impossible de mettre à jour le statut de la réclamation liée:", e);
        }
      }

      return intervention;
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      throw error;
    }
  },

  /**
   * Récupère une intervention par son ID
   */
  async getById(interventionId) {
    try {
      return await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INTERVENTIONS,
        interventionId
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de l'intervention:", error);
      throw error;
    }
  },

  /**
   * Liste les interventions avec filtres (technicien, statut, date)
   */
  async list({ statusFilter = '', technicianId = '', clientId = '', limit = 50, offset = 0 } = {}) {
    try {
      const queries = [
        Query.equal('companyId', SessionManager.currentProfile.companyId),
        Query.orderAsc('scheduledAt'),
        Query.limit(limit),
        Query.offset(offset)
      ];

      // Si c'est un technicien connecté, restreindre à ses interventions
      if (SessionManager.currentProfile.role === 'technician') {
        queries.push(Query.equal('technicianId', SessionManager.currentProfile.$id));
      } else if (technicianId) {
        queries.push(Query.equal('technicianId', technicianId));
      }

      if (statusFilter) {
        queries.push(Query.equal('status', statusFilter));
      }
      if (clientId) {
        queries.push(Query.equal('clientId', clientId));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INTERVENTIONS,
        queries
      );
    } catch (error) {
      console.error("Erreur lors du chargement des interventions:", error);
      throw error;
    }
  },

  /**
   * Met à jour une intervention
   */
  async update(interventionId, updateData) {
    try {
      const data = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INTERVENTIONS,
        interventionId,
        data
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'intervention:", error);
      throw error;
    }
  },

  /**
   * Clôture une intervention avec un compte-rendu
   */
  async complete(interventionId, reportText, complaintIdToResolve = null) {
    try {
      const updatedIntervention = await this.update(interventionId, {
        status: 'completed',
        report: reportText,
        completedAt: new Date().toISOString()
      });

      // Si liée à une réclamation, mettre la réclamation en statut "résolu"
      if (complaintIdToResolve) {
        try {
          await ComplaintService.update(complaintIdToResolve, { status: 'resolved' });
        } catch (e) {
          console.warn("Impossible de passer la réclamation liée au statut résolu:", e);
        }
      }

      return updatedIntervention;
    } catch (error) {
      console.error("Erreur lors de la clôture de l'intervention:", error);
      throw error;
    }
  }
};