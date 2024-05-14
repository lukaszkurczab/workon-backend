const express = require('express');
const router = express.Router();
const exercisesServices = require('../services/exercisesServices');
const handleServiceResponse = require('../utils/handleServiceResponse');

router.get('/', async (req, res) => {
  try {
    const serviceResponse = await exercisesServices.queryExercises();
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.get('/:version', async (req, res) => {
  try {
    const { version } = req.params;
    const serviceResponse = await exercisesServices.getExercises(version);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/', async (req, res) => {
  try {
    const newExercise = req.body;
    const serviceResponse = await exercisesServices.addExercise(newExercise);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExercise = req.body;
    const serviceResponse = await exercisesServices.updateExercise(id, updatedExercise);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const serviceResponse = await exercisesServices.deleteExercise(id);
    handleServiceResponse(res, serviceResponse, 204);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

module.exports = router;
