document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin']);
  if (!session) return;

  loadGlobalStats();
});

async function loadGlobalStats() {
  try {
    const companies = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.companies,
      [Appwrite.Query.orderDesc('createdAt'), Appwrite.Query.limit(5)]
    );

    const users = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.profiles
    );

    const subs = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.subscriptions,
      [Appwrite.Query.equal('status', 'active')]
    );

    document.getElementById('stat-companies').textContent = companies.total;
    document.getElementById('stat-active-subs').textContent = subs.total;
    document.getElementById('stat-users').textContent = users.total;

    const tbody = document.getElementById('recent-companies-body');
    if (companies.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Aucune entreprise inscrite.</td></tr>';
      return;
    }

    tbody.innerHTML = companies.documents.map(c => `
      <tr>
        <td><strong>${Utils.escapeHtml(c.name)}</strong></td>
        <td>${Utils.escapeHtml(c.sector || '-')}</td>
        <td><span class="badge badge-${c.status === 'active' ? 'resolved' : 'urgent'}">${Utils.escapeHtml(c.status)}</span></td>
        <td>${Utils.formatDate(c.createdAt)}</td>
      </tr>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}