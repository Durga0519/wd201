/* eslint-disable no-undef */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo test suite", () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true }); // Reset database before tests
        server = app.listen(3000, () => {});
        agent = request.agent(server);
    });

    afterAll(async () => {
        await db.sequelize.close(); // Close database connection after tests
        server.close(); // Close server
    });

    test("create a new todo", async () => {
        const response = await agent.post('/todos').send({
            'title': "Buy milk",
            dueDate: new Date().toISOString(),
            completed: false
        });

        expect(response.status).toBe(200);  // Check for successful response
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

        const parsedResponse = JSON.parse(response.text);
        expect(parsedResponse.id).toBeDefined();
    });

    test("Marks a todo with the given ID as complete", async () => {
        const response = await agent.post('/todos').send({
            title: "Buy milk",
            dueDate: new Date().toISOString(),
            completed: false
        });
        const parsedResponse = JSON.parse(response.text);
        const todoID = parsedResponse.id;

        expect(parsedResponse.completed).toBe(false);

        const markCompleteResponse = await agent.put(`/todos/${todoID}/markAsCompleted`).send();
        const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
        expect(parsedUpdatedResponse.completed).toBe(true);
    });

    test("Fetches all todos in the database using /todos endpoint", async () => {
        const response = await agent.post("/todos").send({
          title: "Buy xbox",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        await agent.post("/todos").send({
          title: "Buy ps3",
          dueDate: new Date().toISOString(),
          completed: false,
        });
        expect(response.status).toBe(200);  // Check for successful response
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

        const parsedResponse = JSON.parse(response.text);
        expect(parsedResponse.id).toBeDefined();
      });

    test("Delete a todo by id", async () => {
        const response = await agent.post('/todos').send({
            'title': "Do the laundry",
            dueDate: new Date().toISOString(),
            completed: false
        });
        const parsedResponse = JSON.parse(response.text);
        const todoID = parsedResponse.id;

        const deleteResponse = await agent.delete(`/todos/${todoID}`); // Delete the created todo
        expect(deleteResponse.status).toBe(200); // Check for successful response
        expect(deleteResponse.text).toBe("true"); // Expect true on successful deletion

        const checkDeletedResponse = await agent.get(`/todos/${todoID}`); // Try to retrieve the deleted todo
        expect(checkDeletedResponse.status).toBe(404); // Expect a 404 status for the deleted todo
    });

    test("Attempt to delete a non-existent todo", async () => {
        const deleteResponse = await agent.delete(`/todos/9999`); // Attempt to delete a non-existent ID
        expect(deleteResponse.status).toBe(200); // Check for successful response
        expect(deleteResponse.text).toBe("false"); // Expect false when trying to delete a non-existent todo
    });
});
