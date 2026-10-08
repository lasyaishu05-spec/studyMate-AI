const bcrypt = require('bcrypt');
jest.mock('../../config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));
const prisma = require('../../config/db');
const authService = require('../authService');

test('login rejects a wrong password', async () => {
  prisma.user.findUnique.mockResolvedValue({
    id: '1',
    email: 'a@b.com',
    passwordHash: await bcrypt.hash('correct', 10),
  });

  await expect(authService.login({ email: 'a@b.com', password: 'wrong' }))
    .rejects.toMatchObject({ status: 401 });
});

test('login succeeds with correct password', async () => {
  process.env.JWT_SECRET = 'testsecret123';
  prisma.user.findUnique.mockResolvedValue({
    id: '1',
    name: 'Test User',
    email: 'a@b.com',
    passwordHash: await bcrypt.hash('correct', 10),
  });

  const res = await authService.login({ email: 'a@b.com', password: 'correct' });
  expect(res.token).toBeDefined();
  expect(res.user.email).toBe('a@b.com');
});
