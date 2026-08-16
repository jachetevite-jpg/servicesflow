document.addEventListener('DOMContentLoaded', async () => {
  if (typeof Auth !== 'undefined') {
    const user = await Auth.checkSession();
    if (!user) return;
    
    const userDisplay = document.getElementById('user-display-name');
    if (userDisplay) userDisplay.textContent = user.name || user.email;
  }

  loadDashboardData();

  async function loadDashboardData() {
    try {
      // 1. Nombre total de clients
      const clientsRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.clients,
        [Appwrite.Query.limit(1)]
      );
      document.getElementById('stat-clients').textContent = clientsRes.total || 0;

      // 2. Interventions
      const interventionsRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.interventions,
        [Appwrite.Query.orderDesc('$createdAt'), Appwrite.Query.limit(5)]
      );
      document.getElementById('stat-interventions').textContent = interventionsRes.total || 0;
      renderRecentInterventions(interventionsRes.documents);

      // 3. Contrats
      const contractsRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.contracts,
        [Appwrite.Query.limit(1)]
      );
      document.getElementById('stat-contracts').textContent = contractsRes.total || 0;

      // 4. Réclamations
      const complaintsRes = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.complaints,
        [Appwrite.Query.limit(1)]
      );
      document.getElementById('stat-complaints').textContent = complaintsRes.total || 0;

    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord :', error);
    }
  }

  function renderRecentInterventions(interventions) {
    const tableBody = document.getElementById('recent-interventions-body');
    if (!tableBody) return;

    if (!interventions || interventions.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucune intervention récente.</td></tr>';
      return;
    }

    tableBody.innerHTML = interventions.map(item => `
      <tr>
        <td><strong>${Utils.escapeHtml(item.title || 'Sans titre')}</strong></td>
        <td>${Utils.escapeHtml(item.client_name || '-')}</td>
        <td>
          <span class="badge priority-${Utils.escapeHtml((item.priority || 'medium').toLowerCase())}">
            ${Utils.escapeHtml(item.priority || 'Normale')}
          </span>
        </td>
        <td>
          <span class="badge status-${Utils.escapeHtml((item.status || 'pending').toLowerCase())}">
            ${Utils.escapeHtml(item.status || 'En attente')}
          </span>
        </td>
        <td>${Utils.formatDate(item.scheduled_at || item.$createdAt)}</td>
      </tr>
    `).join('');
  }
});