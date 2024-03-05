const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');
const cosmosConfig = require('../cosmosConfig');

const cosmosClient = new CosmosClient({
  endpoint: cosmosConfig.endpoint,
  key: cosmosConfig.key,
  agent: cosmosConfig.agent,
});

let exercisesContainer;

const getExercisesContainer = async () => {
  if(!exercisesContainer){
    exercisesContainer = cosmosClient.database(cosmosConfig.database.id).container(cosmosConfig.exercisesContainer.id)
  }

  return exercisesContainer
}

const queryExercises = async () => {
  const c = await getExercisesContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryExercises();
    res.send(items);
  } catch(err) {
    console.log(err.message)
    res.status(500).send(err.message);
  }
});

// Eksportuj moduł router
module.exports = router;