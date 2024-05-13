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

const getUserByUsername = async username => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.username = @username',
      parameters: [{ name: '@username', value: username }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
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

const updateUserUsername = async (userId, newUsername) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const userWithNewUsername = await getUserByUsername(newUsername);
    if (userWithNewUsername.result) {
      throw new Error('Username is already taken');
    }

    const operation = [{ op: 'replace', path: '/username', value: newUsername }];
    await container.item(userId, userId).patch(operation);
    return newUsername;
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
    const operation = [{ op: 'add', path: '/history/-', value: newHistoryItem }];
    await container.item(userId, userId).patch(operation);
    return newHistoryItem;
  });
};

const addPlanToUser = async (userId, plan) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const newPlan = { id: uuidv4(), ...plan };
    const operation = [{ op: 'add', path: '/plans/-', value: newPlan }];
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

    const planIndex = user.result.plans.findIndex(plan => plan.id === updatedPlan.id);
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

    const planIndex = user.result.plans.findIndex(plan => plan.id === planId);
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

const getPublicPlans = async userId => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT c.plans FROM c WHERE c.id = @userId AND ARRAY_CONTAINS(c.plans, {"public": true}, true)',
      parameters: [{ name: '@userId', value: userId }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources
      .map(user => user.plans)
      .flat()
      .filter(plan => plan.public);
  });
};

const getPublicRecords = async userId => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT c.records FROM c WHERE c.id = @userId AND ARRAY_CONTAINS(c.records, {"public": true}, true)',
      parameters: [{ name: '@userId', value: userId }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources
      .map(user => user.records)
      .flat()
      .filter(record => record.public);
  });
};

const getPublicHistoryItems = async userId => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT c.history FROM c WHERE c.id = @userId AND ARRAY_CONTAINS(c.history, {"public": true}, true)',
      parameters: [{ name: '@userId', value: userId }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources
      .map(user => user.history)
      .flat()
      .filter(history => history.public);
  });
};

const setItemPublicStatus = async (userId, itemType, itemId, isPublic) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const itemIndex = user.result[itemType].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`${itemType.slice(0, -1)} not found`);
    }

    const operation = [
      {
        op: 'replace',
        path: `/${itemType}/${itemIndex}/public`,
        value: isPublic,
      },
    ];

    await container.item(userId, userId).patch(operation);
    return { message: `${itemType.slice(0, -1)} public status updated successfully` };
  });
};

const updateUserRecords = async (userId, newRecords) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const operation = [{ op: 'replace', path: '/records', value: newRecords }];

    await container.item(userId, userId).patch(operation);
    return { message: 'Records updated successfully' };
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
  updateUserUsername,
  getPublicPlans,
  getPublicRecords,
  getPublicHistoryItems,
  setItemPublicStatus,
  updateUserRecords,
};
