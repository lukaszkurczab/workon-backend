const express = require('express');
const router = express.Router();
const plansServices = require('../services/plansServices');
const handleServiceResponse = require('../utils/handleServiceResponse');

router.get('/', async (req, res) => {
  try {
    const serviceResponse = await plansServices.queryPlans();
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/', async (req, res) => {
  try {
    const newPlan = req.body;
    const serviceResponse = await plansServices.addPlan(newPlan);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPlan = req.body;
    const serviceResponse = await plansServices.updatePlan(id, updatedPlan);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const serviceResponse = await plansServices.deletePlan(id);
    handleServiceResponse(res, serviceResponse, 204);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

module.exports = router;
