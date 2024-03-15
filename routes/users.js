const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

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
  const operation = [{ op: 'add', path: '/history', value: [...user.resource.history, historyItem] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return historyItem;
};

const addPlanToUsers = async (userId, planId) => {
  const container = await cosmosConfigModule.getUsersContainer();
  await container.item(userId).plans.push({ id: planId });
  return container.item(userId).plans;
};

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
