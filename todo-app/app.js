/* eslint-disable no-undef */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); 
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const { Todo } = require("./models");

// Route for the main page
app.get("/", async (request, response) => {
    try {
        const allTodos = await Todo.getTodos();
        if (request.accepts("html")) {
            const overdue = await Todo.overdue();
            const dueToday = await Todo.dueToday();
            const dueLater = await Todo.dueLater();
            response.render("index", {
                title: "Todo Application",
                overdue,
                dueToday,
                dueLater,
                allTodos
            });
        } else {
            response.json(allTodos);
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Get all todos
app.get("/todos", async (request, response) => {
    console.log("Fetching all Todos ...");
    try {
        const todos = await Todo.findAll({ order: [["id", "ASC"]] });
        return response.json(todos);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Create a new todo
app.post("/todos", async (request, response) => {
    console.log("Creating a new Todo:", request.body);
    try {
        await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            completed: false,
        });
        return response.redirect('/'); 
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Mark todo as completed
app.put("/todos/:id/markAsCompleted", async (request, response) => {
    console.log("Marking Todo as completed with ID:", request.params.id);
    try {
        const todo = await Todo.findByPk(request.params.id);
        if (!todo) {
            return response.status(404).json({ message: "Todo not found" });
        }
        const updatedTodo = await todo.markAsCompleted();
        return response.json(updatedTodo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Get a specific todo by ID
app.get("/todos/:id", async (request, response) => {
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
    console.log("Deleting Todo with ID:", request.params.id);
    try {
        await Todo.destroy(request.params.id);
        return response.json({success: true});
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

module.exports = app;
