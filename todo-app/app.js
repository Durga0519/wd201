/* eslint-disable no-undef */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const { Todo } = require("./models");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
    const allTodos = await Todo.getTodos(); // Assuming your getTodos method fetches all to-dos.
    const today = new Date();

    // Categorizing the todos
    const overdueTodos = allTodos.filter(todo => new Date(todo.dueDate) < today && !todo.completed);
    const dueTodayTodos = allTodos.filter(todo => new Date(todo.dueDate).toDateString() === today.toDateString());
    const dueLaterTodos = allTodos.filter(todo => new Date(todo.dueDate) > today);

    if (request.accepts("html")) {
        response.render('index', {
            overdueTodos,
            dueTodayTodos,
            dueLaterTodos
        });
    } else {
        response.json({
            overdueTodos,
            dueTodayTodos,
            dueLaterTodos
        });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/todos', function (request, response) {
    response.send('Todo list');
});

// Get all todos
app.get("/todos", async function (_request, response) {
    console.log("Processing list of all Todos ...");
    try {
        const todos = await Todo.findAll(); 
        return response.json(todos); 
    } catch (error) {
        console.log(error);
        return response.status(422).json(error); 
    }
});

// Create a new todo
app.post("/todos", async (request, response) => {
    console.log("Creating a todo", request.body);
    try {
        const todo = await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            complete: false
        });
        return response.json(todo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Mark todo as completed
app.put("/todos/:id/markAsCompleted", async (request, response) => {
    console.log("We have to update a todo with ID:", request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    try {
        const updatedTodo = await todo.markAsCompleted();
        return response.json(updatedTodo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Get a specific todo by ID
app.get("/todos/:id", async function (request, response) {
    try {
        const todo = await Todo.findByPk(request.params.id);
        if (todo) {
            return response.json(todo);
        } else {
            return response.status(404).json({ message: "Todo not found" }); 
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Delete a todo by ID
app.delete("/todos/:id", async (request, response) => {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    try {
        const deleted = await Todo.destroy({ where: { id: request.params.id } }); // Deleting todo from the database
        if (deleted) {
            return response.send(true); // Respond with true if deletion was successful
        } else {
            return response.send(false); // Respond with false if todo was not found
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

module.exports = app;
