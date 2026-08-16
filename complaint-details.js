document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const urlParams = new URLSearchParams(window.location.search);
  const complaintId = urlParams.get('id');

  if (!complaintId) {
    window.location.href = 'complaints.html';
    return;
  }

  try {
    const complaint = await AppwriteConfig.databases.getDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.complaints,
      complaintId
    );

    if (complaint.companyId !== session.profile.companyId) {
      Utils.showAlert("Accès non autorisé.", "error");
      window.location.href = 'complaints.html';
      return;
    }

    document.getElementById('complaint-ref-title').textContent = `Réclamation ${complaint.reference || ''}`;
    document.getElementById('status-select').value = complaint.status;

    document.getElementById('complaint-details-box').innerHTML = `
      <h2>${Utils.escapeHtml(complaint.title)}</h2>
      <p style="margin-top:0.5rem;">
        <span class="badge priority-${Utils.escapeHtml(complaint.priority)}">${Utils.escapeHtml(complaint.priority)}</span>
        <span class="badge badge-${Utils.escapeHtml(complaint.status.toLowerCase())}">${Utils.escapeHtml(complaint.status)}</span>
        <span class="badge">${Utils.escapeHtml(complaint.category)}</span>
      </p>
      <p style="margin-top:1rem; white-space: pre-wrap;">${Utils.escapeHtml(complaint.description)}</p>
      <p style="margin-top:1rem; font-size:0.8rem; color:var(--text-muted);">Créé le: ${Utils.formatDate(complaint.$createdAt)}</p>
    `;

    document.getElementById('btn-update-status').addEventListener('click', async () => {
      const newStatus = document.getElementById('status-select').value;
      try {
        await AppwriteConfig.databases.updateDocument(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.complaints,
          complaintId,
          {
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        );
        Utils.showAlert("Statut mis à jour avec succès !", "success");
      } catch (e) {
        Utils.handleError(e);
      }
    });

  } catch (error) {
    Utils.handleError(error);
  }
});