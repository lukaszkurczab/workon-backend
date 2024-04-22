const { v4: uuidv4 } = require('uuid');
const cosmosConfigModule = require('../../cosmosConfig');
const usersServices = require('./usersServices');

jest.mock('../../cosmosConfig');

const mockFetchAll = jest.fn();
const mockQuery = jest.fn();
const mockCreate = jest.fn();
const mockReplace = jest.fn();
const mockDelete = jest.fn();
const mockRead = jest.fn();

cosmosConfigModule.getUsersContainer.mockImplementation(() => ({
  items: {
    readAll: () => ({ fetchAll: mockFetchAll }),
    query: querySpec => ({ fetchAll: mockQuery }),
    create: mockCreate,
  },
  item: jest.fn((id, partitionKey) => ({
    read: mockRead,
    replace: mockReplace,
    delete: mockDelete,
  })),
}));

describe('Users Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query all users', async () => {
    const mockUsers = [{ id: '1', email: 'test@example.com' }];
    mockFetchAll.mockResolvedValue({ resources: mockUsers });

    const result = await usersServices.queryUsers();

    expect(result).toEqual({ result: mockUsers, error: null });
    expect(mockFetchAll).toHaveBeenCalled();
  });

  it('should add a user', async () => {
    const newUser = { email: 'new@example.com', password: 'password123' };
    const expectedUser = { id: uuidv4(), ...newUser };
    mockCreate.mockResolvedValue({ resource: expectedUser });
    mockQuery.mockResolvedValue({ resources: [] }); // Assuming no existing user

    const result = await usersServices.addUser(newUser.email, newUser.password);

    expect(result).toEqual({ result: expectedUser, error: null });
    expect(mockCreate).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should update a user password', async () => {
    const userId = uuidv4();
    const newPassword = 'newPassword123';
    mockRead.mockResolvedValue({
      resource: {
        id: userId,
        email: 'test@example.com',
        password: 'oldPassword',
      },
    });
    mockReplace.mockResolvedValue({ resource: { password: newPassword } });

    const result = await usersServices.updateUserPassword(userId, newPassword);

    expect(result).toEqual({
      result: { message: 'Password updated successfully' },
      error: null,
    });
    expect(mockReplace).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should get a user by email', async () => {
    const userEmail = 'test@example.com';
    const mockUser = { id: '1', email: userEmail };
    mockQuery.mockResolvedValue({ resources: [mockUser] });

    const result = await usersServices.getUserByEmail(userEmail);

    expect(result).toEqual({ result: mockUser, error: null });
    expect(mockQuery).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should handle adding a user that already exists', async () => {
    const newUser = { email: 'existing@example.com', password: 'password123' };
    const existingUser = { id: '1', email: newUser.email };
    mockQuery.mockResolvedValue({ resources: [existingUser] });

    await expect(usersServices.addUser(newUser.email, newUser.password)).resolves.toEqual({
      result: null,
      error: new Error('User already exists with that email'),
    });
  });

  it('should remove a user plan', async () => {
    const userId = uuidv4();
    const planId = uuidv4();
    const user = { id: userId, plans: [{ id: planId, name: 'Plan A' }] };
    mockRead.mockResolvedValue({ resource: user });
    mockReplace.mockResolvedValue({});

    const result = await usersServices.removePlanFromUser(userId, planId);

    expect(result).toEqual({
      result: { message: 'Plan removed successfully', planId },
      error: null,
    });
    expect(mockReplace).toHaveBeenCalled();
  });
});
