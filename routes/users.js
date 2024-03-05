const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

const queryUsers = async () => {
  const c = await cosmosConfigModule.getUsersContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
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

module.exports = router;