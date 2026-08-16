/**
 * ServicesFlow - Fonctions Utilitaires Globales & Gestionnaires d'erreurs
 */

const Utils = {
  /**
   * Échapper les chaînes pour prévenir les failles XSS
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
   * Formater une date ISO au format FR
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Notification Toast / Alerte Utilisateur
   */
  showAlert(message, type = 'error') {
    let alertContainer = document.getElementById('toast-container');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'toast-container';
      alertContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(alertContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `padding: 12px 20px; border-radius: 6px; color: #fff; background-color: ${type === 'error' ? '#ef4444' : '#10b981'}; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; font-size: 14px; transition: all 0.3s ease;`;
    toast.textContent = message;

    alertContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  },

  /**
   * Traduction centralisée des erreurs Appwrite pour l'utilisateur
   */
  handleError(error) {
    console.error('Appwrite Error Details:', error);
    let userMsg = "Une erreur inattendue est survenue. Veuillez réessayer.";

    if (error && error.code) {
      switch (error.code) {
        case 401:
          userMsg = "Email ou mot de passe incorrect, ou session expirée.";
          break;
        case 409:
          userMsg = "Un compte avec cette adresse email existe déjà.";
          break;
        case 403:
          userMsg = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
          break;
        case 404:
          userMsg = "La ressource demandée est introuvable.";
          break;
        default:
          if (error.message) userMsg = error.message;
      }
    }
    this.showAlert(userMsg, 'error');
  }
};

// À placer dans js/utils.js
const Utils = {
  // ... vos autres fonctions d'utilitaires

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  }
};