const {
  loginAs,
  withAuth,
  uniqueEmail,
  DEMO_PASSWORD,
  USERS,
} = require('./helpers/testApi');

describe('Ticket RBAC', () => {
  let privilegedRepToken;

  beforeAll(async () => {
    const { accessToken: adminToken } = await loginAs(USERS.admin);
    const email = uniqueEmail('privileged-rep');

    const createRes = await withAuth(adminToken).post('/admin/representatives').send({
      name: 'Privileged Rep',
      email,
      password: DEMO_PASSWORD,
      permissions: {
        canAssignTickets: true,
        canViewAllTickets: true,
      },
    });

    expect(createRes.status).toBe(201);

    const loginRes = await loginAs(email);
    expect(loginRes.user.permissions.canViewAllTickets).toBe(true);
    expect(loginRes.user.permissions.canAssignTickets).toBe(true);
    privilegedRepToken = loginRes.accessToken;
  });

  describe('Customer access boundaries', () => {
    it('customer list only returns own tickets', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).get('/tickets?limit=100');

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(
        res.body.tickets.every((t) => t.creator?.email === USERS.customer)
      ).toBe(true);
    });

    it('customer cannot view another customer ticket', async () => {
      const { accessToken: daveToken } = await loginAs(USERS.customerDave);
      const daveTickets = await withAuth(daveToken).get('/tickets?limit=1');
      const daveTicketId = daveTickets.body.tickets[0].id;

      const { accessToken: carolToken } = await loginAs(USERS.customer);
      const res = await withAuth(carolToken).get(`/tickets/${daveTicketId}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/permission/i);
    });

    it('customer cannot update tickets', async () => {
      const { accessToken } = await loginAs(USERS.customer);
      const listRes = await withAuth(accessToken).get('/tickets?limit=1');
      const ticketId = listRes.body.tickets[0].id;

      const res = await withAuth(accessToken)
        .put(`/tickets/${ticketId}`)
        .send({ title: 'Hacked title' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/access denied|cannot update/i);
    });
  });

  describe('Representative access boundaries', () => {
    it('rep without canViewAllTickets only sees assigned tickets', async () => {
      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const email = uniqueEmail('scoped-rep');

      await withAuth(adminToken).post('/admin/representatives').send({
        name: 'Scoped Rep',
        email,
        password: DEMO_PASSWORD,
      });

      const { accessToken, user } = await loginAs(email);
      const me = await withAuth(accessToken).get('/auth/me');

      expect(me.body.user.permissions.canViewAllTickets).toBe(false);

      const res = await withAuth(accessToken).get('/tickets?limit=100');

      expect(res.status).toBe(200);
      expect(res.body.tickets.every((t) => t.assignedTo === user.id)).toBe(true);
    });

    it('rep with canViewAllTickets sees all tickets', async () => {
      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const adminList = await withAuth(adminToken).get('/tickets?limit=100');

      const dianaList = await withAuth(privilegedRepToken).get('/tickets?limit=100');

      expect(dianaList.status).toBe(200);
      expect(dianaList.body.pagination.total).toBe(adminList.body.pagination.total);
    });

    it('users without canAssignTickets cannot list assignees', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).get('/tickets/assignees');

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/insufficient permissions/i);
    });

    it('rep with canAssignTickets can list assignees', async () => {
      const res = await withAuth(privilegedRepToken).get('/tickets/assignees');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.representatives)).toBe(true);
      expect(res.body.representatives.length).toBeGreaterThan(0);
    });
  });

  describe('Admin route protection', () => {
    it('customer cannot access admin endpoints', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).get('/admin/representatives');

      expect(res.status).toBe(403);
    });

    it('representative cannot access admin endpoints', async () => {
      const { accessToken } = await loginAs(USERS.rep);

      const res = await withAuth(accessToken).get('/admin/representatives');

      expect(res.status).toBe(403);
    });
  });
});
