document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin']);
  if (!session) return;

  loadCompanies();
});

async function loadCompanies() {
  const tbody = document.getElementById('companies-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.companies,
      [Appwrite.Query.orderDesc('createdAt')]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucune entreprise trouvée.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(c => `
      <tr>
        <td><strong>${Utils.escapeHtml(c.name)}</strong></td>
        <td>${Utils.escapeHtml(c.sector || '-')}</td>
        <td>${Utils.escapeHtml(c.email || '-')}</td>
        <td><span class="badge badge-${c.status === 'active' ? 'resolved' : 'urgent'}">${Utils.escapeHtml(c.status)}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="toggleCompanyStatus('${c.$id}', '${c.status}')">
            ${c.status === 'active' ? 'Désactiver' : 'Activer'}
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}

async function toggleCompanyStatus(companyId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  if (!confirm(`Changer le statut de cette entreprise en "${newStatus}" ?`)) return;

  try {
    await AppwriteConfig.databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.companies,
      companyId,
      { status: newStatus }
    );
    Utils.showAlert(`Statut mis à jour : ${newStatus}`, "success");
    loadCompanies();
  } catch (error) {
    Utils.handleError(error);
  }
}