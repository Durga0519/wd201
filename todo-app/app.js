const express = require('express');
const app = express();
var csrf = require("tiny-csrf");
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
const path = require("path");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser("shh! some secret string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const { Todo } = require("./models");

// Route for the main page
app.get("/", async (request, response) => {
    try {
        const overdue = await Todo.overdue();
        const dueToday = await Todo.dueToday();
        const dueLater = await Todo.dueLater();
        const completed = await Todo.completedItems(); // New section for completed todos
        if (request.accepts("html")) {
            response.render("index", {
                title: "Todo Application",
                overdue,
                dueToday,
                dueLater,
                completed, // Pass completed todos to the view
                csrfToken: request.csrfToken(),
            });
        } else {
            response.json({
                overdue,
                dueToday,
                dueLater,
                completed, // Include completed todos in the JSON response
            });
        }
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Create a new todo
app.post("/todos", async (request, response) => {
    console.log("Creating a new Todo:", request.body);
    try {
        const { title, dueDate } = request.body;
        
        // Server-side validation
        if (!title || !dueDate) {
            return response.status(400).json({ error: "Title and due date are required." });
        }

        await Todo.addTodo({
            title,
            dueDate,
            completed: false,
        });
        return response.redirect('/');
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Update a todo's completion status
app.put("/todos/:id", async (request, response) => {
    console.log("Updating Todo with ID:", request.params.id);
    try {
        const todo = await Todo.findByPk(request.params.id);
        if (!todo) {
            return response.status(404).json({ message: "Todo not found" });
        }

        const updatedTodo = await todo.setCompletionStatus(request.body.completed); // Update using setCompletionStatus
        return response.json(updatedTodo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Delete a todo by ID
app.delete("/todos/:id", async (request, response) => {
    console.log("Deleting Todo with ID:", request.params.id);
    try {
        await Todo.remove(request.params.id);
        return response.json({ success: true });
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

module.exports = app;
