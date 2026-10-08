const request = require('supertest');
const app = require('../app');

describe('Notebooks Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
    const testUser = {
      name: 'Integration Test User',
      email: `test-${Date.now()}@test.com`,
      password: 'password123',
    };

    // Signup test user
    const signupRes = await request(app).post('/auth/signup').send(testUser);
    if (signupRes.status === 201) {
      authToken = signupRes.body.token;
    } else {
      // Fallback login
      const loginRes = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = loginRes.body.token;
    }
  });

  test('creating a notebook requires auth', async () => {
    const res = await request(app).post('/notebooks').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });

  test('a logged-in user can create and fetch their notebook', async () => {
    const createRes = await request(app)
      .post('/notebooks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Biology' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe('Biology');
    expect(createRes.body.id).toBeDefined();

    const getRes = await request(app)
      .get('/notebooks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    const found = getRes.body.find((n) => n.id === createRes.body.id);
    expect(found).toBeDefined();
  });
});
