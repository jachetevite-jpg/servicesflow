document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin', 'company_admin', 'admin', 'agent', 'user']);
  if (!session) return;

  loadInterventions();

  // Ouverture du modal
  const openBtn = document.getElementById('btn-open-intervention-modal');
  if (openBtn) {
    openBtn.addEventListener('click', () => openModal('modal-intervention'));
  }

  // Soumission du formulaire
  const form = document.getElementById('form-add-intervention');
  if (form) {
    form.addEventListener('submit', handleAddIntervention);
  }
});

async function handleAddIntervention(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('btn-save-intervention');
  submitBtn.disabled = true;
  submitBtn.textContent = "Création...";

  const scheduledVal = document.getElementById('intervention-date').value;

  const interventionData = {
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
    loadInterventions(); // Recharge le tableau
  } catch (error) {
    console.error("Erreur création intervention:", error);
    Utils.showToast("Erreur lors de la création : " + error.message, "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Créer";
  }
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}