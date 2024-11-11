const https = require('https');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const cosmosConfig = {
  endpoint: 'https://workon-cosmosdb.documents.azure.com:443/',
  key: process.env.COSMOS_KEY,
  agent: agent,
  database: { id: 'WorkOn' },
  plansContainer: { id: 'plans' },
  usersContainer: { id: 'users' },
};

const cosmosClient = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key,
  agent: cosmosConfig.agent,
});

let plansContainer;
let usersContainer;

module.exports.getPlansContainer = async () => {
  if (!plansContainer) {
    plansContainer = cosmosClient.database(cosmosConfig.database.id).container(cosmosConfig.plansContainer.id);
  }

  return plansContainer;
};

module.exports.getUsersContainer = async () => {
  if (!usersContainer) {
    usersContainer = cosmosClient.database(cosmosConfig.database.id).container(cosmosConfig.usersContainer.id);
  }

  return usersContainer;
};
