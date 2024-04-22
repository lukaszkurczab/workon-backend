const cosmosConfigModule = require('../../cosmosConfig');
const { v4: uuidv4 } = require('uuid');

let cachedContainer = null;
const getExercisesContainer = async () => {
  if (!cachedContainer) {
    cachedContainer = await cosmosConfigModule.getExercisesContainer();
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

const queryExercises = async () => {
  const operation = async () => {
    const container = await getExercisesContainer();
    const { resources } = await container.items.readAll().fetchAll();
    return resources;
  };
  return safelyPerformDatabaseOperation(operation);
};

const getExercisesByVersion = async version => {
  const operation = async () => {
    const container = await getExercisesContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.version = @version',
      parameters: [{ name: '@version', value: version }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  };
  return safelyPerformDatabaseOperation(operation);
};

const addExercise = async newExercise => {
  const operation = async () => {
    const container = await getExercisesContainer();
    const id = uuidv4();
    const exerciseToAdd = { id, ...newExercise };
    const { resource: createdExercise } = await container.items.create(exerciseToAdd);
    return createdExercise;
  };
  return safelyPerformDatabaseOperation(operation);
};

const updateExercise = async (exerciseId, updatedExercise) => {
  const operation = async () => {
    const container = await getExercisesContainer();
    const { resource: replacedExercise } = await container.item(exerciseId).replace(updatedExercise);
    return replacedExercise;
  };
  return safelyPerformDatabaseOperation(operation);
};

const deleteExercise = async exerciseId => {
  const operation = async () => {
    const container = await getExercisesContainer();
    await container.item(exerciseId).delete();
    return exerciseId;
  };
  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryExercises,
  getExercises: getExercisesByVersion,
  addExercise,
  updateExercise,
  deleteExercise,
};
