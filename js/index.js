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
      // 1. Clients
      try {
        const clientsRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.clients,
          [Appwrite.Query.limit(1)]
        );
        document.getElementById('stat-clients').textContent = clientsRes.total || 0;
      } catch (e) { console.warn('Collection clients non accessible'); }

      // 2. Interventions
      try {
        const interventionsRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.interventions,
          [Appwrite.Query.orderDesc('$createdAt'), Appwrite.Query.limit(5)]
        );
        document.getElementById('stat-interventions').textContent = interventionsRes.total || 0;
        renderRecentInterventions(interventionsRes.documents);
      } catch (e) {
        console.warn('Collection interventions non accessible');
        document.getElementById('recent-interventions-body').innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucune donnée disponible.</td></tr>';
      }

      // 3. Contrats
      try {
        const contractsRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.contracts,
          [Appwrite.Query.limit(1)]
        );
        document.getElementById('stat-contracts').textContent = contractsRes.total || 0;
      } catch (e) { console.warn('Collection contracts non accessible'); }

      // 4. Réclamations
      try {
        const complaintsRes = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.collections.complaints,
          [Appwrite.Query.limit(1)]
        );
        document.getElementById('stat-complaints').textContent = complaintsRes.total || 0;
      } catch (e) { console.warn('Collection complaints non accessible'); }

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques :', error);
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