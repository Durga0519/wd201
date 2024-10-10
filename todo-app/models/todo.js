"use strict";
const { Model, Op } = require("sequelize"); // Make sure to import Op

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    // Helper method for defining associations.
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(), 
          },
          
        },
      });
    }

    static async dueToday() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(), // Use Op.eq for today
          },
          
        },
      });
    }

    static async dueLater() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(), // Use Op.gt for future dates
          },
  
        },
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
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
