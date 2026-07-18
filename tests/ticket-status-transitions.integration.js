const { Ticket } = require('../src/backend/models');
const { loginAs, withAuth, USERS } = require('./helpers/testApi');

describe('Ticket status transitions', () => {
  let ticketId;

  beforeAll(async () => {
    const { accessToken } = await loginAs(USERS.customer);
    const res = await withAuth(accessToken).post('/tickets').send({
      title: `Status transition test ${Date.now()}`,
      description: 'Temporary ticket for status machine tests',
      priority: 'medium',
    });

    expect(res.status).toBe(201);
    ticketId = res.body.id;
  });

  afterAll(async () => {
    if (ticketId) {
      await Ticket.destroy({ where: { id: ticketId } });
    }
  });

  it('PATCH /tickets/:id/status — allowed transitions', async () => {
    const { accessToken } = await loginAs(USERS.admin);

    const openToProgress = await withAuth(accessToken)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: 'in_progress' });

    expect(openToProgress.status).toBe(200);
    expect(openToProgress.body.status).toBe('in_progress');

    const toResolved = await withAuth(accessToken)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: 'resolved' });

    expect(toResolved.status).toBe(200);
    expect(toResolved.body.status).toBe('resolved');
    expect(toResolved.body.resolvedAt).not.toBeNull();

    const toClosed = await withAuth(accessToken)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: 'closed' });

    expect(toClosed.status).toBe(200);
    expect(toClosed.body.status).toBe('closed');
  });

  it('PATCH /tickets/:id/status — rejected invalid transitions', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customer);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `Invalid transition test ${Date.now()}`,
      description: 'Should reject open to closed',
    });

    const tempId = createRes.body.id;
    const { accessToken } = await loginAs(USERS.admin);

    const res = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'closed' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot transition/i);

    await Ticket.destroy({ where: { id: tempId } });
  });

  it('PATCH /tickets/:id/status — returns 404 for missing ticket', async () => {
    const { accessToken } = await loginAs(USERS.admin);

    const res = await withAuth(accessToken)
      .patch('/tickets/999999/status')
      .send({ status: 'in_progress' });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('PATCH /tickets/:id/status — clears resolvedAt when leaving resolved', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customerDave);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `ResolvedAt test ${Date.now()}`,
      description: 'Verify resolvedAt side effects',
    });

    const tempId = createRes.body.id;
    const { accessToken: adminToken } = await loginAs(USERS.admin);

    await withAuth(adminToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'in_progress' });

    const resolvedRes = await withAuth(adminToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'resolved' });

    expect(resolvedRes.body.resolvedAt).not.toBeNull();

    const reopenRes = await withAuth(adminToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'in_progress' });

    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.resolvedAt).toBeNull();

    await Ticket.destroy({ where: { id: tempId } });
  });

  it('PATCH /tickets/:id/status — returns 403 for customers', async () => {
    const { accessToken } = await loginAs(USERS.customer);

    const res = await withAuth(accessToken)
      .patch(`/tickets/${ticketId}/status`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/access denied|cannot change ticket status/i);
  });

  it('PATCH /tickets/:id/status — open to cancelled', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customerEve);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `Cancel from open ${Date.now()}`,
      description: 'Valid open to cancelled transition',
    });

    const tempId = createRes.body.id;
    const { accessToken } = await loginAs(USERS.admin);

    const res = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');

    await Ticket.destroy({ where: { id: tempId } });
  });

  it('PATCH /tickets/:id/status — in_progress to cancelled', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customerEve);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `Cancel from in_progress ${Date.now()}`,
      description: 'Valid in_progress to cancelled transition',
    });

    const tempId = createRes.body.id;
    const { accessToken } = await loginAs(USERS.admin);

    await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'in_progress' });

    const res = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');

    await Ticket.destroy({ where: { id: tempId } });
  });

  it('PATCH /tickets/:id/status — rejects resolved to open (non-terminal invalid)', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customerDave);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `Resolved to open test ${Date.now()}`,
      description: 'resolved may reopen to in_progress but not jump straight to open',
    });

    const tempId = createRes.body.id;
    const { accessToken } = await loginAs(USERS.admin);

    await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'in_progress' });

    const resolvedRes = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'resolved' });

    expect(resolvedRes.status).toBe(200);

    const resolvedToOpen = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'open' });

    expect(resolvedToOpen.status).toBe(400);
    expect(resolvedToOpen.body.error).toMatch(/cannot transition/i);

    await Ticket.destroy({ where: { id: tempId } });
  });

  it('PATCH /tickets/:id/status — rejects transitions from terminal statuses', async () => {
    const { accessToken: customerToken } = await loginAs(USERS.customerDave);
    const createRes = await withAuth(customerToken).post('/tickets').send({
      title: `Terminal status test ${Date.now()}`,
      description: 'Should not reopen from closed or cancelled',
    });

    const tempId = createRes.body.id;
    const { accessToken } = await loginAs(USERS.admin);

    await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'cancelled' });

    const fromCancelled = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'open' });

    expect(fromCancelled.status).toBe(400);
    expect(fromCancelled.body.error).toMatch(/cannot transition/i);

    const fromCancelledToProgress = await withAuth(accessToken)
      .patch(`/tickets/${tempId}/status`)
      .send({ status: 'in_progress' });

    expect(fromCancelledToProgress.status).toBe(400);

    const closedTicketRes = await withAuth(customerToken).post('/tickets').send({
      title: `Closed terminal test ${Date.now()}`,
      description: 'Should not reopen from closed',
    });

    const closedId = closedTicketRes.body.id;

    await withAuth(accessToken)
      .patch(`/tickets/${closedId}/status`)
      .send({ status: 'in_progress' });

    await withAuth(accessToken)
      .patch(`/tickets/${closedId}/status`)
      .send({ status: 'resolved' });

    await withAuth(accessToken)
      .patch(`/tickets/${closedId}/status`)
      .send({ status: 'closed' });

    const fromClosed = await withAuth(accessToken)
      .patch(`/tickets/${closedId}/status`)
      .send({ status: 'open' });

    expect(fromClosed.status).toBe(400);
    expect(fromClosed.body.error).toMatch(/cannot transition/i);

    await Ticket.destroy({ where: { id: [tempId, closedId] } });
  });
});
