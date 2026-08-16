document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  loadClients(session.profile.companyId);

  const modal = document.getElementById('modal-client');
  document.getElementById('btn-open-create-client').addEventListener('click', () => modal.style.display = 'flex');
  document.getElementById('btn-close-modal').addEventListener('click', () => modal.style.display = 'none');

  document.getElementById('form-client').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.clients,
        Appwrite.ID.unique(),
        {
          companyId: session.profile.companyId,
          firstName: document.getElementById('c-firstName').value,
          lastName: document.getElementById('c-lastName').value,
          companyName: document.getElementById('c-companyName').value,
          email: document.getElementById('c-email').value,
          phone: document.getElementById('c-phone').value,
          address: document.getElementById('c-address').value,
          city: document.getElementById('c-city').value,
          notes: document.getElementById('c-notes').value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      Utils.showAlert("Client créé avec succès !", "success");
      modal.style.display = 'none';
      loadClients(session.profile.companyId);
    } catch (error) {
      Utils.handleError(error);
    }
  });
});

async function loadClients(companyId) {
  const tbody = document.getElementById('clients-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.clients,
      [Appwrite.Query.equal('companyId', companyId), Appwrite.Query.orderDesc('$createdAt')]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Aucun client trouvé.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(c => `
      <tr>
        <td><strong>${Utils.escapeHtml(c.firstName)} ${Utils.escapeHtml(c.lastName)}</strong></td>
        <td>${Utils.escapeHtml(c.companyName || '-')}</td>
        <td>${Utils.escapeHtml(c.email)}</td>
        <td>${Utils.escapeHtml(c.phone || '-')}</td>
        <td>${Utils.escapeHtml(c.city || '-')}</td>
        <td><a href="client-details.html?id=${c.$id}" class="btn btn-secondary">Consulter</a></td>
      </tr>
    `).join('');
  } catch (error) {
    Utils.handleError(error);
  }
}