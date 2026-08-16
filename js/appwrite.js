/* ==========================================================================
   ServiceFlow - Initialisation & Configuration Appwrite SDK
   ========================================================================== */

// Configuration centralisée des identifiants publics Appwrite Cloud
const APPWRITE_CONFIG = {
  ENDPOINT: 'https://cloud.appwrite.io/v1',
  PROJECT_ID: '6a80da27000954d85947', // Remplacez par votre Project ID Appwrite Cloud
  DATABASE_ID: 'servicesflow_db',
  
  // Collections
  COLLECTIONS: {
    COMPANIES: 'companies',
    PROFILES: 'profiles',
    CLIENTS: 'clients',
    COMPLAINTS: 'complaints',
    INTERVENTIONS: 'interventions',
    ATTACHMENTS: 'attachments',
    NOTIFICATIONS: 'notifications',
    SUBSCRIPTIONS: 'subscriptions',
    ACTIVITY_LOGS: 'activity_logs'
  },

  // Buckets de stockage
  BUCKETS: {
    FILES: 'serviceflow-files'
  }
};

// Instanciation du client Appwrite Web SDK
const { Client, Account, Databases, Storage, Functions, Query, ID } = window.Appwrite || {};

if (!window.Appwrite) {
  console.error("Le SDK Appwrite n'est pas chargé. Assurez-vous d'inclure le CDN Appwrite.");
}

const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

// Exportation des instances de services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);