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

router.put('/history/:id', async (req, res) => {
  const userId = req.params.id;
  const historyItem = req.body;
  const serviceResponse = await usersServices.addHistoryItemToUser(userId, historyItem);
  handleServiceResponse(res, serviceResponse);
});

router.post('/plans/:id', async (req, res) => {
  const userId = req.params.id;
  const plan = req.body;
  const serviceResponse = await usersServices.addPlanToUser(userId, plan);
  handleServiceResponse(res, serviceResponse, 201);
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
  const newPassword = req.body.newPassword;
  const serviceResponse = await usersServices.updateUserPassword(userId, newPassword);
  handleServiceResponse(res, serviceResponse);
});

module.exports = router;
