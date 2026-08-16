document.addEventListener('DOMContentLoaded', async () => {
  // Collections utilisées dans le projet
  const COLLECTIONS = {
    CLIENTS: 'clients',
    INTERVENTIONS: 'interventions',
    CONTRACTS: 'contracts',
    COMPLAINTS: 'complaints'
  };

  // Éléments des compteurs
  const statClients = document.getElementById('stat-clients');
  const statInterventions = document.getElementById('stat-interventions');
  const statContracts = document.getElementById('stat-contracts');
  const statComplaints = document.getElementById('stat-complaints');

  // Lancement du chargement des données
  await loadDashboardStats();
  await loadRecentActivity();

  /**
   * Compte le nombre total de documents pour chaque module.
   */
  async function loadDashboardStats() {
    const statsConfig = [
      { element: statClients, collection: COLLECTIONS.CLIENTS },
      { element: statInterventions, collection: COLLECTIONS.INTERVENTIONS },
      { element: statContracts, collection: COLLECTIONS.CONTRACTS },
      { element: statComplaints, collection: COLLECTIONS.COMPLAINTS }
    ];

    // Exécution parallèle pour un chargement rapide
    await Promise.all(statsConfig.map(async ({ element, collection }) => {
      if (!element) return;

      try {
        const response = await AppwriteConfig.databases.listDocuments(
          AppwriteConfig.databaseId,
          collection,
          [Appwrite.Query.limit(1)] // On demande 1 seul item, seul response.total nous intéresse
        );

        animateCounter(element, response.total || 0);
      } catch (error) {
        console.warn(`Impossible de charger les stats pour ${collection}:`, error.message);
        element.textContent = '0'; // Valeur par défaut en cas d'absence de collection
      }
    }));
  }

  /**
   * Charge et injecte la liste des dernières interventions sous la grille de stats.
   */
  async function loadRecentActivity() {
    const wrapper = document.getElementById('app-wrapper');
    if (!wrapper) return;

    try {
      const response = await AppwriteConfig.databases.listDocuments(
        AppwriteConfig.databaseId,
        COLLECTIONS.INTERVENTIONS,
        [
          Appwrite.Query.orderDesc('$createdAt'),
          Appwrite.Query.limit(5)
        ]
      );

      // Injection d'une section d'activités récentes
      const activityHTML = `
        <div class="card" style="margin-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 style="font-size: 1.2rem; font-weight: 700;">Interventions Récents</h2>
            <a href="interventions.html" class="btn btn-outline btn-sm">Voir tout</a>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${renderRecentRows(response.documents)}
              </tbody>
            </table>
          </div>
        </div>
      `;

      wrapper.insertAdjacentHTML('beforeend', activityHTML);
    } catch (error) {
      // Masqué silencieusement si la collection interventions n'existe pas encore
      console.log('Pas d\'activité récente à afficher :', error.message);
    }
  }

  /**
   * Génère le HTML pour les lignes des activités récentes.
   */
  function renderRecentRows(documents) {
    if (!documents || documents.length === 0) {
      return '<tr><td colspan="3" class="text-center text-muted">Aucune intervention récente.</td></tr>';
    }

    return documents.map(doc => `
      <tr>
        <td><strong>${Utils.escapeHtml(doc.title || doc.name || 'Intervention sans titre')}</strong></td>
        <td>
          <span class="badge status-${Utils.escapeHtml((doc.status || 'pending').toLowerCase())}">
            ${Utils.escapeHtml(doc.status || 'En attente')}
          </span>
        </td>
        <td>${Utils.formatDate(doc.$createdAt)}</td>
      </tr>
    `).join('');
  }

  /**
   * Animation fluide des chiffres des statistiques.
   */
  function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 15) || 1;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = current;
      }
    }, 30);
  }
});