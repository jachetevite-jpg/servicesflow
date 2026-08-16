document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const dbId = AppwriteConfig.databaseId;
  const cols = AppwriteConfig.collections;
  const companyId = session.profile.companyId;

  try {
    const clientsRes = await AppwriteConfig.databases.listDocuments(
      dbId, cols.clients, [Appwrite.Query.equal('companyId', companyId), Appwrite.Query.limit(1)]
    );
    document.getElementById('stat-clients').textContent = clientsRes.total;

    const openComplaintsRes = await AppwriteConfig.databases.listDocuments(
      dbId, cols.complaints, [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.notEqual('status', 'Closed'),
        Appwrite.Query.limit(1)
      ]
    );
    document.getElementById('stat-complaints-open').textContent = openComplaintsRes.total;

    const todayStr = new Date().toISOString().split('T')[0];
    const interventionsRes = await AppwriteConfig.databases.listDocuments(
      dbId, cols.interventions, [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('scheduledDate', todayStr),
        Appwrite.Query.limit(1)
      ]
    );
    document.getElementById('stat-interventions-today').textContent = interventionsRes.total;

    const techsRes = await AppwriteConfig.databases.listDocuments(
      dbId, cols.profiles, [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('role', 'technician'),
        Appwrite.Query.equal('status', 'active'),
        Appwrite.Query.limit(1)
      ]
    );
    document.getElementById('stat-technicians-active').textContent = techsRes.total;

    const recentComplaints = await AppwriteConfig.databases.listDocuments(
      dbId, cols.complaints, [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.orderDesc('$createdAt'),
        Appwrite.Query.limit(5)
      ]
    );

    const tbody = document.getElementById('dashboard-recent-complaints');
    if (recentComplaints.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucune réclamation récente.</td></tr>';
    } else {
      tbody.innerHTML = recentComplaints.documents.map(c => `
        <tr>
          <td><a href="complaint-details.html?id=${c.$id}"><strong>${Utils.escapeHtml(c.reference || 'REC-00000')}</strong></a></td>
          <td>${Utils.escapeHtml(c.title)}</td>
          <td><span class="badge priority-${Utils.escapeHtml(c.priority)}">${Utils.escapeHtml(c.priority)}</span></td>
          <td><span class="badge badge-${Utils.escapeHtml(c.status.toLowerCase())}">${Utils.escapeHtml(c.status)}</span></td>
          <td>${Utils.formatDate(c.$createdAt)}</td>
        </tr>
      `).join('');
    }

  } catch (error) {
    Utils.handleError(error);
  }
});