/**
 * ServicesFlow - Inscription Multi-tenant & Inscription Entreprise
 */

const Auth = {
  /**
   * ÉTAPE 12 du Prompt : Inscription Complète d'une entreprise et de son Administrateur
   */
  async registerCompany(data) {
    const { companyName, firstName, lastName, email, phone, password } = data;

    try {
      // 1. Créer le compte utilisateur dans Appwrite Auth
      const newUser = await AppwriteConfig.account.create(
        Appwrite.ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      );

      // 2. Connexion automatique pour établir la session
      await AppwriteConfig.account.createEmailPasswordSession(email, password);

      // 3. Créer l'entreprise dans la collection 'companies'
      const newCompany = await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.companies,
        Appwrite.ID.unique(),
        {
          name: companyName,
          email: email,
          phone: phone || '',
          plan: 'STARTER',
          subscriptionStatus: 'active',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      // 4. Créer le profil utilisateur lié dans 'profiles'
      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.profiles,
        Appwrite.ID.unique(),
        {
          userId: newUser.$id,
          companyId: newCompany.$id,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone || '',
          role: 'company_admin',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      );

      // 5. Initialiser l'abonnement par défaut (Plan STARTER)
      await AppwriteConfig.databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.collections.subscriptions,
        Appwrite.ID.unique(),
        {
          companyId: newCompany.$id,
          plan: 'STARTER',
          status: 'active',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      );

      Utils.showAlert("Compte et entreprise créés avec succès !", "success");
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (error) {
      Utils.handleError(error);
    }
  },

  /**
   * Connexion Utilisateur
   */
  async login(email, password) {
    try {
      await AppwriteConfig.account.createEmailPasswordSession(email, password);
      const sessionData = await Session.requireAuth();
      if (sessionData) {
        Session.redirectUserByRole(sessionData.profile.role);
      }
    } catch (error) {
      Utils.handleError(error);
    }
  },

  /**
   * Déconnexion
   */
  async logout() {
    try {
      await AppwriteConfig.account.deleteSession('current');
      window.location.href = 'login.html';
    } catch (error) {
      Utils.handleError(error);
    }
  }
};