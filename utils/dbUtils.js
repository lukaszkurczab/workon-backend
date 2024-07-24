const getContainer = async getContainerFunction => {
  let cachedContainer = null;
  if (!cachedContainer) {
    cachedContainer = await getContainerFunction();
  }
  return cachedContainer;
};

const safelyPerformDatabaseOperation = async operation => {
  try {
    return { result: await operation(), error: null };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { result: null, error };
  }
};

module.exports = {
  getContainer,
  safelyPerformDatabaseOperation,
};
