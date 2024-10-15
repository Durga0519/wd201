'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Todos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false, 
        validate: {
          notNull: {
            msg: "Title cannot be null"
          },
          len: {
            args: [5, 255],  // Ensure title has a minimum length of 5 characters
            msg: "Title must be at least 5 characters long"
          }
        }
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,  // Allow null values
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,  // Set default value for completed
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),  // Set default value
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),  // Set default value
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Todos');
  }
};
