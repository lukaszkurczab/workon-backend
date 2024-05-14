const { v4: uuidv4 } = require('uuid');
const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const cosmosConfigModule = require('../cosmosConfig');

const getHistoryContainer = async () => getContainer(cosmosConfigModule.getHistoryContainer);

const queryHistory = async () => {
  const operation = async () => {
    const container = await getHistoryContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  };
  return safelyPerformDatabaseOperation(operation);
};

const createHistoryItem = async newHistoryItem => {
  const operation = async () => {
    const container = await getHistoryContainer();
    const id = uuidv4();
    const historyItemToAdd = { id, ...newHistoryItem };
    const { resource: createdItem } = await container.items.create(historyItemToAdd);
    return createdItem;
  };
  return safelyPerformDatabaseOperation(operation);
};

const deleteHistoryItem = async id => {
  const operation = async () => {
    const container = await getHistoryContainer();
    await container.item(id, id).delete();
    return { deletedId: id };
  };
  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryHistory,
  createHistoryItem,
  deleteHistoryItem,
};
