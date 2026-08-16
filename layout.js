document.addEventListener('DOMContentLoaded', async () => {
  const session = await Session.requireAuth();
  if (!session) return;

  const userDisplayName = document.getElementById('user-display-name');
  if (userDisplayName) {
    userDisplayName.textContent = `${session.profile.firstName} ${session.profile.lastName} (${session.profile.role})`;
  }

  const companyDisplayName = document.getElementById('company-display-name');
  if (companyDisplayName && session.company) {
    companyDisplayName.textContent = session.company.name;
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }
});