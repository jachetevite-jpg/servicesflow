document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const companyId = session.profile.companyId;

  loadComplaints(companyId);
  loadClientSelectOptions(companyId);

  const modal = document.getElementById('modal-complaint');
  document.getElementById('btn-open-modal-complaint').addEventListener('click', () => modal.style.display = 'flex');
  document.getElementById('btn-close-complaint-modal').addEventListener('click', () => modal.style.display = 'none');

  document.getElementById('form-complaint').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const refCountRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId, AppwriteConfig.collections.complaints,
        [Appwrite.Query.equal('companyId', companyId)]
      );
      const nextRef = `REC-${String(refCountRes.total + 1).padStart(5, '0')}`;

      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.complaints,
        Appwrite.ID.unique(),
        {
          companyId: companyId,
          clientId: document.getElementById('cmp-clientId').value,
          reference: nextRef,
          title: document.getElementById('cmp-title').value,
          description: document.getElementById('cmp-description').value,
          priority: document.getElementById('cmp-priority').value,
          status: 'Nouvelle',
          category: document.getElementById('cmp-category').value,
          createdBy: session.user.$id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      Utils.showAlert("Réclamation enregistrée !", "success");
      modal.style.display = 'none';
      loadComplaints(companyId);
    } catch (error) {
      Utils.handleError(error);
    }
  });
});

async function loadClientSelectOptions(companyId) {
  const select = document.getElementById('cmp-clientId');
  try {
    const clients = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.clients,
      [Appwrite.Query.equal('companyId', companyId)]
    );
    select.innerHTML = '<option value="">Sélectionner un client...</option>' + 
      clients.documents.map(c => `<option value="${c.$id}">${Utils.escapeHtml(c.firstName)} ${Utils.escapeHtml(c.lastName)}</option>`).join('');
  } catch (e) {
    console.error(e);
  }
}

async function loadComplaints(companyId) {
  const tbody = document.getElementById('complaints-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.complaints,
      [Appwrite.Query.equal('companyId', companyId), Appwrite.Query.orderDesc('$createdAt')]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Aucune réclamation trouvée.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(c => `
      <tr>
        <td><strong>${Utils.escapeHtml(c.reference || 'REC-00000')}</strong></td>
        <td>${Utils.escapeHtml(c.title)}</td>
        <td>${Utils.escapeHtml(c.category)}</td>
        <td><span class="badge priority-${Utils.escapeHtml(c.priority)}">${Utils.escapeHtml(c.priority)}</span></td>
        <td><span class="badge badge-${Utils.escapeHtml(c.status.toLowerCase())}">${Utils.escapeHtml(c.status)}</span></td>
        <td>${Utils.formatDate(c.$createdAt)}</td>
        <td><a href="complaint-details.html?id=${c.$id}" class="btn btn-secondary">Détails</a></td>
      </tr>
    `).join('');
  } catch (error) {
    Utils.handleError(error);
  }
}