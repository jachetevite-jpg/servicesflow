/**
 * ServicesFlow - Centralisation de la Configuration Appwrite
 */

// Configuration Appwrite
const AppwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1', // Ou votre endpoint personnalisé
  projectId: '6a816edc00120f9ec3c6',
  databaseId: 'ServicesFlow', // Le nom de votre base de données dans Appwrite

  // IDs exacts de vos collections
  collections: {
    clients: 'clients',
    contracts: 'contracts',
    interventions: 'interventions',
    complaints: 'complaints',
    profiles: 'profiles',            // Assurez-vous que cette collection existe dans Appwrite
    notifications: 'notifications',  // Collection pour les notifications
    activityLogs: 'activityLogs',    // Collection pour les logs d'activité
    companies: 'companies',          // Pour le Super Admin
    subscriptions: 'subscriptions'   // Pour le Super Admin
  }
};

// Initialisation
const client = new Appwrite.Client()
  .setEndpoint(AppwriteConfig.endpoint)
  .setProject(AppwriteConfig.projectId);

AppwriteConfig.account = new Appwrite.Account(client);
AppwriteConfig.databases = new Appwrite.Databases(client);
AppwriteConfig.storage = new Appwrite.Storage(client);

// Initialisation du SDK Appwrite
const client = new Appwrite.Client();
client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

window.AppwriteConfig = {
  client,
  account,
  databases,
  storage,
  databaseId: APPWRITE_CONFIG.databaseId,
  bucketId: APPWRITE_CONFIG.bucketId,
  collections: APPWRITE_CONFIG.collections
};