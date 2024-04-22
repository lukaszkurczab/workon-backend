const cosmosConfigModule = require('../../cosmosConfig');
const { v4: uuidv4 } = require('uuid');

let cachedContainer = null;
const getHistoryContainer = async () => {
  if (!cachedContainer) {
    cachedContainer = await cosmosConfigModule.getHistoryContainer();
  }
  return cachedContainer;
};

const safelyPerformDatabaseOperation = async operation => {
  try {
    return { result: await operation(), error: null };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { result: null, error };
  }
};

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
