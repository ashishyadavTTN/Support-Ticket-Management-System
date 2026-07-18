'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'passwordHash', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('Users', 'permissions', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON permission overrides for Representatives',
    });

    // Migrate legacy "agent" role from initial scaffold to "representative"
    await queryInterface.sequelize.query(
      "UPDATE Users SET role = 'representative' WHERE role = 'agent'"
    );

    const repAssignedOnly = JSON.stringify({
      canCreateTickets: false,
      canComment: true,
      canChangeStatus: true,
      canAssignTickets: false,
      canViewAllTickets: false,
    });

    const customerPerms = JSON.stringify({
      canCreateTickets: true,
      canComment: true,
      canChangeStatus: false,
      canAssignTickets: false,
      canViewAllTickets: false,
    });

    // Backfill permissions for existing seeded rows (admin keeps null = implicit full access)
    await queryInterface.sequelize.query(`
      UPDATE Users
      SET permissions = '${repAssignedOnly}'
      WHERE role = 'representative' AND permissions IS NULL
    `);

    await queryInterface.sequelize.query(`
      UPDATE Users
      SET permissions = '${customerPerms}'
      WHERE role = 'customer' AND permissions IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'permissions');
    await queryInterface.removeColumn('Users', 'isActive');
    await queryInterface.removeColumn('Users', 'passwordHash');

    await queryInterface.sequelize.query(
      "UPDATE Users SET role = 'agent' WHERE role = 'representative'"
    );
  },
};
