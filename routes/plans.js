const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

const queryPlans = async () => {
  const c = await cosmosConfigModule.getPlansContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryPlans();
    res.send(items);
  } catch(err) {
    console.log(err.message)
    res.status(500).send(err.message);
  }
});

module.exports = router;