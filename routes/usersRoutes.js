const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const usersServices = require('../services/usersServices');
const handleServiceResponse = require('../utils/handleServiceResponse');

const secretKey = process.env.SECRET_KEY || ';*Ki$a53O52zfb1G?oFa(lve&J)]r0ID';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

router.get('/', async (req, res) => {
  try {
    const serviceResponse = await usersServices.queryUsers();
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/username/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const newUsername = req.body.newUsername;
    const serviceResponse = await usersServices.updateUserUsername(userId, newUsername);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.get('/public/plans/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const serviceResponse = await usersServices.getPublicPlans(userId);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.get('/public/records/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const serviceResponse = await usersServices.getPublicRecords(userId);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.get('/public/history/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const serviceResponse = await usersServices.getPublicHistoryItems(userId);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.get('/auth/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const serviceResponse = await usersServices.getUserByToken(token);
    if (serviceResponse.error) {
      handleServiceResponse(res, serviceResponse);
    } else if (!serviceResponse.result) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(serviceResponse.result);
    }
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/set-public/:itemType/:userId', async (req, res) => {
  try {
    const { itemType, userId } = req.params;
    const items = req.body.items;
    const updatedItems = await usersServices.setItemsPublicStatus(userId, itemType, items);
    handleServiceResponse(res, { result: updatedItems, error: null });
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const serviceResponse = await usersServices.getUserByEmail(email);
    if (serviceResponse.error) {
      handleServiceResponse(res, serviceResponse);
      return;
    }

    const user = serviceResponse.result;
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ ...user });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const serviceResponse = await usersServices.addUser(name, email, hashedPassword);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const serviceResponse = await usersServices.editUserPlan(userId, plan);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const planId = req.body.id;
    const serviceResponse = await usersServices.removePlanFromUser(userId, planId);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/password/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword, oldPassword } = req.body;
    const serviceResponse = await usersServices.getUserById(userId);
    const user = serviceResponse.result;

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const serviceResponse = await usersServices.updateUserPassword(userId, newHashedPassword);
      handleServiceResponse(res, serviceResponse);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/update-records/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const newRecords = req.body.records;
    const serviceResponse = await usersServices.updateUserRecords(userId, newRecords);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

module.exports = router;
