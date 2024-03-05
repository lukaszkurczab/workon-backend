const express = require('express');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');

const queryExercises = async () => {
  const c = await cosmosConfigModule.getExercisesContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryExercises();
    res.send(items);
  } catch(err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;