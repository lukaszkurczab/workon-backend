const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

const queryUsers = async () => {
  const container = await cosmosConfigModule.getUsersContainer();
  const {resources} = await container.items.readAll().fetchAll();
  return resources;
}

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
  try{
    const items = await queryUsers();
    res.send(items);
  } catch(err) {
    console.log(err.message)
    res.status(500).send(err.message);
  }
});

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