/* ==========================================================================
   ServiceFlow - Utilitaires Globaux & Gestionnaires d'Erreurs
   ========================================================================== */

const Utils = {
  /**
   * Affiche une alerte stylisée dans un conteneur HTML donné
   * @param {string} containerId - ID de l'élément conteneur
   * @param {string} message - Message à afficher
   * @param {string} type - 'danger', 'success', 'warning', 'info'
   */
  showAlert(containerId, message, type = 'danger') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="alert alert-${type}">
        ${Utils.escapeHtml(message)}
      </div>
    `;
  },

  /**
   * Efface l'alerte d'un conteneur
   * @param {string} containerId 
   */
  clearAlert(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
  },

  /**
   * Traduit et filtre les erreurs techniques Appwrite en messages clairs
   * @param {Error|object} error - Erreur renvoyée par Appwrite ou JS
   * @returns {string} Message d'erreur formaté pour l'utilisateur
   */
  handleAppwriteError(error) {
    console.error('[ServiceFlow Error Detail]:', error);

    if (!error) return "Une erreur inattendue est survenue.";

    const code = error.code || error.status;
    const type = error.type;

    switch (code) {
      case 401:
        if (type === 'user_invalid_credentials') {
          return "Email ou mot de passe incorrect.";
        }
        if (type === 'user_session_not_found') {
          return "Votre session a expiré. Veuillez vous reconnecter.";
        }
        return "Vous devez être connecté pour effectuer cette action.";

      case 403:
        return "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.";

      case 404:
        return "La ressource demandée est introuvable.";

      case 409:
        if (type === 'user_already_exists') {
          return "Un compte existe déjà avec cette adresse email.";
        }
        return "Une conflit est survenu avec une donnée existante.";

      case 429:
        return "Trop de tentatives enregistrées. Veuillez patienter un moment avant de réessayer.";

      default:
        if (error.message && !error.message.includes('Fetch') && !error.message.includes('AppwriteException')) {
          return error.message;
        }
        return "Connexion au serveur impossible. Vérifiez votre réseau et réessayez.";
    }
  },

  /**
   * Échappe les caractères HTML spéciaux pour prévenir les XSS
   * @param {string} str 
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Formate une date ISO en chaîne lisible (ex: 15/08/2026 à 14:30)
   * @param {string} isoDate 
   * @returns {string}
   */
  formatDate(isoDate) {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Formate une date ISO avec l'heure (ex: 15/08/2026 14:30)
   * @param {string} isoDate 
   * @returns {string}
   */
  formatDateTime(isoDate) {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Active ou désactive l'état de chargement d'un bouton
   * @param {HTMLButtonElement|string} btn - Élément bouton ou ID
   * @param {boolean} isLoading 
   * @param {string} originalText 
   */
  setButtonLoading(btn, isLoading, originalText = 'Enregistrer') {
    const buttonElement = typeof btn === 'string' ? document.getElementById(btn) : btn;
    if (!buttonElement) return;

    if (isLoading) {
      buttonElement.disabled = true;
      buttonElement.setAttribute('data-original-text', buttonElement.innerHTML);
      buttonElement.innerHTML = `<span class="spinner"></span> Traitement...`;
    } else {
      buttonElement.disabled = false;
      const oldText = buttonElement.getAttribute('data-original-text');
      buttonElement.innerHTML = oldText || originalText;
    }
  }
};