/* ==========================================================================
   ServiceFlow - Gestion des Notifications (NotificationService)
   ========================================================================== */

const NotificationService = {
  /**
   * Crée une nouvelle notification destinée à un utilisateur spécifique
   */
  async create({ recipientProfileId, title, message, type = 'info', link = '' }) {
    try {
      const data = {
        companyId: SessionManager.currentProfile.companyId,
        recipientProfileId,
        title,
        message,
        type, // 'info', 'warning', 'success', 'danger'
        link: link || '',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        data
      );
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
      throw error;
    }
  },

  /**
   * Récupère les notifications destinées à l'utilisateur connecté
   */
  async getUserNotifications(unreadOnly = false, limit = 20) {
    try {
      const queries = [
        Query.equal('recipientProfileId', SessionManager.currentProfile.$id),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];

      if (unreadOnly) {
        queries.push(Query.equal('isRead', false));
      }

      return await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
        queries
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  },

  /**
   * Marque une notification spécifique comme lue
   */
  async markAsRead(notificationId) {
    try {
      return await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
        notificationId,
        { isRead: true }
      );
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
      throw error;
    }
  },

  /**
   * Marque toutes les notifications de l'utilisateur comme lues
   */
  async markAllAsRead() {
    try {
      const unread = await this.getUserNotifications(true, 100);
      const promises = unread.documents.map(doc => this.markAsRead(doc.$id));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Erreur lors du traitement global des notifications:", error);
      throw error;
    }
  },

  /**
   * Obtient le nombre de notifications non lues pour afficher le badge
   */
  async getUnreadCount() {
    try {
      const response = await this.getUserNotifications(true, 100);
      return response.documents.length;
    } catch (error) {
      console.error("Erreur lors du calcul du nombre de notifications non lues:", error);
      return 0;
    }
  }
};