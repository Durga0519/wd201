"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // define association here
    }

    // Add a new todo
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    // Get all todos
    static getTodos() {
      return this.findAll();
    }

    // Get overdue todos
    static async overdue() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(), 
          },
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get todos due today
    static async dueToday() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(), 
          },
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get todos due later
    static async dueLater() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(), 
          },
          completed: false, // Only get incomplete todos
        },
      });
    }

    // Get completed todos
    static async completedItems() {
      return this.findAll({
        where: {
          completed: true, // Get only completed todos
        },
      });
    }

    // Remove a todo by ID
    static async remove(id) {
      return this.destroy({
        where: {
          id,
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
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  
  return Todo;
};
