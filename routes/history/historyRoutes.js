const express = require('express');
const router = express.Router();
const historyService = require('../../services/historyService');

const handleServiceResponse = (res, { result, error }, successStatusCode = 200) => {
  if (error) {
    res.status(500).send({ error: error.message });
  } else {
    res.status(successStatusCode).json(result);
  }
};

router.get('/', async (req, res) => {
  const serviceResponse = await historyService.queryHistory();
  handleServiceResponse(res, serviceResponse);
});

router.post('/', async (req, res) => {
  const newHistoryItem = req.body;
  const serviceResponse = await historyService.createHistoryItem(newHistoryItem);
  handleServiceResponse(res, serviceResponse, 201);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const serviceResponse = await historyService.deleteHistoryItem(id);
  handleServiceResponse(res, serviceResponse, 204);
});

module.exports = router;
