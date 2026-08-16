document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin']);
  if (!session) return;

  loadSubscriptions();
});

async function loadSubscriptions() {
  const tbody = document.getElementById('subscriptions-table-body');
  try {
    const res = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.subscriptions
    );

    if (res.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Aucun abonnement enregistré.</td></tr>';
      return;
    }

    tbody.innerHTML = res.documents.map(s => `
      <tr>
        <td><code>${Utils.escapeHtml(s.companyId)}</code></td>
        <td><strong>${Utils.escapeHtml(s.plan || 'Gratuit')}</strong></td>
        <td><span class="badge badge-${s.status === 'active' ? 'resolved' : 'urgent'}">${Utils.escapeHtml(s.status)}</span></td>
        <td>${s.expiresAt ? Utils.formatDate(s.expiresAt) : 'Illimité'}</td>
        <td>
          <button class="btn btn-secondary" onclick="renewSubscription('${s.$id}')">Prolonger (30 jours)</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    Utils.handleError(error);
  }
}

async function renewSubscription(subscriptionId) {
  try {
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + 30);

    await AppwriteConfig.databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.subscriptions,
      subscriptionId,
      {
        status: 'active',
        expiresAt: nextExpiry.toISOString()
      }
    );
    Utils.showAlert("Abonnement prolongé de 30 jours !", "success");
    loadSubscriptions();
  } catch (error) {
    Utils.handleError(error);
  }
}