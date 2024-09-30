'use strict';
const {
  Model,
  Op // Ensure to import Op for Sequelize operators
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    // Method to add a new task to the database
    static async addTask(params) {
      return await Todo.create(params);
    }

    // Method to display the todo list
    static async showList() {
      console.log("My Todo list \n");

      // Display overdue tasks
      console.log("Overdue");
      const overdueTasks = await Todo.overdue();
      if (overdueTasks.length === 0) {
        console.log("No overdue tasks.");
      } else {
        console.log(overdueTasks.map(task => task.displayableString()).join("\n"));
      }
      console.log("\n");

      // Display tasks due today
      console.log("Due Today");
      const todayTasks = await Todo.dueToday();
      if (todayTasks.length === 0) {
        console.log("No tasks due today.");
      } else {
        console.log(todayTasks.map(task => task.displayableString()).join("\n"));
      }
      console.log("\n");

      // Display tasks due later
      console.log("Due Later");
      const laterTasks = await Todo.dueLater();
      if (laterTasks.length === 0) {
        console.log("No tasks due later.");
      } else {
        console.log(laterTasks.map(task => task.displayableString()).join("\n"));
      }
    }

    // Method to get overdue tasks
    static async overdue() {
      const today = new Date();
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: today, // Using Op.lt for "less than" comparison
          }
          // No completed filter here, to return all overdue tasks
        }
      });
    }

    // Method to get tasks due today
    static async dueToday() {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gte]: startOfToday, // Using Op.gte for "greater than or equal to"
            [Op.lt]: endOfToday // Using Op.lt for "less than"
          }
          // No completed filter here, to return all tasks due today
        }
      });
    }

    // Method to get tasks due later
    static async dueLater() {
      const today = new Date();
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: today, // Using Op.gt for "greater than" comparison
          }
          // No completed filter here, to return all future tasks
        }
      });
    }

    // Method to mark a task as complete
    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true; // Set completed to true
        await todo.save(); // Save the updated Todo
        console.log(`Marked todo ${id} as complete.`); // Debug log
      } else {
        throw new Error("Todo not found"); // Handle error
      }
    }

    // Method to display a task in a string format
    displayableString() {
      const today = new Date();
      const isToday = this.dueDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
      let checkbox = this.completed ? "[x]" : "[ ]"; // Determine if the task is completed

      // Format displayable string based on completion and due date
      if (this.completed && this.dueDate < today) {
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`; // Completed past-due tasks show date
      } else if (!this.completed && isToday) {
        return `${this.id}. ${checkbox} ${this.title}`; // Incomplete tasks due today do not show date
      } else if (this.completed && isToday) {
        return `${this.id}. ${checkbox} ${this.title}`; // Completed tasks due today do not show date
      } else {
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`; // All other cases show date
      }
    }
  }

  // Initialize the Todo model with fields and configurations
  Todo.init({
    title: DataTypes.STRING, // Title of the task
    dueDate: DataTypes.DATEONLY, // Due date of the task
    completed: DataTypes.BOOLEAN // Completion status of the task
  }, {
    sequelize,
    modelName: 'Todo', // Name of the model
  });

  return Todo; // Return the Todo model
};
