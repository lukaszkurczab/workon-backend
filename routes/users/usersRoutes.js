const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const usersServices = require('../../services/users/usersServices');

const secretKey = process.env.SECRET_KEY || ';*Ki$a53O52zfb1G?oFa(lve&J)]r0ID';
const saltRounds = process.env.BCRYPT_SALT_ROUNDS || 10;

const handleServiceResponse = (res, serviceResponse, successStatusCode = 200) => {
  if (serviceResponse.error) {
    console.error(serviceResponse.error);
    res.status(500).json({ error: serviceResponse.error.message });
  } else {
    res.status(successStatusCode).json(serviceResponse.result);
  }
};

router.get('/', async (req, res) => {
  const serviceResponse = await usersServices.queryUsers();
  handleServiceResponse(res, serviceResponse);
});

router.put('/username/:id', async (req, res) => {
  const userId = req.params.id;
  const newUsername = req.body.newUsername;
  const serviceResponse = await usersServices.updateUserUsername(userId, newUsername);
  handleServiceResponse(res, serviceResponse);
});

router.get('/public/plans/:id', async (req, res) => {
  const userId = req.params.id;
  const serviceResponse = await usersServices.getPublicPlans(userId);
  handleServiceResponse(res, serviceResponse);
});

router.get('/public/records/:id', async (req, res) => {
  const userId = req.params.id;
  const serviceResponse = await usersServices.getPublicRecords(userId);
  handleServiceResponse(res, serviceResponse);
});

router.get('/public/history/:id', async (req, res) => {
  const userId = req.params.id;
  const serviceResponse = await usersServices.getPublicHistoryItems(userId);
  handleServiceResponse(res, serviceResponse);
});

router.post('/set-public/:itemType/:userId/:itemId', async (req, res) => {
  const { itemType, userId, itemId } = req.params;
  const isPublic = req.body.isPublic;
  const serviceResponse = await usersServices.setItemPublicStatus(userId, itemType, itemId, isPublic);
  handleServiceResponse(res, serviceResponse);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const serviceResponse = await usersServices.getUserByEmail(email);
  if (serviceResponse.error) {
    handleServiceResponse(res, serviceResponse);
    return;
  }

  const user = serviceResponse.result;
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.json({ token, ...user });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const serviceResponse = await usersServices.addUser(name, email, hashedPassword);
  handleServiceResponse(res, serviceResponse, 201);
});

router.put('/plans/:id', async (req, res) => {
  const userId = req.params.id;
  const plan = req.body;
  const serviceResponse = await usersServices.editUserPlan(userId, plan);
  handleServiceResponse(res, serviceResponse);
});

router.delete('/plans/:id', async (req, res) => {
  const userId = req.params.id;
  const planId = req.body.id;
  const serviceResponse = await usersServices.removePlanFromUser(userId, planId);
  handleServiceResponse(res, serviceResponse);
});

router.put('/password/:id', async (req, res) => {
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
});

router.post('/update-records/:userId', async (req, res) => {
  const userId = req.params.userId;
  const newRecords = req.body.records;

  try {
    const updatedUser = await usersServices.updateUserRecords(userId, newRecords);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
