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

    test("responds with json at /todos", async () => {
        const response = await agent.post('/todos').send({
            'title': "Buy milk",
            dueDate: new Date().toISOString(),
            complete: false
        });

        expect(response.status).toBe(200);  // Check for successful response
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

        const parsedResponse = JSON.parse(response.text);
        expect(parsedResponse.id).toBeDefined();
    });

    test("Mark a todo as complete", async () => {
        const response = await agent.post('/todos').send({
            title: "Buy milk",
            dueDate: new Date().toISOString(),
            complete: false
        });
        const parsedResponse = JSON.parse(response.text);
        const todoID = parsedResponse.id;

        expect(parsedResponse.complete).toBe(false);

        const markCompleteResponse = await agent.put(`/todos/${todoID}/markAsCompleted`).send();
        const parsedUpdatedResponse = JSON.parse(markCompleteResponse.text);
        expect(parsedUpdatedResponse.complete).toBe(true);
    });

    test("Get all todos", async () => {
        await agent.post('/todos').send({
            'title': "Walk the dog",
            dueDate: new Date().toISOString(),
            complete: false
        });
        
        const response = await agent.get('/todos'); // Get all todos
        expect(response.status).toBe(200); // Check for successful response
        expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

        const todos = JSON.parse(response.text);
        expect(Array.isArray(todos)).toBe(true); // Ensure the response is an array
        expect(todos.length).toBeGreaterThan(0); // Check that there are todos in the response
    });

    test("Delete a todo by id", async () => {
        const response = await agent.post('/todos').send({
            'title': "Do the laundry",
            dueDate: new Date().toISOString(),
            complete: false
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
