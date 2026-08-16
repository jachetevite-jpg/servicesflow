/* ==========================================================================
   ServiceFlow - Gestion des Paramètres de l'Entreprise
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // S'assurer que la session est chargée et réserver la page aux administrateurs
  const session = await checkSession(['company_admin']);
  if (!session) return;

  loadCompanyDetails();

  const companyForm = document.getElementById('company-settings-form');
  if (companyForm) {
    companyForm.addEventListener('submit', updateCompanyDetails);
  }
});

/**
 * Charge les informations de l'entreprise dans le formulaire
 */
function loadCompanyDetails() {
  const company = window.CurrentSession.company;
  if (!company) return;

  document.getElementById('company-name').value = company.name || '';
  document.getElementById('company-email').value = company.email || '';
  document.getElementById('company-phone').value = company.phone || '';
  document.getElementById('company-address').value = company.address || '';
  document.getElementById('company-siret').value = company.siret || '';
}

/**
 * Enregistre les modifications de l'entreprise dans Appwrite
 */
async function updateCompanyDetails(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('btn-save-company');
  const alertEl = document.getElementById('company-alert');
  
  Utils.showLoading(submitBtn, 'Enregistrement...');
  Utils.hideAlert(alertEl);

  const companyId = window.CurrentSession.company.$id;
  
  const updatedData = {
    name: document.getElementById('company-name').value.trim(),
    email: document.getElementById('company-email').value.trim(),
    phone: document.getElementById('company-phone').value.trim(),
    address: document.getElementById('company-address').value.trim(),
    siret: document.getElementById('company-siret').value.trim()
  };

  try {
    const updatedCompany = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.COMPANIES,
      companyId,
      updatedData
    );

    // Mettre à jour la session courante
    window.CurrentSession.company = updatedCompany;
    
    Utils.showAlert(alertEl, 'Les informations de l\'entreprise ont été mises à jour avec succès.', 'success');
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error);
    Utils.showAlert(alertEl, error.message || 'Impossible de mettre à jour l\'entreprise.', 'danger');
  } finally {
    Utils.hideLoading(submitBtn, 'Enregistrer les modifications');
  }
}