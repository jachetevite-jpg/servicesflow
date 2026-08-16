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
            const account = AppwriteConfig.account;

            // 1. Déconnexion préventive si une session est déjà active
            try {
                await account.deleteSession('current');
            } catch (e) {
                // Pas de session active, on peut continuer
            }

            // 2. Création de la nouvelle session
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

            // 1. Déconnexion préventive si une session est déjà active
            try {
                await account.deleteSession('current');
            } catch (e) {
                // Pas de session active, on peut continuer
            }

            // 2. Création du compte
            await account.create('unique()', email, password, name);

            // 3. Connexion automatique
            await this.login(email, password);
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            alert('Erreur d\'inscription : ' + (error.message || 'Vérifiez les informations'));
        }
    },

    async logout() {
        try {
            await AppwriteConfig.account.deleteSession('current');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erreur de déconnexion :', error);
            window.location.href = 'login.html';
        }
    }
};

window.Auth = Auth;