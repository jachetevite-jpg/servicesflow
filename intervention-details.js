document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const urlParams = new URLSearchParams(window.location.search);
  const interventionId = urlParams.get('id');

  if (!interventionId) {
    window.location.href = 'interventions.html';
    return;
  }

  try {
    const intervention = await AppwriteConfig.databases.getDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      interventionId
    );

    if (intervention.companyId !== session.profile.companyId) {
      Utils.showAlert("Accès non autorisé.", "error");
      window.location.href = 'interventions.html';
      return;
    }

    let clientName = "Non spécifié";
    if (intervention.clientId) {
      try {
        const client = await AppwriteConfig.databases.getDocument(
          AppwriteConfig.databaseId, AppwriteConfig.collections.clients, intervention.clientId
        );
        clientName = `${client.firstName} ${client.lastName} (${client.phone || 'Pas de tél'}) - ${client.address || ''} ${client.city || ''}`;
      } catch (e) { console.error(e); }
    }

    document.getElementById('intervention-header').innerHTML = `
      <h2>Intervention du ${Utils.escapeHtml(intervention.scheduledDate)} à ${Utils.escapeHtml(intervention.scheduledTime || '')}</h2>
      <p style="margin-top:0.5rem;">
        <span class="badge priority-${Utils.escapeHtml(intervention.priority)}">${Utils.escapeHtml(intervention.priority)}</span>
        <span class="badge badge-${Utils.escapeHtml(intervention.status.toLowerCase().replace(' ', '_'))}">${Utils.escapeHtml(intervention.status)}</span>
      </p>
      <p style="margin-top:1rem;"><strong>Client & Adresse:</strong> ${Utils.escapeHtml(clientName)}</p>
      <p style="margin-top:0.5rem;"><strong>Description du Problème:</strong></p>
      <div style="background:#f1f5f9; padding:10px; border-radius:6px; margin-top:5px;">${Utils.escapeHtml(intervention.description)}</div>
    `;

    document.getElementById('intervention-report-content').innerHTML = `
      <p><strong>Compte Rendu :</strong> ${Utils.escapeHtml(intervention.report || 'Aucun rapport rédigé.')}</p>
      <p style="margin-top:0.5rem;"><strong>Travaux effectués :</strong> ${Utils.escapeHtml(intervention.workPerformed || 'Non renseigné.')}</p>
      <p style="margin-top:0.5rem;"><strong>Pièces utilisées :</strong> ${Utils.escapeHtml(intervention.partsUsed || 'Aucune.')}</p>
      ${intervention.startedAt ? `<p style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted);">Démarrée le: ${Utils.formatDate(intervention.startedAt)}</p>` : ''}
      ${intervention.completedAt ? `<p style="font-size:0.8rem; color:var(--text-muted);">Terminée le: ${Utils.formatDate(intervention.completedAt)}</p>` : ''}
    `;

  } catch (error) {
    Utils.handleError(error);
  }
});