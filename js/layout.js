/* ==========================================================================
   ServiceFlow - Générateur de Layout Dynamique (Header, Sidebar, Navigation)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Ignorer l'injection de la mise en page sur les pages publiques
  const publicPages = ['index.html', 'login.html', 'register.html', 'forgot-password.html', 'reset-password.html'];
  const isPublic = publicPages.some(page => window.location.pathname.endsWith(page));

  if (isPublic) return;

  // S'assurer que la session est initialisée
  if (!window.CurrentSession || !window.CurrentSession.isLoggedIn) {
    await checkSession();
  }

  if (window.CurrentSession.isLoggedIn) {
    renderLayout();
  }
});

/**
 * Injecte le Header et la Sidebar réutilisables dans la page
 */
function renderLayout() {
  const { profile, company } = window.CurrentSession;
  const currentPath = window.location.pathname;
  const isAdmin = profile.role === 'super_admin';

  // Conteneur principal
  const appWrapper = document.getElementById('app-wrapper');
  if (!appWrapper) return;

  // Sidebar navigation links selon le rôle
  let navItems = [];

  if (isAdmin) {
    navItems = [
      { label: 'Tableau de bord', href: '/admin/index.html', icon: '📊' },
      { label: 'Entreprises', href: '/admin/companies.html', icon: '🏢' },
      { label: 'Utilisateurs', href: '/admin/users.html', icon: '👥' },
      { label: 'Abonnements', href: '/admin/subscriptions.html', icon: '💳' },
      { label: 'Journaux d\'activité', href: '/admin/activity.html', icon: '📜' },
      { label: 'Paramètres Globaux', href: '/admin/settings.html', icon: '⚙️' }
    ];
  } else {
    navItems = [
      { label: 'Dashboard', href: '/dashboard.html', icon: '🏠', roles: ['company_admin', 'agent', 'technician'] },
      { label: 'Clients', href: '/clients.html', icon: '👥', roles: ['company_admin', 'agent'] },
      { label: 'Réclamations', href: '/complaints.html', icon: '⚠️', roles: ['company_admin', 'agent'] },
      { label: 'Interventions', href: '/interventions.html', icon: '🛠️', roles: ['company_admin', 'agent', 'technician'] },
      { label: 'Techniciens', href: '/technicians.html', icon: '👷', roles: ['company_admin', 'agent'] },
      { label: 'Utilisateurs', href: '/users.html', icon: '🔐', roles: ['company_admin'] },
      { label: 'Notifications', href: '/notifications.html', icon: '🔔', roles: ['company_admin', 'agent', 'technician'] },
      { label: 'Mon Profil', href: '/profile.html', icon: '👤', roles: ['company_admin', 'agent', 'technician'] },
      { label: 'Paramètres', href: '/settings.html', icon: '⚙️', roles: ['company_admin'] }
    ];

    // Filtrer selon le rôle de l'utilisateur
    navItems = navItems.filter(item => item.roles.includes(profile.role));
  }

  // HTML du Sidebar
  const sidebarHtml = `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-title">ServiceFlow</span>
      </div>
      
      ${company ? `<div class="company-badge" title="${Utils.escapeHtml(company.name)}">${Utils.escapeHtml(company.name)}</div>` : ''}

      <nav class="sidebar-menu">
        <ul>
          ${navItems.map(item => {
            const isActive = currentPath.endsWith(item.href) ? 'active' : '';
            return `
              <li>
                <a href="${item.href}" class="nav-item ${isActive}">
                  <span class="nav-icon">${item.icon}</span>
                  <span class="nav-label">${item.label}</span>
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </nav>
    </aside>
  `;

  // HTML du Header
  const headerHtml = `
    <header class="top-header">
      <button class="mobile-toggle" id="btn-toggle-sidebar" aria-label="Menu">☰</button>
      
      <div class="header-search">
        <input type="text" placeholder="Rechercher un client, ticket..." class="form-control-sm">
      </div>

      <div class="header-user-menu">
        <a href="/notifications.html" class="notification-btn" aria-label="Notifications">
          🔔 <span class="badge-dot hidden" id="unread-notif-badge"></span>
        </a>

        <div class="user-profile-info">
          <span class="user-name">${Utils.escapeHtml(profile.firstName)} ${Utils.escapeHtml(profile.lastName)}</span>
          <span class="user-role-tag">${formatRoleTag(profile.role)}</span>
        </div>

        <button onclick="logout()" class="btn btn-secondary btn-sm" title="Déconnexion">
          Déconnexion
        </button>
      </div>
    </header>
  `;

  // Injecter la structure dans l'élément d'emballage
  const existingContent = appWrapper.innerHTML;
  appWrapper.innerHTML = `
    <div class="layout-container">
      ${sidebarHtml}
      <div class="main-layout">
        ${headerHtml}
        <main class="page-content">
          ${existingContent}
        </main>
      </div>
    </div>
  `;

  // Écouteur pour le toggle sidebar mobile
  const toggleBtn = document.getElementById('btn-toggle-sidebar');
  const sidebarEl = document.getElementById('app-sidebar');
  if (toggleBtn && sidebarEl) {
    toggleBtn.addEventListener('click', () => {
      sidebarEl.classList.toggle('open');
    });
  }
}

/**
 * Libellé propre pour l'affichage des rôles
 */
function formatRoleTag(role) {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'company_admin': return 'Admin';
    case 'agent': return 'Agent';
    case 'technician': return 'Technicien';
    default: return role;
  }
}