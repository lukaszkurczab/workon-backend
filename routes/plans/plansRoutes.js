const express = require('express');
const router = express.Router();
const plansServices = require('../../services/plans/plansServices');

const handleServiceResponse = (res, { result, error }, successStatusCode = 200) => {
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(successStatusCode).json(result);
  }
};

router.get('/', async (req, res) => {
  const serviceResponse = await plansServices.queryPlans();
  handleServiceResponse(res, serviceResponse);
});

router.post('/', async (req, res) => {
  const newPlan = req.body;
  const serviceResponse = await plansServices.addPlan(newPlan);
  handleServiceResponse(res, serviceResponse, 201);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedPlan = req.body;
  const serviceResponse = await plansServices.updatePlan(id, updatedPlan);
  handleServiceResponse(res, serviceResponse);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const serviceResponse = await plansServices.deletePlan(id);
  handleServiceResponse(res, serviceResponse, 204);
});

module.exports = router;
