const supertest = require('supertest');
const app = require('../../src/backend/app');

const DEMO_PASSWORD = 'Password123!';

const USERS = {
  admin: 'alice@example.com',
  rep: 'bob@example.com',
  repAll: 'diana@example.com',
  customer: 'carol@example.com',
  customerDave: 'dave@example.com',
  customerEve: 'eve@example.com',
};

async function loginAs(email, password = DEMO_PASSWORD) {
  const res = await supertest(app).post('/auth/login').send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return {
    accessToken: res.body.accessToken,
    user: res.body.user,
    cookies: res.headers['set-cookie'],
  };
}

function withAuth(token) {
  const agent = supertest(app);
  return {
    get: (url) => agent.get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => agent.post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => agent.put(url).set('Authorization', `Bearer ${token}`),
    patch: (url) => agent.patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => agent.delete(url).set('Authorization', `Bearer ${token}`),
  };
}

function api() {
  return supertest(app);
}

function agent() {
  return supertest.agent(app);
}

function uniqueEmail(prefix = 'test') {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

module.exports = {
  app,
  api,
  agent,
  loginAs,
  withAuth,
  uniqueEmail,
  DEMO_PASSWORD,
  USERS,
};
