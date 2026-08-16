document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const companyId = session.profile.companyId;

  loadInterventions(companyId);
  loadFormDropdowns(companyId);

  const modal = document.getElementById('modal-intervention');
  document.getElementById('btn-open-modal-intervention').addEventListener('click', () => modal.style.display = 'flex');
  document.getElementById('btn-close-intervention-modal').addEventListener('click', () => modal.style.display = 'none');

  document.getElementById('form-intervention').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const complaintId = document.getElementById('int-complaintId').value;

      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.interventions,
        Appwrite.ID.unique(),
        {
          companyId: companyId,
          clientId: document.getElementById('int-clientId').value,
          complaintId: complaintId || '',
          technicianId: document.getElementById('int-technicianId').value,
          scheduledDate: document.getElementById('int-date').value,
          scheduledTime: document.getElementById('int-time').value,
          priority: document.getElementById('int-priority').value,
          status: 'Programmée',
          description: document.getElementById('int-description').value,
          report: '',
          workPerformed: '',
          partsUsed: '',
          createdAt: new Date().toISOString()
        }
      );

      // Mettre à jour la réclamation si elle a été liée
      if (complaintId) {
        await AppwriteConfig.databases.updateDocument(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.complaints,
          complaintId,
          {
            status: 'Intervention programmée',
            updatedAt: new Date().toISOString()
          }
        );
      }

      Utils.showAlert("Intervention programmée avec succès !", "success");
      modal.style.display = 'none';
      loadInterventions(companyId);
    } catch (error) {
      Utils.handleError(error);
    }
  });
});

async function loadFormDropdowns(companyId) {
  try {
    const clients = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.clients,
      [Appwrite.Query.equal('companyId', companyId)]
    );
    document.getElementById('int-clientId').innerHTML = '<option value="">Sélectionner un client...</option>' + 
      clients.documents.map(c => `<option value="${c.$id}">${Utils.escapeHtml(c.firstName)} ${Utils.escapeHtml(c.lastName)}</option>`).join('');

    const complaints = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.complaints,
      [Appwrite.Query.equal('companyId', companyId), Appwrite.Query.notEqual('status', 'Clôturée')]
    );
    document.getElementById('int-complaintId').innerHTML = '<option value="">Aucune réclamation</option>' + 
      complaints.documents.map(c => `<option value="${c.$id}">${Utils.escapeHtml(c.reference || 'REC')} - ${Utils.escapeHtml(c.title)}</option>`).join('');

    const techs = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.profiles,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('role', 'technician')
      ]
    );
    document.getElementById('int-technicianId').innerHTML = '<option value="">Sélectionner un technicien...</option>' + 
      techs.documents.map(t => `<option value="${t.$id}">${Utils.escapeHtml(t.firstName)} ${Utils.escapeHtml(t.lastName)}</option>`).join('');

  } catch (error) {
    console.error("Erreur de chargement des listes déroulantes", error);
  }
}

async function loadInterventions(companyId) {
  const tbody = document.getElementById('interventions-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      [Appwrite.Query.equal('companyId', companyId), Appwrite.Query.orderDesc('scheduledDate')]
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Aucune intervention programmée.</td></tr>';
      return;
    }

    // Précharger les clients et techniciens pour mapper les noms
    const clientsRes = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.clients, [Appwrite.Query.equal('companyId', companyId)]
    );
    const clientMap = new Map(clientsRes.documents.map(c => [c.$id, `${c.firstName} ${c.lastName}`]));

    const techsRes = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.profiles, [Appwrite.Query.equal('companyId', companyId)]
    );
    const techMap = new Map(techsRes.documents.map(t => [t.$id, `${t.firstName} ${t.lastName}`]));

    tbody.innerHTML = res.documents.map(i => `
      <tr>
        <td><strong>${Utils.escapeHtml(i.scheduledDate)} ${Utils.escapeHtml(i.scheduledTime || '')}</strong></td>
        <td>${Utils.escapeHtml(clientMap.get(i.clientId) || 'Client Inconnu')}</td>
        <td>${Utils.escapeHtml(techMap.get(i.technicianId) || 'Non assigné')}</td>
        <td><span class="badge priority-${Utils.escapeHtml(i.priority)}">${Utils.escapeHtml(i.priority)}</span></td>
        <td><span class="badge badge-${Utils.escapeHtml(i.status.toLowerCase().replace(' ', '_'))}">${Utils.escapeHtml(i.status)}</span></td>
        <td><a href="intervention-details.html?id=${i.$id}" class="btn btn-secondary">Consulter</a></td>
      </tr>
    `).join('');
  } catch (error) {
    Utils.handleError(error);
  }
}