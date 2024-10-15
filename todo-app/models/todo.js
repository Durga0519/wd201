"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    // Add a new todo
    static addTodo({ title, dueDate, userId }) {
      return this.create({ title, dueDate, completed: false, userId });
    }

    // Get all todos
    static getTodos() {
      return this.findAll();
    }

    // Get overdue todos
    static async overdue(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          userId,
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get todos due today
    static async dueToday(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          userId: userId,
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get todos due later
    static async dueLater(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userId,
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get completed todos
    static async completedItems(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId, 
        },
      });
    }

    // Remove a todo by ID
    static async remove(id /*userId*/) {
      return this.destroy({
        where: {
          id, 
          //userId
        },
      });
    }

    // Set the completion status
    setCompletionStatus(isCompleted) {
      return this.update({ completed: isCompleted });
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false, // Ensure title is required
        validate: {
          notEmpty: {
            msg: 'Title is required.'
          }
        }
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false, // Ensure dueDate is required
        validate: {
          notEmpty: {
            msg: 'Due date is required.'
          }
        }
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};
