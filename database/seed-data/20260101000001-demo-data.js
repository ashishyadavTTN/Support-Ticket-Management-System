'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // All seeded accounts use password: Password123!
    const passwordHash =
      '$2b$12$h7sczgJQ7GoVU2RQq1as2ucxBFNSTYKjsb5x8Pn4mV0pLSMpZ2pvy';

    const users = [
      {
        name: 'Alice Admin',
        email: 'alice@example.com',
        role: 'admin',
        passwordHash,
        isActive: true,
        permissions: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Bob Representative',
        email: 'bob@example.com',
        role: 'representative',
        passwordHash,
        isActive: true,
        permissions: JSON.stringify({
          canCreateTickets: false,
          canComment: true,
          canChangeStatus: true,
          canAssignTickets: false,
          canViewAllTickets: false,
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Diana Representative',
        email: 'diana@example.com',
        role: 'representative',
        passwordHash,
        isActive: true,
        permissions: JSON.stringify({
          canCreateTickets: true,
          canComment: true,
          canChangeStatus: true,
          canAssignTickets: true,
          canViewAllTickets: true,
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Carol Customer',
        email: 'carol@example.com',
        role: 'customer',
        passwordHash,
        isActive: true,
        permissions: JSON.stringify({
          canCreateTickets: true,
          canComment: true,
          canChangeStatus: false,
          canAssignTickets: false,
          canViewAllTickets: false,
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Dave Customer',
        email: 'dave@example.com',
        role: 'customer',
        passwordHash,
        isActive: true,
        permissions: JSON.stringify({
          canCreateTickets: true,
          canComment: true,
          canChangeStatus: false,
          canAssignTickets: false,
          canViewAllTickets: false,
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Eve Customer',
        email: 'eve@example.com',
        role: 'customer',
        passwordHash,
        isActive: true,
        permissions: JSON.stringify({
          canCreateTickets: true,
          canComment: true,
          canChangeStatus: false,
          canAssignTickets: false,
          canViewAllTickets: false,
        }),
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Users', users);

    const [insertedUsers] = await queryInterface.sequelize.query(
      `SELECT id, email FROM Users WHERE email IN (${users
        .map((u) => `'${u.email}'`)
        .join(', ')})`
    );
    const userId = Object.fromEntries(
      insertedUsers.map((row) => [row.email, row.id])
    );

    await queryInterface.bulkInsert('Tickets', [
      {
        title: 'Cannot log in to portal',
        description: 'Password reset link returns a 404 error.',
        priority: 'high',
        status: 'open',
        assignedTo: userId['bob@example.com'],
        createdBy: userId['carol@example.com'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Request feature: export tickets',
        description: 'Would like CSV export for ticket history.',
        priority: 'low',
        status: 'in_progress',
        assignedTo: userId['diana@example.com'],
        createdBy: userId['carol@example.com'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Billing discrepancy on invoice #4521',
        description: 'Charged twice for the same subscription period.',
        priority: 'critical',
        status: 'open',
        assignedTo: null,
        createdBy: userId['dave@example.com'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Mobile app crashes on startup',
        description: 'App closes immediately after splash screen on Android 14.',
        priority: 'high',
        status: 'in_progress',
        assignedTo: userId['bob@example.com'],
        createdBy: userId['eve@example.com'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Update shipping address',
        description: 'Need to change delivery address before next shipment.',
        priority: 'medium',
        status: 'resolved',
        assignedTo: userId['diana@example.com'],
        createdBy: userId['dave@example.com'],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Question about subscription renewal',
        description: 'Will my plan auto-renew at the current rate?',
        priority: 'low',
        status: 'closed',
        assignedTo: userId['bob@example.com'],
        createdBy: userId['eve@example.com'],
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [insertedTickets] = await queryInterface.sequelize.query(
      `SELECT id, title FROM Tickets WHERE createdBy IN (${Object.values(userId).join(', ')}) ORDER BY id`
    );
    const ticketId = Object.fromEntries(
      insertedTickets.map((row) => [row.title, row.id])
    );

    await queryInterface.bulkInsert('Comments', [
      {
        ticketId: ticketId['Cannot log in to portal'],
        message: 'Investigating the password reset flow.',
        createdBy: userId['bob@example.com'],
        createdAt: now,
      },
      {
        ticketId: ticketId['Cannot log in to portal'],
        message: 'Still unable to reset — please advise.',
        createdBy: userId['carol@example.com'],
        createdAt: now,
      },
      {
        ticketId: ticketId['Request feature: export tickets'],
        message: 'Added to sprint backlog for next release.',
        createdBy: userId['diana@example.com'],
        createdAt: now,
      },
      {
        ticketId: ticketId['Billing discrepancy on invoice #4521'],
        message: 'Escalating to billing team.',
        createdBy: userId['diana@example.com'],
        createdAt: now,
      },
      {
        ticketId: ticketId['Mobile app crashes on startup'],
        message: 'Can you share your device model and OS version?',
        createdBy: userId['bob@example.com'],
        createdAt: now,
      },
      {
        ticketId: ticketId['Update shipping address'],
        message: 'Address updated successfully.',
        createdBy: userId['diana@example.com'],
        createdAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Comments', null, {});
    await queryInterface.bulkDelete('Tickets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
