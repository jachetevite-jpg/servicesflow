/**
 * ServicesFlow - Centralisation de la Configuration Appwrite
 */

const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: '6a80da27000954d85947',
  databaseId: 'serviceflow_db',
  bucketId: 'serviceflow-files',
  collections: {
    companies: 'companies',
    profiles: 'profiles',
    clients: 'clients',
    complaints: 'complaints',
    interventions: 'interventions',
    attachments: 'attachments',
    notifications: 'notifications',
    subscriptions: 'subscriptions',
    activity_logs: 'activity_logs'
  }
};

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