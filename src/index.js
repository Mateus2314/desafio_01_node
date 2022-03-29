const express = require("express");
const cors = require("cors");
const users = [];
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username );
  if( !user ){
    return response.status(400).json({error: "Username not found!"})
  }
  request.user = user;
  request.username = username;
  return next();
}
const checkTodoExists = (request, response, next) => {
  const {
    user,
    params: { id },
  } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exists" });
  }

  request.todo = todo;

  return next();
};

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const UserExists = users.find((user) => user.username === username);
  if (UserExists) {
    return response.status(400).json({ error: "User already Exists!" });
  }
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  return response.status(201).json(user.todos);

});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  
  const { title , deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(), 
	  title,
	  done: false, 
	  deadline: new Date(deadline), 
	  created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);

});

app.patch("/todos/:id/done", checksExistsUserAccount, checkTodoExists , (request, response) => {
  const { todo } = request;
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, checkTodoExists ,  (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo.id, 1);
  return response.status(204).json(user.todos);

});

module.exports = app;
 