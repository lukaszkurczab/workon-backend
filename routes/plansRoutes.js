const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const plansServices = require('../services/plansServices');
const handleServiceResponse = require('../utils/handleServiceResponse');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const serviceResponse = await plansServices.queryPlans();
    handleServiceResponse(res, serviceResponse.result);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { newPlan, userId } = req.body;
    const serviceResponse = await plansServices.addPlan(newPlan, userId);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedPlan } = req.body;
    const serviceResponse = await plansServices.updatePlan(id, updatedPlan);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const serviceResponse = await plansServices.deletePlan(id);
    handleServiceResponse(res, serviceResponse, 204);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

module.exports = router;
