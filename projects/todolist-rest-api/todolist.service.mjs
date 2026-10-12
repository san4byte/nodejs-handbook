export class TodolistService {
  todolist = ['nodejs', 'golang', 'php'];

  getJsonTodolist() {
    return JSON.stringify({
      code: 200,
      status: 'OK',
      data: this.todolist.map((value, index) => {
        return {
          id: index,
          todo: value,
        };
      }),
    });
  }

  getAllTodolist(req, res) {
    res.write(this.getJsonTodolist());
    res.end();
  }

  createTodolist(req, res) {
    req.addListener('data', (data) => {
      const body = JSON.parse(data.toString());
      this.todolist.push(body.todo);

      res.write(this.getJsonTodolist());
      res.end();
    });
  }

  updateTodolist(req, res) {
    req.addListener('data', (data) => {
      const body = JSON.parse(data.toString());
      if (this.todolist[body.id]) {
        this.todolist[body.id] = body.todo;
      }

      res.write(this.getJsonTodolist());
      res.end();
    });
  }

  deleteTodolist(req, res) {
    req.addListener('data', (data) => {
      const body = JSON.parse(data.toString());
      this.todolist.splice(body.id, 1);

      res.write(this.getJsonTodolist());
      res.end();
    });
  }
}
