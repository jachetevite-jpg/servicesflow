document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin']);
  if (!session) return;

  loadAllUsers();
});

async function loadAllUsers() {
  const tbody = document.getElementById('users-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.profiles,
      [Appwrite.Query.orderDesc('createdAt')]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun profil utilisateur.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(u => `
      <tr>
        <td><strong>${Utils.escapeHtml(u.firstName)} ${Utils.escapeHtml(u.lastName)}</strong></td>
        <td>${Utils.escapeHtml(u.email)}</td>
        <td><span class="badge badge-resolved">${Utils.escapeHtml(u.role)}</span></td>
        <td><code>${Utils.escapeHtml(u.companyId || 'N/A')}</code></td>
        <td>${Utils.formatDate(u.createdAt)}</td>
      </tr>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}