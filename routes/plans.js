const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../cosmosConfig');

const queryPlans = async () => {
  const c = await cosmosConfigModule.getPlansContainer();
  const {resources} = await c.items.readAll().fetchAll();
  return resources;
}

const addPlan = async (newPlan) => {
  const container = await cosmosConfigModule.getPlansContainer();
  const id = uuidv4(); 
  const planToAdd = { ...newPlan, id }; 
  await container.items.create(planToAdd);
  return planToAdd;
};

const updatePlan = async (planId, updatedPlan) => {
  const container = await cosmosConfigModule.getPlansContainer();
  await container.item(planId).replace(updatedExercise);
  return updatedPlan;
}

const deletePlan = async (planId) => {
  const container = await cosmosConfigModule.getPlansContainer();
  await container.item(planId).delete();
  return planId;
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

router.post('/', async (req, res, next) => {
  try {
    const newPlan = req.body;
    const addedPlan = await addPlan(newPlan);
    res.send(addedPlan);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const planId = req.params.id;
    const updatedPlan = req.body;
    const updatedPlanInDb = await updatePlan(planId, updatedPlan);
    res.send(updatedPlanInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const planId = req.params.id;
    await deletePlan(planId);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;