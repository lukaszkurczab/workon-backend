const { v4: uuidv4 } = require('uuid');
const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const cosmosConfigModule = require('../cosmosConfig');

const getUsersContainer = async () => getContainer(cosmosConfigModule.getUsersContainer);

const getUserById = async id => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
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

const addUser = async (username, email, hashedPassword) => {
  return safelyPerformDatabaseOperation(async () => {
    const existingUserWithEmail = await getUserByEmail(email);
    const existingUserWithUsername = await getUserByUsername(username);

    if (existingUserWithEmail.result != null) {
      throw new Error('User already exists with that email');
    }

    if (existingUserWithUsername.result != null) {
      throw new Error('User already exists with that username');
    }

    const container = await getUsersContainer();
    const newUser = {
      id: uuidv4(),
      username: username,
      bio: '',
      email,
      password: hashedPassword,
      defaultHistoryPublicType: 'private',
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

const saveRefreshToken = async (userId, refreshToken) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);

    const operation = user.refreshToken
      ? [{ op: 'replace', path: '/refreshToken', value: refreshToken }]
      : [{ op: 'add', path: '/refreshToken', value: refreshToken }];

    await container.item(userId, userId).patch(operation);
    return await getUserById(userId);
  });
};

const addHistoryItemToUser = async (userId, historyItem) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const newHistoryItem = { ...historyItem, id: uuidv4() };
    const operation = [{ op: 'add', path: '/history/0', value: newHistoryItem }];
    await container.item(userId, userId).patch(operation);
    return newHistoryItem;
  });
};

const addPlanToUser = async (userId, plan) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const userItem = await container.item(userId, userId).read();
    const userPlans = userItem.resource.plans || [];

    const existingPlanIndex = userPlans.findIndex(p => p.id === plan.id);

    if (existingPlanIndex !== -1) {
      userPlans[existingPlanIndex] = plan;
    } else {
      const newPlan = { id: uuidv4(), ...plan };
      userPlans.push(newPlan);
    }

    const operation = [{ op: 'replace', path: '/plans', value: userPlans }];
    await container.item(userId, userId).patch(operation);

    return plan.id ? plan : userPlans[userPlans.length - 1];
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
      query: 'SELECT c.plans FROM c WHERE c.id = @userId AND ARRAY_CONTAINS(c.plans, {"publicType": "public"}, true)',
      parameters: [{ name: '@userId', value: userId }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources
      .map(user => user.plans)
      .flat()
      .filter(plan => plan.publicType === 'public');
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

const setHistoryPublicStatus = async (userId, items, publicType) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentItems = user.result.history;
    const updatedItems = currentItems.map(currentItem => {
      const itemToUpdate = items.find(item => item.id === currentItem.id);
      if (itemToUpdate) {
        return { ...currentItem, publicType: itemToUpdate.publicType };
      }
      return currentItem;
    });

    const operation = [
      { op: 'replace', path: `/history`, value: updatedItems },
      { op: 'replace', path: `/settings/defaultHistoryPublicType`, value: publicType },
    ];
    await container.item(userId, userId).patch(operation);

    const publicItems = updatedItems.filter(item => item.publicType === 'public');
    return publicItems;
  });
};

const setPlansPublicStatus = async (userId, items) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentItems = user.result.plans;
    const updatedItems = currentItems.map(currentItem => {
      const itemToUpdate = items.find(item => item.id === currentItem.id);
      if (itemToUpdate) {
        return { ...currentItem, publicType: itemToUpdate.publicType };
      }
      return currentItem;
    });

    const operation = [{ op: 'replace', path: `/plans`, value: updatedItems }];
    await container.item(userId, userId).patch(operation);

    const publicItems = updatedItems.filter(item => item.publicType === 'public');
    return publicItems;
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

const getUserByToken = async token => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.token = @token',
      parameters: [{ name: '@token', value: token }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || null;
  });
};

const addSearchHistoryItemToUser = async (userId, searchHistoryItem) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { id, userId: newUserId, ...newItemData } = searchHistoryItem;

    const existingItemIndex = user.result.searchHistory.findIndex(item => {
      if (typeof item === 'string') return false;
      const { id: existingId, userId: existingUserId } = item;
      return existingUserId === newUserId;
    });

    if (existingItemIndex !== -1) {
      user.result.searchHistory.splice(existingItemIndex, 1);
    }

    const newSearchHistoryItem = { ...newItemData, id: uuidv4(), userId: newUserId };
    const updatedSearchHistory = [newSearchHistoryItem, ...user.result.searchHistory];

    const operation = [{ op: 'replace', path: '/searchHistory', value: updatedSearchHistory }];
    await container.item(userId, userId).patch(operation);
    return newSearchHistoryItem;
  });
};

const removeSearchHistoryItemFromUser = async (userId, searchHistoryItemId) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedSearchHistory = await user.result.searchHistory.filter(item => item.id !== searchHistoryItemId);

    const operation = [{ op: 'replace', path: '/searchHistory', value: updatedSearchHistory }];
    await container.item(userId, userId).patch(operation);
    return { message: 'Search history item removed successfully' };
  });
};

const clearSearchHistoryForUser = async userId => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const operation = [{ op: 'replace', path: '/searchHistory', value: [] }];
    await container.item(userId, userId).patch(operation);
    return { message: 'Search history cleared successfully' };
  });
};

const searchUsersByUsername = async (query, maxResults, userId) => {
  return safelyPerformDatabaseOperation(async () => {
    const container = await getUsersContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE LOWER(c.username) LIKE @query AND c.id != @userId',
      parameters: [
        { name: '@query', value: `%${query.toLowerCase()}%` },
        { name: '@userId', value: userId },
      ],
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources
      .slice(0, maxResults)
      .map(item => ({ name: item.username, image: 'image', userId: item.id, id: uuidv4() }));
  });
};

module.exports = {
  addUser,
  queryUsers,
  getUserByEmail,
  addSearchHistoryItemToUser,
  addPlanToUser,
  editUserPlan,
  removePlanFromUser,
  updateUserPassword,
  updateUserUsername,
  getPublicPlans,
  getPublicRecords,
  getPublicHistoryItems,
  setHistoryPublicStatus,
  setPlansPublicStatus,
  updateUserRecords,
  getUserById,
  getUserByToken,
  saveRefreshToken,
  removeSearchHistoryItemFromUser,
  clearSearchHistoryForUser,
  addHistoryItemToUser,
  searchUsersByUsername,
};
