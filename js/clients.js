document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth(['super_admin', 'company_admin', 'admin', 'agent', 'user']);
  if (!session) return;

  loadClients();

  // Ouverture du modal
  const openBtn = document.getElementById('btn-open-client-modal');
  if (openBtn) {
    openBtn.addEventListener('click', () => openModal('modal-client'));
  }

  // Soumission du formulaire
  const form = document.getElementById('form-add-client');
  if (form) {
    form.addEventListener('submit', handleAddClient);
  }
});

async function handleAddClient(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('btn-save-client');
  submitBtn.disabled = true;
  submitBtn.textContent = "Enregistrement...";

  const clientData = {
    name: document.getElementById('client-name').value.trim(),
    email: document.getElementById('client-email').value.trim(),
    phone: document.getElementById('client-phone').value.trim(),
    address: document.getElementById('client-address').value.trim()
  };

  try {
    await AppwriteConfig.databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.collections.clients,
      Appwrite.ID.unique(),
      clientData
    );

    Utils.showToast("Client ajouté avec succès !", "success");
    document.getElementById('form-add-client').reset();
    closeModal('modal-client');
    loadClients(); // Recharge le tableau
  } catch (error) {
    console.error("Erreur ajout client:", error);
    Utils.showToast("Erreur lors de la création du client : " + error.message, "danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enregistrer";
  }
}

// Utilitaires de gestion des modals
function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}