const Auth = {
    async checkSession() {
        try {
            const user = await AppwriteConfig.account.get();
            return user;
        } catch (error) {
            const path = window.location.pathname;
            const currentPage = path.substring(path.lastIndexOf('/') + 1);
            
            // Éviter les redirections infinies
            if (currentPage !== 'login.html' && currentPage !== 'register.html') {
                window.location.href = 'login.html';
            }
            return null;
        }
    },

    async login(email, password) {
        try {
            const account = AppwriteConfig.account;

            // Déconnexion préventive si une session résiduelle existe
            try {
                await account.deleteSession('current');
            } catch (e) {}

            if (typeof account.createEmailPasswordSession === 'function') {
                await account.createEmailPasswordSession(email, password);
            } else if (typeof account.createEmailSession === 'function') {
                await account.createEmailSession(email, password);
            } else {
                await account.createSession(email, password);
            }

            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erreur de connexion :', error);
            alert('Erreur de connexion : ' + (error.message || 'Identifiants invalides'));
        }
    },

    async register(email, password, name) {
        try {
            const account = AppwriteConfig.account;

            try {
                await account.deleteSession('current');
            } catch (e) {}

            await account.create('unique()', email, password, name);
            await this.login(email, password);
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            alert('Erreur d\'inscription : ' + (error.message || 'Vérifiez vos informations'));
        }
    },

    async logout() {
        try {
            await AppwriteConfig.account.deleteSession('current');
        } catch (error) {
            console.error('Erreur de déconnexion :', error);
        } finally {
            window.location.href = 'login.html';
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