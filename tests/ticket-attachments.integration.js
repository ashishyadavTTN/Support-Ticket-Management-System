const fs = require('fs');
const path = require('path');
const { Ticket, Attachment } = require('../src/backend/models');
const { loginAs, withAuth, USERS } = require('./helpers/testApi');
const { UPLOAD_ROOT } = require('../src/backend/utils/attachmentStorage');

// Minimal valid 1x1 PNG
const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

describe('Ticket image attachments', () => {
  let createdTicketId;
  const createdAttachmentIds = [];

  afterEach(async () => {
    if (createdAttachmentIds.length) {
      await Attachment.destroy({ where: { id: createdAttachmentIds } });
      createdAttachmentIds.length = 0;
    }

    if (createdTicketId) {
      const uploadDir = path.join(UPLOAD_ROOT, 'tickets', String(createdTicketId));
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
      }
      await Ticket.destroy({ where: { id: createdTicketId } });
      createdTicketId = null;
    }
  });

  describe('POST /tickets with attachments', () => {
    it('allows a customer to create a ticket with images', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken)
        .post('/tickets')
        .field('title', 'Ticket with screenshot')
        .field('description', 'See attached image')
        .field('priority', 'medium')
        .attach('attachments', PNG_BUFFER, { filename: 'screenshot.png', contentType: 'image/png' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Ticket with screenshot');
      expect(res.body.attachments).toHaveLength(1);
      expect(res.body.attachments[0]).toMatchObject({
        originalName: 'screenshot.png',
        mimeType: 'image/png',
      });

      createdTicketId = res.body.id;
      createdAttachmentIds.push(res.body.attachments[0].id);
    });

    it('rejects more than 3 images per upload', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const req = withAuth(accessToken)
        .post('/tickets')
        .field('title', 'Too many images')
        .field('description', 'Testing limit');

      for (let i = 0; i < 4; i += 1) {
        req.attach('attachments', PNG_BUFFER, {
          filename: `image-${i}.png`,
          contentType: 'image/png',
        });
      }

      const res = await req;

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/3 images/i);
    });
  });

  describe('POST /tickets/:id/comments with attachments', () => {
    beforeEach(async () => {
      const { accessToken: customerToken } = await loginAs(USERS.customer);
      const createRes = await withAuth(customerToken).post('/tickets').send({
        title: 'Attachment comment test',
        description: 'Base ticket',
      });
      createdTicketId = createRes.body.id;

      const { accessToken: adminToken } = await loginAs(USERS.admin);
      const { user: repUser } = await loginAs(USERS.rep);
      await withAuth(adminToken)
        .put(`/tickets/${createdTicketId}`)
        .send({ assignedTo: repUser.id });
    });

    it('allows all roles to comment with images', async () => {
      const roles = [
        { user: USERS.customer, label: 'customer' },
        { user: USERS.rep, label: 'representative' },
        { user: USERS.admin, label: 'admin' },
      ];

      for (const { user } of roles) {
        const { accessToken } = await loginAs(user);

        const res = await withAuth(accessToken)
          .post(`/tickets/${createdTicketId}/comments`)
          .field('message', `Image from ${user}`)
          .attach('attachments', PNG_BUFFER, {
            filename: `${user}.png`,
            contentType: 'image/png',
          });

        expect(res.status).toBe(201);
        expect(res.body.attachments).toHaveLength(1);
        createdAttachmentIds.push(res.body.attachments[0].id);
      }
    });

    it('allows image-only comments without a message', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken)
        .post(`/tickets/${createdTicketId}/comments`)
        .attach('attachments', PNG_BUFFER, {
          filename: 'only-image.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('');
      expect(res.body.attachments).toHaveLength(1);
      createdAttachmentIds.push(res.body.attachments[0].id);
    });

    it('rejects non-image files', async () => {
      const { accessToken } = await loginAs(USERS.customer);

      const res = await withAuth(accessToken)
        .post(`/tickets/${createdTicketId}/comments`)
        .field('message', 'Bad file')
        .attach('attachments', Buffer.from('not an image'), {
          filename: 'notes.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/image/i);
    });
  });

  describe('GET /tickets/:id/attachments/:attachmentId', () => {
    it('serves attachment to authorized users and blocks others', async () => {
      const { accessToken: customerToken } = await loginAs(USERS.customer);
      const createRes = await withAuth(customerToken)
        .post('/tickets')
        .field('title', 'Private attachment ticket')
        .field('description', 'Testing access')
        .attach('attachments', PNG_BUFFER, {
          filename: 'private.png',
          contentType: 'image/png',
        });

      createdTicketId = createRes.body.id;
      const attachmentId = createRes.body.attachments[0].id;
      createdAttachmentIds.push(attachmentId);

      const ownerRes = await withAuth(customerToken).get(
        `/tickets/${createdTicketId}/attachments/${attachmentId}`
      );
      expect(ownerRes.status).toBe(200);
      expect(ownerRes.headers['content-type']).toMatch(/image\/png/);

      const { accessToken: otherCustomerToken } = await loginAs(USERS.customerDave);
      const deniedRes = await withAuth(otherCustomerToken).get(
        `/tickets/${createdTicketId}/attachments/${attachmentId}`
      );
      expect(deniedRes.status).toBe(404);
    });
  });
});
