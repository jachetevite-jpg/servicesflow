/**
 * Service d'Authentification ServicesFlow
 */
const Auth = {
    async checkSession() {
        try {
            const user = await AppwriteConfig.account.get();
            return user;
        } catch (error) {
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'login.html' && currentPage !== 'register.html') {
                window.location.href = 'login.html';
            }
            return null;
        }
    },

    async login(email, password) {
        try {
            const session = await AppwriteConfig.account.createEmailPasswordSession(email, password);
            window.location.href = 'index.html';
            return session;
        } catch (error) {
            console.error('Erreur de connexion :', error);
            throw error;
        }
    },

    async register(email, password, name) {
        try {
            await AppwriteConfig.account.create('unique()', email, password, name);
            await this.login(email, password);
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            throw error;
        }
    },

    async logout() {
        try {
            await AppwriteConfig.account.deleteSession('current');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
});

window.Auth = Auth;