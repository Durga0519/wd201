const express = require('express');
const app = express();
var csrf = require("csurf");
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const localStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(flash());
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser("shh! some secret string"));
app.use(csrf({ cookie: true }));

app.use(session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24hrs
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (username, password, done) => {
    User.findOne({ where: { email: username } })
        .then(async function (user) {
            if (!user) {
                return done(null, false, { message: "Invalid email" }); // Handling no user case
            }
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Invalid password" });
            }
        })
        .catch((error) => {
            return done(error); // Fixed error variable
        });
}));

passport.serializeUser((user, done) => {
    console.log("Serializing user in session", user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id)
        .then(user => {
            done(null, user);
        })
        .catch(error => {
            done(error, null); // Fixed error handling
        });
});

const { Todo, User } = require("./models");

// Middleware to expose flash messages globally
app.use(function (request, response, next) {
    response.locals.messages = request.flash();
    next();
});

// Route for the main page
app.get("/", async (request, response) => {
    response.render("index", {
        title: "Todo Application",
        csrfToken: request.csrfToken(),
    });
});

// Route to display todos
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const loggedInuser = request.user.id;
    const overdue = await Todo.overdue(loggedInuser);
    const dueToday = await Todo.dueToday(loggedInuser);
    const dueLater = await Todo.dueLater(loggedInuser);
    const completed = await Todo.completedItems(loggedInuser); // New section for completed todos
    if (request.accepts("html")) {
        response.render("todos", {
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
});

// Signup route
app.get("/signup", (request, response) => {
    response.render("signup", { title: "Signup", csrfToken: request.csrfToken() });
});

// Route for user registration
app.post("/users", async (request, response) => {
    const hashPwd = await bcrypt.hash(request.body.password, saltRounds);
    try {
        const user = await User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: hashPwd
        });
        request.login(user, (err) => {
            if (err) {
                console.log(err);
            }
            response.redirect("/todos");
        });
    } catch (error) {
        console.log(error);
        request.flash('error', 'Unable to create user. Email may already be in use or required fields are missing.');
        response.redirect("/signup");
    }
});

// Login route
app.get("/login", (request, response) => {
    response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

// Authenticate and handle login
app.post(
    "/session",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true, // Flash messages enabled
    }),
    function (request, response) {
        console.log(request.user);
        response.redirect("/todos");
    }
);

// Signout route
app.get("/signout", (request, response, next) => {
    request.logOut((err) => {
        if (err) { return next(err); } // Fixed error handling
        response.redirect("/");
    });
});

// Create a new todo
app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    console.log("Creating a new Todo:", request.body);
    try {
        // Check for empty fields
        if (!request.body.title || !request.body.dueDate) {
            request.flash('error', 'Title and Due Date are required.');
            return response.redirect('/todos');
        }

        await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            completed: false,
            userId: request.user.id
        });
        return response.redirect('/todos');
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

// Update a todo's completion status
app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
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
app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
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
