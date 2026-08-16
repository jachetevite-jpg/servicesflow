document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['technician', 'company_admin', 'super_admin']);
  if (!session) return;

  loadMyInterventions(session.profile.$id, session.profile.companyId);
});

async function loadMyInterventions(techProfileId, companyId) {
  const container = document.getElementById('my-interventions-list');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      [
        Appwrite.Query.equal('companyId', companyId),
        Appwrite.Query.equal('technicianId', techProfileId),
        Appwrite.Query.orderDesc('scheduledDate')
      ]
    );

    if (res.documents.length === 0) {
      container.innerHTML = '<div class="section-card"><p>Aucune intervention assignée.</p></div>';
      return;
    }

    // Récupérer les clients pour afficher l'adresse et le téléphone
    const clientsRes = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId, AppwriteConfig.collections.clients, [Appwrite.Query.equal('companyId', companyId)]
    );
    const clientMap = new Map(clientsRes.documents.map(c => [c.$id, c]));

    container.innerHTML = res.documents.map(i => {
      const client = clientMap.get(i.clientId) || {};
      return `
        <div class="section-card" style="border-left: 5px solid var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>${Utils.escapeHtml(i.scheduledDate)} à ${Utils.escapeHtml(i.scheduledTime || '')}</h3>
            <span class="badge badge-${Utils.escapeHtml(i.status.toLowerCase().replace(' ', '_'))}">${Utils.escapeHtml(i.status)}</span>
          </div>
          
          <div style="margin-top:0.75rem;">
            <p><strong>Client:</strong> ${Utils.escapeHtml(client.firstName || '')} ${Utils.escapeHtml(client.lastName || 'Inconnu')}</p>
            <p><strong>Tél:</strong> <a href="tel:${Utils.escapeHtml(client.phone || '')}">${Utils.escapeHtml(client.phone || 'Non renseigné')}</a></p>
            <p><strong>Adresse:</strong> ${Utils.escapeHtml(client.address || '')} ${Utils.escapeHtml(client.city || '')}</p>
            <p style="margin-top:0.5rem;"><strong>Problème:</strong> ${Utils.escapeHtml(i.description)}</p>
          </div>

          <div style="margin-top:1rem; display:flex; gap:10px; flex-wrap:wrap;">
            ${i.status === 'Programmée' ? `<button class="btn btn-primary" onclick="startIntervention('${i.$id}')">Démarrer</button>` : ''}
            ${i.status === 'En cours' ? `<button class="btn btn-secondary" onclick="openReportModal('${i.$id}')">Rédiger Rapport</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}

async function startIntervention(id) {
  try {
    await AppwriteConfig.databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      id,
      {
        status: 'En cours',
        startedAt: new Date().toISOString()
      }
    );
    Utils.showAlert("Intervention démarrée !", "success");
    location.reload();
  } catch (e) {
    Utils.handleError(e);
  }
}

function openReportModal(id) {
  document.getElementById('report-intervention-id').value = id;
  document.getElementById('modal-tech-report').style.display = 'flex';
}

async function submitReport() {
  const id = document.getElementById('report-intervention-id').value;
  const report = document.getElementById('tech-report-text').value;
  const work = document.getElementById('tech-work-text').value;
  const parts = document.getElementById('tech-parts-text').value;

  try {
    await AppwriteConfig.databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      id,
      {
        report: report,
        workPerformed: work,
        partsUsed: parts,
        status: 'Terminée',
        completedAt: new Date().toISOString()
      }
    );
    Utils.showAlert("Intervention clôturée avec succès !", "success");
    document.getElementById('modal-tech-report').style.display = 'none';
    location.reload();
  } catch (e) {
    Utils.handleError(e);
  }
}