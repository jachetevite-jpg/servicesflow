document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['company_admin', 'super_admin']);
  if (!session) return;

  loadActivityLogs(session.profile.companyId);
});

/**
 * Service centralisé pour enregistrer un log d'activité
 */
async function logActivity(companyId, userId, userName, action, entity, entityId, details = '') {
  try {
    await AppwriteConfig.databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.activityLogs,
      Appwrite.ID.unique(),
      {
        companyId: companyId,
        userId: userId,
        userName: userName,
        action: action, // ex: CREATE, UPDATE, DELETE, LOGIN
        entity: entity, // ex: CLIENT, COMPLAINT, INTERVENTION
        entityId: entityId || '',
        details: details,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error("Erreur enregistrement log d'activité:", error);
  }
}

/**
 * Charger et afficher le tableau des logs d'activité
 */
async function loadActivityLogs(companyId) {
  const tbody = document.getElementById('logs-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.activityLogs,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.orderDesc('timestamp'),
        Appwrite.Query.limit(100)
      ]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun événement enregistré.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(log => `
      <tr>
        <td>${Utils.formatDate(log.timestamp)}</td>
        <td><strong>${Utils.escapeHtml(log.userName || 'Système')}</strong></td>
        <td><span class="badge badge-log-${log.action.toLowerCase()}">${Utils.escapeHtml(log.action)}</span></td>
        <td>${Utils.escapeHtml(log.entity)}</td>
        <td style="font-size:0.85rem; color:#475569;">${Utils.escapeHtml(log.details || '-')}</td>
      </tr>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}