const { Client, Account, Databases, Query } = window.Appwrite;

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6a80da27000954d85947');

const account = new Account(client);
const databases = new Databases(client);

const AppwriteConfig = {
    client,
    account,
    databases,
    databaseId: '6a80da27000954d85947',
    collections: {
        clients: 'clients',
        interventions: 'interventions',
        contracts: 'contracts',
        complaints: 'complaints'
    }
};

window.AppwriteConfig = AppwriteConfig;