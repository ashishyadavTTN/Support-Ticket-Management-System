const { loginAs, withAuth, USERS } = require('./helpers/testApi');

describe('Dashboard', () => {
  describe('GET /admin/dashboard-stats', () => {
    it('returns org-wide metrics for admin', async () => {
      const { accessToken } = await loginAs(USERS.admin);

      const res = await withAuth(accessToken).get('/admin/dashboard-stats');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        openTickets: { total: expect.any(Number) },
        activeUsers: {
          total: expect.any(Number),
          byRole: {
            admin: expect.any(Number),
            representative: expect.any(Number),
            customer: expect.any(Number),
          },
        },
        avgResolution: {
          windowDays: 30,
          resolvedCount: expect.any(Number),
        },
      });
    });
  });

  describe('GET /dashboard/stats', () => {
    it('returns customer ticket counts by status', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken).get('/dashboard/stats');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        role: 'customer',
        stats: {
          ticketsByStatus: {
            open: expect.any(Number),
            in_progress: expect.any(Number),
            resolved: expect.any(Number),
            closed: expect.any(Number),
            cancelled: expect.any(Number),
          },
          totalTickets: expect.any(Number),
        },
      });
    });

    it('returns representative assigned ticket stats', async () => {
      const { accessToken } = await loginAs(USERS.rep);

      const res = await withAuth(accessToken).get('/dashboard/stats');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        role: 'representative',
        stats: {
          openAssignedTickets: expect.any(Number),
          avgResolution: {
            windowDays: 30,
            resolvedCount: expect.any(Number),
          },
        },
      });
    });
  });
});
