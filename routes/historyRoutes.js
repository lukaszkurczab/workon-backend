const express = require('express');
const router = express.Router();
const historyServices = require('../services/historyServices');
const handleServiceResponse = require('../utils/handleServiceResponse');

router.get('/', async (req, res) => {
  try {
    const serviceResponse = await historyServices.queryHistory();
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/', async (req, res) => {
  try {
    const newHistoryItem = req.body;
    const serviceResponse = await historyServices.createHistoryItem(newHistoryItem);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const serviceResponse = await historyServices.deleteHistoryItem(id);
    handleServiceResponse(res, serviceResponse, 204);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

module.exports = router;
