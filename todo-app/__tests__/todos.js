/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Create new todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Go to movie",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Redirect after creation
  });

  test("Mark todo as completed", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const latestTodo = parsedGroupedResponse.dueToday[parsedGroupedResponse.dueToday.length - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: true, // Mark as completed
    });

    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Mark todo as incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Read a book",
      dueDate: new Date().toISOString(),
      completed: true, // Initially marked as completed
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const latestTodo = parsedGroupedResponse.dueToday[parsedGroupedResponse.dueToday.length - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: false, // Mark as incomplete
    });

    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });

  test("Delete todo using ID", async () => {
    // Step 1: Create a new todo
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Go to shopping",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // Step 2: Fetch the created todos to get the latest one
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const latestTodo = parsedGroupedResponse.dueToday[parsedGroupedResponse.dueToday.length - 1];

    // Step 3: Get a new CSRF token for deletion
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    // Step 4: Send the delete request for the latest todo
    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200); // Assuming a successful delete returns 200
  });
});
