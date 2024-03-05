const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

const queryHistory = async () => {
  const c = await cosmosConfigModule.getHistoryContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryHistory();
    res.send(items);
  } catch(err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;