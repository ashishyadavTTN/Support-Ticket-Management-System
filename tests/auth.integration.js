const {
  api,
  agent,
  loginAs,
  withAuth,
  uniqueEmail,
  DEMO_PASSWORD,
  USERS,
} = require('./helpers/testApi');

describe('Auth', () => {
  describe('POST /auth/login', () => {
    it('returns access token and user for valid credentials', async () => {
      const res = await api().post('/auth/login').send({
        email: USERS.customer,
        password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toMatchObject({
        email: USERS.customer,
        role: 'customer',
      });
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 for invalid password', async () => {
      const res = await api().post('/auth/login').send({
        email: USERS.customer,
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid email or password/i);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await api().post('/auth/login').send({
        email: 'not-an-email',
        password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/register', () => {
    it('creates a customer account and returns tokens', async () => {
      const email = uniqueEmail('register');

      const res = await api().post('/auth/register').send({
        name: 'Test Customer',
        email,
        password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user).toMatchObject({
        email,
        role: 'customer',
      });
    });

    it('returns 409 when email already exists', async () => {
      const res = await api().post('/auth/register').send({
        name: 'Duplicate',
        email: USERS.customer,
        password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the authenticated user', async () => {
      const { accessToken } = await loginAs(USERS.admin);
      const res = await withAuth(accessToken).get('/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        email: USERS.admin,
        role: 'admin',
      });
    });

    it('returns 401 without a token', async () => {
      const res = await api().get('/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/authentication required/i);
    });
  });

  describe('POST /auth/refresh', () => {
    it('issues a new access token when refresh cookie is present', async () => {
      const testAgent = agent();
      const loginRes = await testAgent.post('/auth/login').send({
        email: USERS.customer,
        password: DEMO_PASSWORD,
      });

      expect(loginRes.status).toBe(200);

      const refreshRes = await testAgent.post('/auth/refresh');

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.accessToken).toBeDefined();
      expect(refreshRes.body.user.email).toBe(USERS.customer);
    });

    it('returns 401 without refresh cookie', async () => {
      const res = await api().post('/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/refresh token not found/i);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns success message', async () => {
      const res = await api().post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });

  describe('PATCH /auth/profile', () => {
    it('updates the user name', async () => {
      const { accessToken, user } = await loginAs(USERS.customerEve);
      const originalName = user.name;
      const newName = `${originalName} Updated`;

      const res = await withAuth(accessToken)
        .patch('/auth/profile')
        .send({ name: newName });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe(newName);

      await withAuth(accessToken)
        .patch('/auth/profile')
        .send({ name: originalName });
    });
  });

  describe('PATCH /auth/password', () => {
    it('returns 401 when current password is wrong', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken)
        .patch('/auth/password')
        .send({
          currentPassword: 'wrong-password',
          newPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/incorrect/i);
    });
  });
});
