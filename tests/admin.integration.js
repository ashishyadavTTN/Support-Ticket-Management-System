const {
  api,
  loginAs,
  withAuth,
  uniqueEmail,
  DEMO_PASSWORD,
  USERS,
} = require('./helpers/testApi');

describe('Admin', () => {
  describe('GET /admin/representatives', () => {
    it('returns representatives for admin', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/admin/representatives');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.representatives)).toBe(true);
      expect(res.body.representatives.length).toBeGreaterThan(0);
      expect(res.body.representatives[0]).toHaveProperty('assignedTicketCount');
    });

    it('returns active reps only with activeOnly=true', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get(
        '/admin/representatives?activeOnly=true'
      );

      expect(res.status).toBe(200);
      expect(res.body.representatives.every((r) => r.email)).toBe(true);
      expect(res.body.representatives[0]).not.toHaveProperty('permissions');
    });
  });

  describe('GET /admin/customers', () => {
    it('returns active customers', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/admin/customers');

      expect(res.status).toBe(200);
      expect(res.body.customers.length).toBeGreaterThan(0);
      expect(res.body.customers[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
      });
    });
  });

  describe('GET /admin/default-permissions', () => {
    it('returns the default permission template', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/admin/default-permissions');

      expect(res.status).toBe(200);
      expect(res.body.template).toMatchObject({
        canCreateTickets: expect.any(Boolean),
        canComment: expect.any(Boolean),
        canChangeStatus: expect.any(Boolean),
        canAssignTickets: expect.any(Boolean),
        canViewAllTickets: expect.any(Boolean),
      });
    });
  });

  describe('POST /admin/representatives', () => {
    it('creates a new representative', async () => {
      const { accessToken } = await loginAs(USERS.admin);
      const email = uniqueEmail('newrep');

      const res = await withAuth(accessToken).post('/admin/representatives').send({
        name: 'Test Representative',
        email,
        password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({
        email,
        role: 'representative',
        isActive: true,
      });
    });
  });

  describe('PATCH /admin/representatives/:id/permissions', () => {
    it('persists permission changes visible on GET /admin/representatives', async () => {
      const { accessToken } = await loginAs(USERS.admin);
      const email = uniqueEmail('permupdate');

      const createRes = await withAuth(accessToken).post('/admin/representatives').send({
        name: 'Permission Update Test Rep',
        email,
        password: DEMO_PASSWORD,
      });

      const repId = createRes.body.user.id;

      const patchRes = await withAuth(accessToken)
        .patch(`/admin/representatives/${repId}/permissions`)
        .send({
          permissions: {
            canCreateTickets: true,
            canComment: false,
            canChangeStatus: true,
            canAssignTickets: true,
            canViewAllTickets: true,
          },
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.user.permissions).toMatchObject({
        canCreateTickets: true,
        canComment: false,
        canChangeStatus: true,
        canAssignTickets: true,
        canViewAllTickets: true,
      });

      const listRes = await withAuth(accessToken).get('/admin/representatives');
      const listed = listRes.body.representatives.find((r) => r.id === repId);

      expect(listed.permissions).toEqual(patchRes.body.user.permissions);
    });

    it('deactivates a representative and blocks login', async () => {
      const { accessToken } = await loginAs(USERS.admin);
      const email = uniqueEmail('deactivate');

      const createRes = await withAuth(accessToken).post('/admin/representatives').send({
        name: 'Deactivate Test Rep',
        email,
        password: DEMO_PASSWORD,
      });

      const repId = createRes.body.user.id;

      const deactivateRes = await withAuth(accessToken)
        .patch(`/admin/representatives/${repId}/permissions`)
        .send({ isActive: false });

      expect(deactivateRes.status).toBe(200);
      expect(deactivateRes.body.user.isActive).toBe(false);

      const loginRes = await api().post('/auth/login').send({
        email,
        password: DEMO_PASSWORD,
      });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error).toMatch(/deactivated/i);

      await withAuth(accessToken)
        .patch(`/admin/representatives/${repId}/permissions`)
        .send({ isActive: true });
    });
  });
});
