const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');
const { v4: uuidv4 } = require('uuid');

const queryUsers = async () => {
  const container = await cosmosConfigModule.getUsersContainer();
  const { resources } = await container.items.readAll().fetchAll();
  return resources;
};

const getUser = async userId => {
  const container = await cosmosConfigModule.getUsersContainer();
  const response = await container.item(userId, 'test@example.com').read();
  return response.resource;
};

const addHistoryItemToUsers = async (userId, historyItem) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const operation = [{ op: 'add', path: '/history', value: [...user.resource.history, { id: uuidv4(), ...historyItem }] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...user.resource.history, { id: uuidv4(), ...historyItem }];
};

const addPlanToUser = async (userId, plan) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const operation = [{ op: 'add', path: '/plans', value: [...user.resource.plans, { id: uuidv4(), ...plan }] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...user.resource.plans, { id: uuidv4(), ...plan }];
};

const editUserPlan = async (userId, plan) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const filteredPlans = user.resource.plans.filter(item => item.id != plan.id);
  const operation = [{ op: 'add', path: '/plans', value: [...filteredPlans, plan] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...filteredPlans, plan];
};

const removePlanFromUser = async (userId, planId) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const newPlans = user.resource.plans.filter(plan => plan.id != planId);
  const operation = [{ op: 'set', path: '/plans', value: newPlans }];
  await container.item(userId, 'test@example.com').patch(operation);
  return newPlans;
};

const addHistoryItemToUsers = async (userId, historyItemId) => {
  const container = await cosmosConfigModule.getUsersContainer();
  await container.item(userId).history.push({id: historyItemId});
  return container.item(userId).history;
}

const addPlanToUsers = async (userId, planId) => {
  const container = await cosmosConfigModule.getUsersContainer();
  await container.item(userId).plans.push({id: planId});
  return container.item(userId).plans;
}

router.get('/', async (req, res, next) => {
  try {
    const items = await queryUsers();
    res.send(items);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const items = await getUser(req.params.id);
    res.send(items);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.put('/history/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const historyItem = req.body;
    const updatedUserHistoryItemsInDb = await addHistoryItemToUsers(userId, historyItem);
    res.send(updatedUserHistoryItemsInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const updatedUserPlansInDb = await addPlanToUser(userId, plan);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const updatedUserPlansInDb = await editUserPlan(userId, plan);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const planId = req.body.id;
    const updatedUserPlansInDb = await removePlanFromUser(userId, planId);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

<<<<<<< HEAD
module.exports = router;
=======
router.put('/history/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const historyItemId = req.body;
    const updatedUserHistoryItemsInDb = await addHistoryItemToUsers(userId, historyItemId);
    res.send(updatedUserHistoryItemsInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const planId = req.body;
    const updatedUserPlansInDb = await addPlanToUsers(userId, planId);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
>>>>>>> e05f502e6a54d0e4db05c3d9cc60bd1d0e9a2694
