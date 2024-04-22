const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../../cosmosConfig');
const historyService = require('./historyService');

jest.mock('../../cosmosConfig');

const mockFetchAll = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

cosmosConfigModule.getHistoryContainer.mockImplementation(() => ({
  items: {
    readAll: () => ({ fetchAll: mockFetchAll }),
    create: mockCreate,
  },
  item: jest.fn(id => ({
    delete: mockDelete,
  })),
}));

describe('History Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries history items', async () => {
    const mockItems = [{ id: '1', event: 'Event1' }];
    mockFetchAll.mockResolvedValue({ resources: mockItems });

    const { result, error } = await historyService.queryHistory();

    expect(error).toBeNull();
    expect(result).toEqual(mockItems);
    expect(mockFetchAll).toHaveBeenCalledTimes(1);
  });

  it('creates a history item', async () => {
    const newHistoryItem = { event: 'New Event' };
    const expectedHistoryItem = { id: uuidv4(), ...newHistoryItem };
    mockCreate.mockResolvedValue({ resource: expectedHistoryItem });

    const { result, error } = await historyService.createHistoryItem(newHistoryItem);

    expect(error).toBeNull();
    expect(result).toEqual(expectedHistoryItem);
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object));
  });

  it('deletes a history item', async () => {
    const historyItemId = uuidv4();
    mockDelete.mockResolvedValue({});

    const { result, error } = await historyService.deleteHistoryItem(historyItemId);

    expect(error).toBeNull();
    expect(result).toEqual({ deletedId: historyItemId });
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
