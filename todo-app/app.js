/* eslint-disable no-undef */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const { Todo } = require("./models");

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the index page and display todos
app.get("/", async (request, response) => {
    try {
        const allTodos = await Todo.getTodos(); // Fetch all todos from the database

        if (request.accepts("html")) {
            // If the client accepts HTML, render the index page with todos
            response.render('index', {
                allTodos
            });
        } else {
            // Otherwise, respond with JSON data (e.g., for API clients)
            response.json({
                allTodos
            });
        }
    } catch (error) {
        console.error("Error fetching todos:", error);
        response.status(500).send("Error loading todos");
    }
});

// API route to get all todos (in JSON format)
app.get("/todos", async function (_request, response) {
    try {
        const todos = await Todo.findAll(); // Fetch all todos
        return response.json(todos); // Return todos as JSON
    } catch (error) {
        console.error(error);
        return response.status(422).json(error); // Return 422 error if something goes wrong
    }
});

// API route to create a new todo
app.post("/todos", async (request, response) => {
    try {
        const todo = await Todo.addTodo({
            title: request.body.title, // Todo title from the request body
            dueDate: request.body.dueDate, // Due date from the request body
            complete: false // Default completed status to false
        });
        return response.json(todo); // Return the created todo as JSON
    } catch (error) {
        console.error(error);
        return response.status(422).json(error); // Return 422 error if creation fails
    }
});

// API route to mark a todo as completed
app.put("/todos/:id/markAsCompleted", async (request, response) => {
    try {
        const todo = await Todo.findByPk(request.params.id); // Find the todo by its ID
        if (todo) {
            const updatedTodo = await todo.markAsCompleted(); // Mark the todo as completed
            return response.json(updatedTodo); // Return the updated todo as JSON
        } else {
            return response.status(404).json({ message: "Todo not found" }); // 404 if todo doesn't exist
        }
    } catch (error) {
        console.error(error);
        return response.status(422).json(error); // Return 422 error if update fails
    }
});

// API route to get a specific todo by its ID
app.get("/todos/:id", async (request, response) => {
    try {
        const todo = await Todo.findByPk(request.params.id); // Find the todo by its ID
        if (todo) {
            return response.json(todo); // Return the found todo as JSON
        } else {
            return response.status(404).json({ message: "Todo not found" }); // Return 404 if no todo found
        }
    } catch (error) {
        console.error(error);
        return response.status(422).json(error); // Return 422 error if something goes wrong
    }
});

// API route to delete a todo by its ID
app.delete("/todos/:id", async (request, response) => {
    try {
        const deleted = await Todo.destroy({ where: { id: request.params.id } }); // Delete the todo by ID
        if (deleted) {
            return response.send(true); // Return true if deletion was successful
        } else {
            return response.send(false); // Return false if todo was not found
        }
    } catch (error) {
        console.error(error);
        return response.status(422).json(error); // Return 422 error if deletion fails
    }
});

module.exports = app;
