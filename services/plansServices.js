const { v4: uuidv4 } = require('uuid');
const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const { isPlanValid } = require('../utils/plansUtils');
const cosmosConfigModule = require('../cosmosConfig');

const getPlansContainer = async () => getContainer(cosmosConfigModule.getPlansContainer);

const queryPlans = async () => {
  const operation = async () => {
    const container = await getPlansContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return { result: resources, error: null };
  };
  return safelyPerformDatabaseOperation(operation);
};

const addPlan = async (newPlan, userId) => {
  const isValid = isPlanValid(newPlan);

  if (isValid !== true) {
    return { result: null, error: new Error(isValid) };
  }

  const operation = async () => {
    const container = await getPlansContainer();
    const id = uuidv4();
    const planToAdd = { ...newPlan, id, authorId: userId };
    const { resource: createdPlan } = await container.items.create(planToAdd);
    return { result: createdPlan, error: null };
  };

  return safelyPerformDatabaseOperation(operation);
};

const updatePlan = async updatedPlan => {
  const isValid = isPlanValid(updatedPlan);

  if (isValid !== true) {
    return { result: null, error: new Error(isValid) };
  }

  const operation = async () => {
    const container = await getPlansContainer();
    const { resource: replacedPlan } = await container.item(updatedPlan.id).replace(updatedPlan);
    return { result: replacedPlan, error: null };
  };

  return safelyPerformDatabaseOperation(operation);
};

const deletePlan = async planId => {
  const operation = async () => {
    const container = await getPlansContainer();
    await container.item(planId, planId).delete();
    return { result: `Plan with id ${planId} deleted successfully`, error: null };
  };

  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryPlans,
  addPlan,
  updatePlan,
  deletePlan,
};
