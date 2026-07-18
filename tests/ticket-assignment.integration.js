const { Ticket } = require('../src/backend/models');
const { findRepresentativeWithLowestQueue } = require('../src/backend/utils/ticketAssignment');
const {
  loginAs,
  withAuth,
  uniqueEmail,
  DEMO_PASSWORD,
  USERS,
} = require('./helpers/testApi');

describe('Ticket auto-assignment and representative creation', () => {
  let repWithCreateToken;
  let repWithoutCreateToken;
  const createdTicketIds = [];

  beforeAll(async () => {
    const { accessToken: adminToken } = await loginAs(USERS.admin);
    const creatorEmail = uniqueEmail('ticket-creator-rep');
    const scopedEmail = uniqueEmail('scoped-rep');

    const [createRes, scopedRes] = await Promise.all([
      withAuth(adminToken).post('/admin/representatives').send({
        name: 'Ticket Creator Rep',
        email: creatorEmail,
        password: DEMO_PASSWORD,
        permissions: {
          canCreateTickets: true,
          canAssignTickets: true,
        },
      }),
      withAuth(adminToken).post('/admin/representatives').send({
        name: 'Scoped Rep',
        email: scopedEmail,
        password: DEMO_PASSWORD,
      }),
    ]);

    expect(createRes.status).toBe(201);
    expect(scopedRes.status).toBe(201);

    const [loginRes, scopedLoginRes] = await Promise.all([
      loginAs(creatorEmail),
      loginAs(scopedEmail),
    ]);
    repWithCreateToken = loginRes.accessToken;
    repWithoutCreateToken = scopedLoginRes.accessToken;
  });

  afterEach(async () => {
    if (createdTicketIds.length > 0) {
      await Ticket.destroy({ where: { id: createdTicketIds } });
      createdTicketIds.length = 0;
    }
  });

  describe('Customer ticket auto-assignment', () => {
    it('auto-assigns a new customer ticket to the rep with the lowest queue', async () => {
      const expectedRepId = await findRepresentativeWithLowestQueue();
      expect(expectedRepId).not.toBeNull();

      const { accessToken } = await loginAs(USERS.customer);
      const res = await withAuth(accessToken).post('/tickets').send({
        title: 'Auto-assign integration test',
        description: 'Should route to the least busy representative.',
        priority: 'medium',
      });

      expect(res.status).toBe(201);
      expect(res.body.assignedTo).toBe(expectedRepId);
      createdTicketIds.push(res.body.id);
    });
  });

  describe('Representative ticket creation', () => {
    it('allows a rep with canCreateTickets to create a ticket for a customer', async () => {
      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const customersRes = await withAuth(adminToken).get('/admin/customers');
      const customerId = customersRes.body.customers[0].id;

      const res = await withAuth(repWithCreateToken).post('/tickets').send({
        title: 'Rep-created ticket',
        description: 'Created on behalf of a customer.',
        priority: 'high',
        createdBy: customerId,
      });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Rep-created ticket',
        createdBy: customerId,
        status: 'open',
      });
      createdTicketIds.push(res.body.id);
    });

    it('rejects ticket creation for reps without canCreateTickets', async () => {
      const res = await withAuth(repWithoutCreateToken).post('/tickets').send({
        title: 'Unauthorized rep ticket',
        description: 'Should be rejected.',
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/canCreateTickets/i);
    });

    it('requires createdBy when an admin creates a ticket', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).post('/tickets').send({
        title: 'Admin ticket missing customer',
        description: 'Should fail validation.',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/createdBy/i);
    });

    it('allows reps with canCreateTickets to list customers', async () => {
      const res = await withAuth(repWithCreateToken).get('/tickets/customers');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.customers)).toBe(true);
      expect(res.body.customers.length).toBeGreaterThan(0);
      expect(res.body.customers.every((c) => c.email)).toBe(true);
    });

    it('denies customer list to reps without canCreateTickets', async () => {
      const res = await withAuth(repWithoutCreateToken).get('/tickets/customers');

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/insufficient permissions/i);
    });
  });
});
