'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tickets', 'resolvedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE Tickets
      SET resolvedAt = updatedAt
      WHERE status IN ('resolved', 'closed') AND resolvedAt IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Tickets', 'resolvedAt');
  },
};
