document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const profileId = session.profile.$id;
  const companyId = session.profile.companyId;

  loadNotifications(profileId, companyId);

  document.getElementById('btn-mark-all-read').addEventListener('click', async () => {
    await markAllNotificationsAsRead(profileId, companyId);
  });
});

/**
 * Créer une notification interne pour un utilisateur
 */
async function createNotification(companyId, userId, title, message, link = '') {
  try {
    await AppwriteConfig.databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.notifications,
      Appwrite.ID.unique(),
      {
        companyId: companyId,
        userId: userId,
        title: title,
        message: message,
        link: link,
        isRead: false,
        createdAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Erreur création notification:", error);
  }
}

/**
 * Charger la liste des notifications
 */
async function loadNotifications(profileId, companyId) {
  const container = document.getElementById('notifications-list');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.notifications,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('userId', profileId),
        Appwrite.Query.orderDesc('createdAt')
      ]
    );

    if (res.documents.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">Aucune notification pour le moment.</p>';
      return;
    }

    container.innerHTML = res.documents.map(notif => `
      <div class="notification-card ${notif.isRead ? 'read' : 'unread'}" 
           style="padding: 1rem; border-radius: 8px; background: ${notif.isRead ? '#f8fafc' : '#eff6ff'}; border-left: 4px solid ${notif.isRead ? '#cbd5e1' : 'var(--primary)'}; margin-bottom: 0.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="margin:0; font-size:1rem; color:#1e293b;">${Utils.escapeHtml(notif.title)}</h4>
          <span style="font-size:0.75rem; color:var(--text-muted);">${Utils.formatDate(notif.createdAt)}</span>
        </div>
        <p style="margin: 0.5rem 0 0 0; color: #475569; font-size:0.9rem;">${Utils.escapeHtml(notif.message)}</p>
        ${notif.link ? `<a href="${Utils.escapeHtml(notif.link)}" style="display:inline-block; margin-top:0.5rem; font-size:0.85rem; color:var(--primary);">Voir le détail →</a>` : ''}
      </div>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
async function markAllNotificationsAsRead(profileId, companyId) {
  try {
    const unread = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.notifications,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('userId', profileId),
        Appwrite.Query.equal('isRead', false)
      ]
    );

    const updates = unread.documents.map(doc => 
      AppwriteConfig.databases.updateDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.notifications,
        doc.$id,
        { isRead: true }
      )
    );

    await Promise.all(updates);
    Utils.showAlert("Toutes les notifications sont marquées comme lues.", "success");
    loadNotifications(profileId, companyId);
  } catch (error) {
    Utils.handleError(error);
  }
}