const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../../cosmosConfig');
const plansServices = require('./plansServices');

jest.mock('../../cosmosConfig');

const mockFetchAll = jest.fn();
const mockCreate = jest.fn();
const mockReplace = jest.fn();
const mockDelete = jest.fn();

cosmosConfigModule.getPlansContainer.mockImplementation(() => ({
  items: {
    readAll: () => ({ fetchAll: mockFetchAll }),
    create: mockCreate,
  },
  item: jest.fn((id, partitionKey) => ({
    replace: mockReplace,
    delete: mockDelete,
  })),
}));

describe('Plans Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query all plans', async () => {
    const mockPlans = [{ id: '1', name: 'Plan A', details: 'Details of Plan A' }];
    mockFetchAll.mockResolvedValue({ resources: mockPlans });

    const result = await plansServices.queryPlans();

    expect(result).toEqual({ result: mockPlans, error: null });
    expect(mockFetchAll).toHaveBeenCalled();
  });

  it('should add a plan', async () => {
    const newPlan = { name: 'Plan B', details: 'Details of Plan B' };
    const expectedPlan = { id: uuidv4(), ...newPlan };
    mockCreate.mockResolvedValue({ resource: expectedPlan });

    const result = await plansServices.addPlan(newPlan);

    expect(result).toEqual({ result: expectedPlan, error: null });
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should update a plan', async () => {
    const planId = uuidv4();
    const updatedPlan = {
      name: 'Updated Plan B',
      details: 'Updated details of Plan B',
    };
    mockReplace.mockResolvedValue({ resource: updatedPlan });

    const result = await plansServices.updatePlan(planId, updatedPlan);

    expect(result).toEqual({ result: updatedPlan, error: null });
    expect(mockReplace).toHaveBeenCalledWith(updatedPlan);
  });

  it('should delete a plan', async () => {
    const planId = uuidv4();
    mockDelete.mockResolvedValue({});

    const result = await plansServices.deletePlan(planId);

    expect(result).toEqual({ result: { deletedId: planId }, error: null });
    expect(mockDelete).toHaveBeenCalled();
  });

  it('handles errors during plan querying', async () => {
    const errorMessage = 'Failed to fetch plans';
    mockFetchAll.mockRejectedValue(new Error(errorMessage));

    const { result, error } = await plansServices.queryPlans();

    expect(error).not.toBeNull();
    expect(error.message).toContain(errorMessage);
    expect(result).toBeNull();
    expect(mockFetchAll).toHaveBeenCalled();
  });

  it('handles errors during plan addition', async () => {
    const newPlan = { name: 'Plan C', details: 'Details of Plan C' };
    const errorMessage = 'Failed to add plan';
    mockCreate.mockRejectedValue(new Error(errorMessage));

    const { result, error } = await plansServices.addPlan(newPlan);

    expect(error).not.toBeNull();
    expect(error.message).toContain(errorMessage);
    expect(result).toBeNull();
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles errors during plan update', async () => {
    const planId = uuidv4();
    const updatedPlan = { name: 'Plan D', details: 'Details of Plan D' };
    const errorMessage = 'Failed to update plan';
    mockReplace.mockRejectedValue(new Error(errorMessage));

    const { result, error } = await plansServices.updatePlan(planId, updatedPlan);

    expect(error).not.toBeNull();
    expect(error.message).toContain(errorMessage);
    expect(result).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith(updatedPlan);
  });

  it('handles errors during plan deletion', async () => {
    const planId = uuidv4();
    const errorMessage = 'Failed to delete plan';
    mockDelete.mockRejectedValue(new Error(errorMessage));

    const { result, error } = await plansServices.deletePlan(planId);

    expect(error).not.toBeNull();
    expect(error.message).toContain(errorMessage);
    expect(result).toBeNull();
    expect(mockDelete).toHaveBeenCalled();
  });
});
