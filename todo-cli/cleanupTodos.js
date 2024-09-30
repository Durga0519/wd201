const db = require("./models/index");

const cleanupTodos = async () => {
  try {
    await db.Todo.destroy({
      where: {}, // This will match all records
      truncate: true // This will delete all records
    });
    console.log("All todos have been deleted.");
  } catch (error) {
    console.error("Error while cleaning up todos:", error);
  }
};

(async () => {
  await cleanupTodos();
})();
