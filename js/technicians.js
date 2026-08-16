document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['company_admin', 'super_admin']);
  if (!session) return;

  const companyId = session.profile.companyId;

  loadTechnicians(companyId);

  const modal = document.getElementById('modal-tech');
  document.getElementById('btn-open-modal-tech').addEventListener('click', () => modal.style.display = 'flex');
  document.getElementById('btn-close-tech-modal').addEventListener('click', () => modal.style.display = 'none');

  document.getElementById('form-tech').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      // Création directe du profil technicien
      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.profiles,
        Appwrite.ID.unique(),
        {
          userId: '', // Sera lié lors de la première connexion du technicien
          companyId: companyId,
          firstName: document.getElementById('t-firstName').value,
          lastName: document.getElementById('t-lastName').value,
          email: document.getElementById('t-email').value,
          phone: document.getElementById('t-phone').value,
          role: 'technician',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      );

      Utils.showAlert("Profil technicien créé !", "success");
      modal.style.display = 'none';
      loadTechnicians(companyId);
    } catch (error) {
      Utils.handleError(error);
    }
  });
});

async function loadTechnicians(companyId) {
  const tbody = document.getElementById('techs-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.profiles,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('role', 'technician')
      ]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun technicien enregistré.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(t => `
      <tr>
        <td><strong>${Utils.escapeHtml(t.firstName)} ${Utils.escapeHtml(t.lastName)}</strong></td>
        <td>${Utils.escapeHtml(t.email)}</td>
        <td>${Utils.escapeHtml(t.phone || '-')}</td>
        <td><span class="badge badge-resolved">${Utils.escapeHtml(t.status)}</span></td>
        <td>${Utils.formatDate(t.createdAt)}</td>
      </tr>
    `).join('');
  } catch (error) {
    Utils.handleError(error);
  }
}