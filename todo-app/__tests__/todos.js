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

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);
  await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

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

  test("Sign up", async () => {
    const res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    
    const response = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user@gmail.com",
      password: "123456",
      _csrf: csrfToken,
    });
    
    expect(response.statusCode).toBe(302); // Expect a redirect on successful signup
  });

  test("Sign out", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);

    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302); // Expect a redirect after signing out

    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302); // Expect to be redirected when accessing todos after signing out
  });

  test("Create new todo", async () => {
    await login(agent, "user@gmail.com", "123456");
    
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    
    const response = await agent.post("/todos").send({
      title: "Go to movie",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    
    expect(response.statusCode).toBe(302); // Expect a redirect after creating a todo
  });

  test("Mark todo as completed", async () => {
    await login(agent, "user@gmail.com", "123456");

    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const latestTodo = parsedGroupedResponse.dueToday[parsedGroupedResponse.dueToday.length - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: true, // Mark as completed
    });

    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true); // Expect the todo to be marked as completed
  });

  test("Mark todo as incomplete", async () => {
    await login(agent, "user@gmail.com", "123456");

    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Read a book",
      dueDate: new Date().toISOString(),
      completed: true, // Initially marked as completed
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const latestTodo = parsedGroupedResponse.dueToday[parsedGroupedResponse.dueToday.length - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: false, // Mark as incomplete
    });

    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(false); // Expect the todo to be marked as incomplete
  });

  test("Delete todo using ID", async () => {
    await login(agent, "user@gmail.com", "123456");

    // Step 1: Create a new todo
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Go to shopping",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // Step 2: Fetch the created todos to get the latest one
    const groupedTodosResponse = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    expect(parsedGroupedResponse.dueToday).toBeDefined();

    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    // Step 3: Get a new CSRF token for deletion
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    // Step 4: Send the delete request for the latest todo
    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });

    expect(response.statusCode).toBe(200); // Expect a successful delete response
  });
});
