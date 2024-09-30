const db = require("./models/index");

const listTodo = async () => {
  try {
    await db.Todo.showList(); // Displays the todos categorized by due date
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await listTodo();
})();
