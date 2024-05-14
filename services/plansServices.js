const { v4: uuidv4 } = require('uuid');
const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const cosmosConfigModule = require('../cosmosConfig');

const getPlansContainer = async () => getContainer(cosmosConfigModule.getPlansContainer);

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
