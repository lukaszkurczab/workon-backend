const cosmosConfigModule = require('../../cosmosConfig');
const { v4: uuidv4 } = require('uuid');

let cachedContainer = null;
const getPlansContainer = async () => {
  if (!cachedContainer) {
    cachedContainer = await cosmosConfigModule.getPlansContainer();
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

const queryPlans = async () => {
  const operation = async () => {
    const container = await getPlansContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  };
  return safelyPerformDatabaseOperation(operation);
};

const addPlan = async newPlan => {
  const operation = async () => {
    const container = await getPlansContainer();
    const id = uuidv4();
    const planToAdd = { id, ...newPlan };
    const { resource: createdPlan } = await container.items.create(planToAdd);
    return createdPlan;
  };
  return safelyPerformDatabaseOperation(operation);
};

const updatePlan = async (planId, updatedPlan) => {
  const operation = async () => {
    const container = await getPlansContainer();
    const { resource: replacedPlan } = await container.item(planId).replace(updatedPlan);
    return replacedPlan;
  };
  return safelyPerformDatabaseOperation(operation);
};

const deletePlan = async planId => {
  const operation = async () => {
    const container = await getPlansContainer();
    await container.item(planId).delete();
    return { deletedId: planId };
  };
  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryPlans,
  addPlan,
  updatePlan,
  deletePlan,
};
