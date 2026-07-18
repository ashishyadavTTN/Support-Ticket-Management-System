'use strict';

/**
 * Converts ticket primary keys from INTEGER identity to UUID.
 * Existing ticket data is cleared because integer IDs cannot be preserved
 * as non-guessable UUIDs without a full remap.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('Attachments');
    await queryInterface.dropTable('Comments');
    await queryInterface.dropTable('Tickets');

    await queryInterface.createTable('Tickets', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('NEWID()'),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priority: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'medium',
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'open',
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('Attachments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      originalName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      storedName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      sizeBytes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('Attachments', ['ticketId']);
    await queryInterface.addIndex('Attachments', ['commentId']);
  },

  async down() {
    throw new Error('Ticket UUID migration cannot be reversed automatically.');
  },
};
