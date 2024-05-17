const { getContainer, safelyPerformDatabaseOperation } = require('../utils/dbUtils');
const cosmosConfigModule = require('../cosmosConfig');

const getLibraryContainer = async () => getContainer(cosmosConfigModule.getLibraryContainer);

const queryExercises = async () => {
  const operation = async () => {
    const container = await getLibraryContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: 'exercises' }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return { version: resources[0].version, exercises: resources[0].items };
  };
  return safelyPerformDatabaseOperation(operation);
};

const getExercisesByVersion = async reqVersion => {
  const operation = async () => {
    const res = await queryExercises();
    if (reqVersion === res.result.version) {
      return 'Exercises up to date!';
    } else {
      return res.result;
    }
  };
  return safelyPerformDatabaseOperation(operation);
};

module.exports = {
  queryExercises,
  getExercisesByVersion,
};
