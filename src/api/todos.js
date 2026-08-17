import API from './axios';

export const todosApi = {
  getAllTodos: () => API.get('users/todos/'),
  createTodo: (todoData) => API.post('users/todos/', todoData),
  updateTodo: (todoId, todoData) => API.patch(`users/todos/${todoId}/`, todoData),
  deleteTodo: (todoId) => API.delete(`users/todos/${todoId}/`),
};
