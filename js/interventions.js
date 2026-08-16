document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin', 'company_admin', 'admin', 'agent', 'user']);
  if (!session) return;

  loadInterventions();

  // Ouverture du modal
  const openBtn = document.getElementById('btn-open-intervention-modal');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      loadClientsDropdown(); // Recharger la liste fraîche des clients à l'ouverture
      openModal('modal-intervention');
    });
  }

  // Soumission du formulaire
  const form = document.getElementById('form-add-intervention');
  if (form) {
    form.addEventListener('submit', handleAddIntervention);
  }
});

/**
 * Charge dynamiquement la liste des clients pour le <select> du formulaire
 */
async function loadClientsDropdown() {
  const clientSelect = document.getElementById('intervention-client');
  if (!clientSelect) return;

  clientSelect.innerHTML = '<option value="">Chargement...</option>';

  try {
    const response = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.clients,
      [Appwrite.Query.orderAsc('name'), Appwrite.Query.limit(100)]
    );

    if (!response.documents || response.documents.length === 0) {
      clientSelect.innerHTML = '<option value="">Aucun client trouvé - Veuillez d\'abord en créer un</option>';
      return;
    }

    clientSelect.innerHTML = '<option value="">-- Sélectionner un client --</option>' + 
      response.documents.map(client => {
        const clientDisplayName = client.name || client.companyName || 'Client sans nom';
        return `<option value="${client.$id}" data-name="${Utils.escapeHtml(clientDisplayName)}">${Utils.escapeHtml(clientDisplayName)} (${client.email || 'Pas d\'email'})</option>`;
      }).join('');

  } catch (error) {
    console.error("Erreur chargement liste clients:", error);
    clientSelect.innerHTML = '<option value="">Erreur de chargement des clients</option>';
  }
}

/**
 * Charge la liste des interventions pour le tableau
 */
async function loadInterventions() {
  const tbody = document.getElementById('interventions-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6">Chargement des interventions...</td></tr>';

  try {
    const response = await AppwriteConfig.databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      [Appwrite.Query.orderDesc('$createdAt')]
    );

    if (!response.documents || response.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Aucune intervention enregistrée.</td></tr>';
      return;
    }

    tbody.innerHTML = response.documents.map(item => {
      const statusClass = getStatusBadgeClass(item.status);
      const formattedStatus = item.status ? item.status.replace('_', ' ') : 'N/A';

      return `
        <tr>
          <td><strong>${Utils.escapeHtml(item.clientName || item.clientId || '-')}</strong></td>
          <td>
            <strong>${Utils.escapeHtml(item.title || item.subject || 'Intervention')}</strong>
            ${item.description ? `<br><small style="color:var(--text-muted, #64748b);">${Utils.escapeHtml(item.description)}</small>` : ''}
          </td>
          <td><span class="badge ${statusClass}">${Utils.escapeHtml(formattedStatus)}</span></td>
          <td>${Utils.escapeHtml(item.technicianName || item.assignedTo || '-')}</td>
          <td>${item.scheduledAt ? Utils.formatDate(item.scheduledAt) : '-'}</td>
          <td>${Utils.formatDate(item.$createdAt)}</td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error("Erreur chargement interventions:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger, #ef4444);">Erreur: ${Utils.escapeHtml(error.message)}</td></tr>`;
  }
}

/**
 * Traitement du formulaire de création d'intervention
 */
async function handleAddIntervention(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('btn-save-intervention');
  const clientSelect = document.getElementById('intervention-client');
  const selectedOption = clientSelect.options[clientSelect.selectedIndex];

  if (!clientSelect.value) {
    Utils.showToast("Veuillez sélectionner un client.", "warning");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Création...";

  const scheduledVal = document.getElementById('intervention-date').value;

  const interventionData = {
    clientId: clientSelect.value,
    clientName: selectedOption.getAttribute('data-name') || selectedOption.text,
    title: document.getElementById('intervention-title').value.trim(),
    description: document.getElementById('intervention-description').value.trim(),
    technicianName: document.getElementById('intervention-technician').value.trim(),
    status: document.getElementById('intervention-status').value,
    scheduledAt: scheduledVal ? new Date(scheduledVal).toISOString() : null
  };

  try {
    await AppwriteConfig.databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.interventions,
      Appwrite.ID.unique(),
      interventionData
    );

    Utils.showToast("Intervention créée avec succès !", "success");
    document.getElementById('form-add-intervention').reset();
    closeModal('modal-intervention');
    loadInterventions(); // Rafraîchir le tableau
  } catch (error) {
    console.error("Erreur création intervention:", error);
    Utils.showToast("Erreur lors de la création : " + error.message, "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Créer";
  }
}

function getStatusBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'terminee':
      return 'badge-resolved';
    case 'in_progress':
    case 'en_cours':
      return 'badge-info';
    case 'pending':
    case 'en_attente':
      return 'badge-warning';
    case 'cancelled':
    case 'annulee':
      return 'badge-urgent';
    default:
      return 'badge-secondary';
  }
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}