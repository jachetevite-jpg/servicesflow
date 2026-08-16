document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');

  if (!clientId) {
    window.location.href = 'clients.html';
    return;
  }

  try {
    const client = await AppwriteConfig.databases.getDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.clients,
      clientId
    );

    if (client.companyId !== session.profile.companyId) {
      Utils.showAlert("Accès non autorisé à ce client.", "error");
      window.location.href = 'clients.html';
      return;
    }

    document.getElementById('client-info').innerHTML = `
      <h2>${Utils.escapeHtml(client.firstName)} ${Utils.escapeHtml(client.lastName)}</h2>
      <p style="margin-top:0.5rem;"><strong>Entreprise:</strong> ${Utils.escapeHtml(client.companyName || '-')}</p>
      <p><strong>Email:</strong> ${Utils.escapeHtml(client.email)} | <strong>Tél:</strong> ${Utils.escapeHtml(client.phone || '-')}</p>
      <p><strong>Adresse:</strong> ${Utils.escapeHtml(client.address || '-')} ${Utils.escapeHtml(client.city || '')}</p>
      <p style="margin-top:0.5rem; color: var(--text-muted);"><strong>Notes:</strong> ${Utils.escapeHtml(client.notes || 'Aucune note.')}</p>
    `;

    const complaints = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.complaints,
      [
        Appwrite.Query.equal('companyId', session.profile.companyId),
        Appwrite.Query.equal('clientId', clientId)
      ]
    );

    const tbody = document.getElementById('client-complaints-tbody');
    if (complaints.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Aucune réclamation enregistrée.</td></tr>';
    } else {
      tbody.innerHTML = complaints.documents.map(c => `
        <tr>
          <td><a href="complaint-details.html?id=${c.$id}"><strong>${Utils.escapeHtml(c.reference || 'REC-00000')}</strong></a></td>
          <td>${Utils.escapeHtml(c.title)}</td>
          <td><span class="badge priority-${Utils.escapeHtml(c.priority)}">${Utils.escapeHtml(c.priority)}</span></td>
          <td><span class="badge badge-${Utils.escapeHtml(c.status.toLowerCase())}">${Utils.escapeHtml(c.status)}</span></td>
        </tr>
      `).join('');
    }

  } catch (error) {
    Utils.handleError(error);
  }
});