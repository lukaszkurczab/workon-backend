const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../../cosmosConfig');
const exercisesServices = require('./exercisesServices');

jest.mock('../../cosmosConfig');

const mockFetchAll = jest.fn();
const mockQuery = jest.fn();
const mockCreate = jest.fn();
const mockReplace = jest.fn();
const mockDelete = jest.fn();

cosmosConfigModule.getExercisesContainer.mockImplementation(() => ({
  items: {
    readAll: () => ({ fetchAll: mockFetchAll }),
    query: q => ({ fetchAll: mockQuery }),
    create: mockCreate,
    replace: mockReplace,
    delete: mockDelete,
  },
  item: jest.fn(() => ({
    replace: mockReplace,
    delete: mockDelete,
  })),
}));

describe('Exercise Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query exercises', async () => {
    const mockExercises = [{ id: '1', name: 'Push-up' }];
    mockFetchAll.mockResolvedValue({ resources: mockExercises });

    const result = await exercisesServices.queryExercises();

    expect(result).toEqual({ result: mockExercises, error: null });
    expect(mockFetchAll).toHaveBeenCalled();
  });

  it('should get exercises by version', async () => {
    const mockExercises = [{ id: '1', name: 'Push-up', version: '1.0' }];
    const version = '1.0';
    mockQuery.mockResolvedValue({ resources: mockExercises });

    const result = await exercisesServices.getExercises(version);

    expect(result).toEqual({ result: mockExercises, error: null });
    expect(mockQuery).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should add an exercise', async () => {
    const newExercise = { name: 'Sit-up' };
    const mockId = uuidv4();
    const expectedExercise = { id: mockId, ...newExercise };
    mockCreate.mockResolvedValue({ resource: expectedExercise });

    const result = await exercisesServices.addExercise(newExercise);

    expect(result).toEqual({ result: expectedExercise, error: null });
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should update an exercise', async () => {
    const exerciseId = uuidv4();
    const updatedExercise = { name: 'Updated Push-up', version: '1.1' };
    mockReplace.mockResolvedValue({ resource: updatedExercise });

    const result = await exercisesServices.updateExercise(exerciseId, updatedExercise);

    expect(result).toEqual({ result: updatedExercise, error: null });
    expect(mockReplace).toHaveBeenCalledWith(updatedExercise);
  });

  it('should delete an exercise', async () => {
    const exerciseId = uuidv4();
    mockDelete.mockResolvedValue({});

    const result = await exercisesServices.deleteExercise(exerciseId);

    expect(result).toEqual({ result: exerciseId, error: null });
    expect(mockDelete).toHaveBeenCalled();
  });
});
