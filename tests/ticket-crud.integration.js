const { Ticket } = require('../src/backend/models');
const { loginAs, withAuth, USERS } = require('./helpers/testApi');

describe('Ticket CRUD', () => {
  let createdTicketId;

  afterEach(async () => {
    if (createdTicketId) {
      await Ticket.destroy({ where: { id: createdTicketId } });
      createdTicketId = null;
    }
  });

  describe('POST /tickets', () => {
    it('allows a customer to create a ticket', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).post('/tickets').send({
        title: 'Need help with billing',
        description: 'I was charged twice.',
        priority: 'high',
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Need help with billing',
        status: 'open',
        priority: 'high',
      });
      expect(res.body.assignedTo).not.toBeNull();

      createdTicketId = res.body.id;
    });

    it('returns 400 when title is missing', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).post('/tickets').send({
        description: 'No title provided',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /tickets', () => {
    it('returns paginated tickets for admin', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/tickets?limit=5&page=1');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tickets)).toBe(true);
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 5,
      });
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('filters tickets by search keyword', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/tickets?search=password');

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(
        res.body.tickets.some((t) =>
          `${t.title} ${t.description}`.toLowerCase().includes('password')
        )
      ).toBe(true);
    });

    it('filters tickets by status', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/tickets?status=open&limit=100');

      expect(res.status).toBe(200);
      expect(res.body.tickets.length).toBeGreaterThan(0);
      expect(res.body.tickets.every((t) => t.status === 'open')).toBe(true);
    });
  });

  describe('GET /tickets/:id', () => {
    it('returns ticket detail with comments for authorized user', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const listRes = await withAuth(accessToken).get('/tickets?limit=1');
      const ticketId = listRes.body.tickets[0].id;

      const res = await withAuth(accessToken).get(`/tickets/${ticketId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(ticketId);
      expect(Array.isArray(res.body.comments)).toBe(true);
    });
  });

  describe('PUT /tickets/:id', () => {
    it('allows a representative to update ticket fields', async () => {
      const { accessToken: customerToken } = await loginAs(USERS.customer);
      const createRes = await withAuth(customerToken).post('/tickets').send({
        title: 'Update test ticket',
        description: 'Original description',
      });

      createdTicketId = createRes.body.id;

      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const updateRes = await withAuth(adminToken)
        .put(`/tickets/${createdTicketId}`)
        .send({
          title: 'Updated title',
          priority: 'critical',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toMatchObject({
        title: 'Updated title',
        priority: 'critical',
      });
    });

    it('rejects status updates via PUT', async () => {
      const { accessToken: customerToken } = await loginAs(USERS.customer);
      const createRes = await withAuth(customerToken).post('/tickets').send({
        title: 'Status via PUT test',
        description: 'Should fail',
      });

      createdTicketId = createRes.body.id;

      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const res = await withAuth(adminToken)
        .put(`/tickets/${createdTicketId}`)
        .send({ status: 'closed' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/PATCH.*status/i);
    });
  });

  describe('Comments', () => {
    it('POST /tickets/:id/comments — adds a comment', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const listRes = await withAuth(accessToken).get('/tickets?limit=1');
      const ticketId = listRes.body.tickets[0].id;

      const res = await withAuth(accessToken)
        .post(`/tickets/${ticketId}/comments`)
        .send({ message: 'Integration test comment' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Integration test comment');
      expect(res.body.author).toBeDefined();
    });

    it('GET /tickets/:id/comments — lists comments', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const listRes = await withAuth(accessToken).get('/tickets?limit=1');
      const ticketId = listRes.body.tickets[0].id;

      const res = await withAuth(accessToken).get(`/tickets/${ticketId}/comments`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
