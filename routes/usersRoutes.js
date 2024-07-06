const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const usersServices = require('../services/usersServices');
const handleServiceResponse = require('../utils/handleServiceResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/usersUtils');
const authenticateToken = require('../middlewares/authenticateToken');

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

router.put('/username/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { newUsername, password } = req.body;
    const userData = await usersServices.getUserById(userId);
    const passwordIsValid = await bcrypt.compare(password, userData.result.password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const serviceResponse = await usersServices.updateUserUsername(userId, newUsername);

    if (serviceResponse.error) {
      if (serviceResponse.error.message === 'Username is already taken') {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      return res.status(500).json({ error: 'Database operation failed' });
    }

    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    console.error(error);
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

router.post('/set-public/:itemType/:userId', authenticateToken, async (req, res) => {
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
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await usersServices.saveRefreshToken(user.id, refreshToken);
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const serviceResponse = await usersServices.addUser(username, email, hashedPassword);
    handleServiceResponse(res, serviceResponse, 201);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const serviceResponse = await usersServices.editUserPlan(userId, plan);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const serviceResponse = await usersServices.addPlanToUser(userId, plan);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.delete('/plans/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const planId = req.body.id;
    const serviceResponse = await usersServices.removePlanFromUser(userId, planId);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/password/:id', authenticateToken, async (req, res) => {
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

router.post('/update-records/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const newRecords = req.body.records;
    const serviceResponse = await usersServices.updateUserRecords(userId, newRecords);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.put('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const historyItem = req.body.historyItem;
    const serviceResponse = await usersServices.addHistoryItemToUser(userId, historyItem);
    handleServiceResponse(res, serviceResponse);
  } catch (error) {
    handleServiceResponse(res, { result: null, error });
  }
});

router.post('/token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const serviceResponse = await usersServices.getUserById(decoded.id);

    if (serviceResponse.error) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = serviceResponse.result;
    if (!user || user.refreshToken !== token) {
      console.log(user);
      return res.status(403).json({ error: 'Forbidden' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
});

router.get('/:token', authenticateToken, async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const serviceResponse = await usersServices.getUserById(decoded.id);

    if (serviceResponse.error) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = {
      username: serviceResponse.result.username,
      bio: serviceResponse.result.bio,
      email: serviceResponse.result.email,
      plans: serviceResponse.result.plans,
      history: serviceResponse.result.history,
    };
    handleServiceResponse(res, { result: user });
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
});

module.exports = router;
