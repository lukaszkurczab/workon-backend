const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../cosmosConfig');

const queryHistory = async () => {
  const container = await cosmosConfigModule.getHistoryContainer();
  const {resources} = await container.items.readAll().fetchAll();
  return resources;
}

const createHistoryItem = async (newHistoryItem) => {
  const container = await cosmosConfigModule.getHistoryContainer();
  const id = uuidv4(); 
  const historyItemToAdd = { ...newHistoryItem, id }; 
  await container.items.create(historyItemToAdd);
  return historyItemToAdd;
}

const deleteHistoryItem = async (id) => {
  const container = await cosmosConfigModule.getHistoryContainer();
  await container.item(id, id).delete();
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryHistory();
    res.send(items);
  } catch(err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newHistoryItem = req.body;
    const createdItem = await createHistoryItem(newHistoryItem);
    res.status(201).send(createdItem);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await deleteHistoryItem(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;