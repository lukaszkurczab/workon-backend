const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../cosmosConfig');

const queryExercises = async () => {
  const container = await cosmosConfigModule.getExercisesContainer();
  const {resources} = await container.items.readAll().fetchAll();
  return resources;
}

const addExercise = async (newExercise) => {
  const container = await cosmosConfigModule.getExercisesContainer();
  const id = uuidv4(); 
  const exerciseToAdd = { ...newExercise, id }; 
  await container.items.create(exerciseToAdd);
  return exerciseToAdd;
}

const updateExercise = async (exerciseId, updatedExercise) => {
  const container = await cosmosConfigModule.getExercisesContainer();
  await container.item(exerciseId).replace(updatedExercise);
  return updatedExercise;
}

const deleteExercise = async (exerciseId) => {
  const container = await cosmosConfigModule.getExercisesContainer();
  await container.item(exerciseId).delete();
  return exerciseId;
}

router.get('/', async (req, res, next) => {
  try{
    const items = await queryExercises();
    res.send(items);
  } catch(err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newExercise = req.body;
    const addedExercise = await addExercise(newExercise);
    res.send(addedExercise);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const exerciseId = req.params.id;
    const updatedExercise = req.body;
    const updatedExerciseInDb = await updateExercise(exerciseId, updatedExercise);
    res.send(updatedExerciseInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const exerciseId = req.params.id;
    await deleteExercise(exerciseId);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;