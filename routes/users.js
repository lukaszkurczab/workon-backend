const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cosmosConfigModule = require('../cosmosConfig');
const secretKey = 'your_secret_key';
const { v4: uuidv4 } = require('uuid');

const addUser = async (email, hashedPassword) => {
  const c = await cosmosConfigModule.getUsersContainer();
  const newUser = {
    email,
    password: hashedPassword,
    createdAt: new Date(),
  };
  await c.items.create(newUser);
  return newUser;
};

const queryUsers = async () => {
  const container = await cosmosConfigModule.getUsersContainer();
  const { resources } = await container.items.readAll().fetchAll();
  return resources;
};

const getUserByUsername = async email => {
  const c = await cosmosConfigModule.getUsersContainer();
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }],
  };
  const { resources } = await c.items.query(querySpec).fetchAll();
  return resources[0];
};

const addHistoryItemToUsers = async (userId, historyItem) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const operation = [{ op: 'add', path: '/history', value: [...user.resource.history, { id: uuidv4(), ...historyItem }] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...user.resource.history, { id: uuidv4(), ...historyItem }];
};

const addPlanToUser = async (userId, plan) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const operation = [{ op: 'add', path: '/plans', value: [...user.resource.plans, { id: uuidv4(), ...plan }] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...user.resource.plans, { id: uuidv4(), ...plan }];
};

const editUserPlan = async (userId, plan) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const filteredPlans = user.resource.plans.filter(item => item.id != plan.id);
  const operation = [{ op: 'add', path: '/plans', value: [...filteredPlans, plan] }];
  await container.item(userId, 'test@example.com').patch(operation);
  return [...filteredPlans, plan];
};

const removePlanFromUser = async (userId, planId) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const user = await container.item(userId, 'test@example.com').read();
  const newPlans = user.resource.plans.filter(plan => plan.id != planId);
  const operation = [{ op: 'set', path: '/plans', value: newPlans }];
  await container.item(userId, 'test@example.com').patch(operation);
  return newPlans;
};

const updateUserPassword = async (userId, newPassword) => {
  const container = await cosmosConfigModule.getUsersContainer();
  const operation = [{ op: 'replace', path: '/password', value: newPassword }];
  await container.item(userId, 'test@example.com').patch(operation);
};

router.get('/', async (req, res, next) => {
  try {
    const items = await queryUsers();
    res.send(items);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.put('/history/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const historyItem = req.body;
    const updatedUserHistoryItemsInDb = await addHistoryItemToUsers(userId, historyItem);
    res.send(updatedUserHistoryItemsInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const updatedUserPlansInDb = await addPlanToUser(userId, plan);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByUsername(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await getUserByUsername(email);
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await addUser(email, hashedPassword);
    res.status(201).send({ userId: newUser.id, email: newUser.email });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.put('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const plan = req.body;
    const updatedUserPlansInDb = await editUserPlan(userId, plan);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/plans/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const planId = req.body.id;
    const updatedUserPlansInDb = await removePlanFromUser(userId, planId);
    res.send(updatedUserPlansInDb);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put('/password/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const newPassword = req.body.newPassword;
    await updateUserPassword(userId, newPassword);
    res.send('Password updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
