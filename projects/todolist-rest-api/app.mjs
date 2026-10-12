import http from 'node:http';
import { TodolistService } from './todolist.service.mjs';

const service = new TodolistService();
const server = http.createServer((request, response) => {
  response.setHeader('Content-Type', 'Application/json');

  switch (request.url) {
    case '/api':
      switch (request.method) {
        case 'GET':
          service.getAllTodolist(request, response);
          break;
        case 'POST':
          service.createTodolist(request, response);
          break;
        case 'PUT':
          service.updateTodolist(request, response);
          break;
        case 'DELETE':
          service.deleteTodolist(request, response);
          break;
        default:
          response.write('hello from server api todolist codesann.');
          response.end();
          break;
      }
      break;
    default:
      response.write('hello from server todolist codesann.');
      response.end();
      break;
  }
});

server.listen(3000);
