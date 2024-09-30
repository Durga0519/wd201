var argv = require('minimist')(process.argv.slice(2));
const db = require("./models/index");

const markAsComplete = async (id) => {
  try {
    await db.Todo.markAsComplete(id); // This should set the completed status to true
  } catch (error) {
    console.error("Error marking todo as complete:", error);
  }
};

(async () => {
  const { id } = argv;
  if (!id) {
    throw new Error("Need to pass an id");
  }
  if (!Number.isInteger(Number(id))) {
    throw new Error("The id needs to be an integer");
  }
  await markAsComplete(id);
  await db.Todo.showList();
})();
