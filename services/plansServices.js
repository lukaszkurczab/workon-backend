const { v4: uuidv4 } = require('uuid');
const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const { isPlanValid } = require('../utils/plansUtils');
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

const addPlan = async (newPlan, userId) => {
  const isValid = isPlanValid(newPlan);
  if (isValid === true) {
    const operation = async () => {
      const container = await getPlansContainer();
      const id = uuidv4();
      const planToAdd = { id, authorId: userId, ...newPlan };
      const { resource: createdPlan } = await container.items.create(planToAdd);
      return createdPlan;
    };
    return safelyPerformDatabaseOperation(operation);
  } else {
    throw new Error(isValid);
  }
};

const updatePlan = async updatedPlan => {
  const isValid = isPlanValid(updatedPlan);
  if (isValid === true) {
    const operation = async () => {
      const container = await getPlansContainer();
      const { resource: replacedPlan } = await container.item(updatedPlan.id).replace(updatedPlan);
      return replacedPlan;
    };
    return safelyPerformDatabaseOperation(operation);
  } else {
    throw new Error(isValid);
  }
};

const deletePlan = async planId => {
  const operation = async () => {
    const container = await getPlansContainer();
    await container.item(planId, planId).delete();
  };
  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryPlans,
  addPlan,
  updatePlan,
  deletePlan,
};
