const express = require('express');
const router = express.Router();
const exerciseService = require('../../services/exerciseService');

const handleServiceResponse = (res, { result, error }, successStatusCode = 200) => {
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(successStatusCode).json(result);
  }
};

router.get('/', async res => {
  const serviceResponse = await exerciseService.queryExercises();
  handleServiceResponse(res, serviceResponse);
});

router.get('/:version', async (req, res) => {
  const { version } = req.params;
  const serviceResponse = await exerciseService.getExercisesByVersion(version);
  handleServiceResponse(res, serviceResponse);
});

router.post('/', async (req, res) => {
  const newExercise = req.body;
  const serviceResponse = await exerciseService.addExercise(newExercise);
  handleServiceResponse(res, serviceResponse, 201);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedExercise = req.body;
  const serviceResponse = await exerciseService.updateExercise(id, updatedExercise);
  handleServiceResponse(res, serviceResponse);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const serviceResponse = await exerciseService.deleteExercise(id);
  handleServiceResponse(res, serviceResponse, 204);
});

module.exports = router;
