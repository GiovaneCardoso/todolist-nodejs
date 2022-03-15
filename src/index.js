const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existUser = users.find(user => user.username == username)
  if(existUser) {
    request.userData = existUser;
    next()
  } else {
    response.status(400).json({ error: 'User not found' })
  }

}

app.post('/users', (request, response) => {
  const foundUser = users.find(user => user.username === request.body.username)
  if(!foundUser) {

    const { name, username } = request.body;
    if(!name || !username) return response.status(400).json({ error: 'Missing name or username' });
    const newUser = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.push(newUser);

    return response.status(201).json(newUser);

  } else {
    return response.status(400).send({error: "User already exists"})
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.userData;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.userData;
  const { title, deadline } = request.body;

  if(!title || !deadline) return response.status(400).send({message: "Missing title or deadline"});
  const newTodo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: deadline, 
    created_at: '2021-02-22T00:00:00.000Z'
  }
  todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.userData;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoIndex = todos.findIndex(todo => todo.id === id);
  if(todoIndex < 0) return response.status(404).send({error: "Todo not found"});

  const todo = todos[todoIndex];
  todo.title = title || todo.title;
  todo.deadline = deadline || todo.deadline;

  return response.status(200).json(todo);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = request.userData;
  const { id } = request.params;

  const todoIndex = todos.findIndex(todo => todo.id === id);
  if(todoIndex < 0) return response.status(404).send({error: "Todo not found"});

  const todo = todos[todoIndex];
  todo.done = true
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.userData;
  const { id } = request.params;

  const todoIndex = todos.findIndex(todo => todo.id === id);
  if(todoIndex < 0) return response.status(404).send({error: "Todo not found"});

  todos.splice(todoIndex, 1)
  return response.status(204).json(todos);
});

module.exports = app;