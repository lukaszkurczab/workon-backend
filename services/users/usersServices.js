const cosmosConfigModule = require('../../cosmosConfig');
const { v4: uuidv4 } = require('uuid');

let cachedContainer = null;
const getUsersContainer = async () => {
  if (!cachedContainer) {
    cachedContainer = await cosmosConfigModule.getUsersContainer();
  }
  return cachedContainer;
};

const safelyPerformDatabaseOperation = async operation => {
  try {
    const result = await operation();
    return { result, error: null };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { result: null, error };
  }
};

const getUserById = async userId => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const { resource } = await container.item(userId, userId).read();
    return resource || null;
  });
};

const addUser = async (name, email, hashedPassword) => {
  return safelyPerformDatabaseOperation(async () => {
    const existingUser = await getUserByEmail(email);
    if (existingUser.result != null) {
      throw new Error('User already exists with that email');
    }

    const container = await getUsersContainer();
    const newUser = {
      id: uuidv4(),
      username: name,
      bio: '',
      email,
      password: hashedPassword,
      plans: [],
      history: [],
      createdAt: new Date(),
    };
    const { resource } = await container.items.create(newUser);
    return resource;
  });
};

const updateUserPassword = async (userId, newPassword) => {
  return safelyPerformDatabaseOperation(async () => {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const container = await getUsersContainer();
    const operation = [{ op: 'replace', path: '/password', value: newPassword }];
    await container.item(userId, userId).patch(operation);
    return { message: 'Password updated successfully' };
  });
};

const queryUsers = async () => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  });
};

const getUserByEmail = async email => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  });
};

const addHistoryItemToUser = async (userId, historyItem) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const newHistoryItem = { id: uuidv4(), ...historyItem };
    const operation = [{ op: 'add', path: '/history', value: newHistoryItem }];
    await container.item(userId, userId).patch(operation);
    return newHistoryItem;
  });
};

const addPlanToUser = async (userId, plan) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const newPlan = { id: uuidv4(), ...plan };
    const operation = [{ op: 'add', path: '/plans', value: newPlan }];
    await container.item(userId, userId).patch(operation);
    return newPlan;
  });
};

const editUserPlan = async (userId, updatedPlan) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const planIndex = user.plans.findIndex(plan => plan.id === updatedPlan.id);
    if (planIndex === -1) {
      throw new Error('Plan not found');
    }

    const operation = [
      {
        op: 'replace',
        path: `/plans/${planIndex}`,
        value: updatedPlan,
      },
    ];

    await container.item(userId, userId).patch(operation);
    return updatedPlan;
  });
};

const removePlanFromUser = async (userId, planId) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const planIndex = user.plans.findIndex(plan => plan.id === planId);
    if (planIndex === -1) {
      throw new Error('Plan not found');
    }

    const operation = [
      {
        op: 'remove',
        path: `/plans/${planIndex}`,
      },
    ];

    await container.item(userId, userId).patch(operation);
    return { message: 'Plan removed successfully', planId };
  });
};

module.exports = {
  addUser,
  queryUsers,
  getUserByEmail,
  addHistoryItemToUser,
  addPlanToUser,
  editUserPlan,
  removePlanFromUser,
  updateUserPassword,
};
