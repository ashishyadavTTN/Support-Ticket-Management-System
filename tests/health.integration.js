const { api } = require('./helpers/testApi');

describe('Health', () => {
  it('GET /health responds OK', async () => {
    const res = await api().get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
