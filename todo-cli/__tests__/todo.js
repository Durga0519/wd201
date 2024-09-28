/* eslint-disable no-undef */
const todoList = require('../todo');

describe('Todolist Test Suite', () => {
  const { all, add, markAsComplete, overdue, dueToday, dueLater } = todoList();

  beforeEach(() => {
    // Reset the todo list before each test to ensure a clean state
    all.length = 0;

    // Add a sample todo item for the test cases
    add({
      title: 'Test todo',
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10), // due today
    });
  });

  test('Should add new todo', () => {
    const todoItemCount = all.length;
    expect(all.length).toBe(1); // It should start with 1 due to beforeEach

    add({
      title: 'Another test todo',
      completed: false,
      dueDate: new Date().toISOString().slice(0, 10),
    });

    expect(all.length).toBe(todoItemCount + 1); // Should increase by 1
  });

  test('Should mark a todo as complete', () => {
    expect(all[0].completed).toBe(false); // Initially false
    markAsComplete(0);
    expect(all[0].completed).toBe(true); // After marking, should be true
  });

  test('Should retrieve overdue items', () => {
    // Add an overdue item
    add({
      title: 'Overdue todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .slice(0, 10), // Due yesterday
    });

    const overdueItems = overdue();
    expect(overdueItems.length).toBe(1);
    expect(overdueItems[0].title).toBe('Overdue todo');
  });

  test('Should retrieve due today items', () => {
    // The item added in beforeEach has today's due date
    const dueTodayItems = dueToday();
    expect(dueTodayItems.length).toBe(1);
    expect(dueTodayItems[0].title).toBe('Test todo');
  });

  test('Should retrieve due later items', () => {
    // Add a due later item
    add({
      title: 'Due later todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .slice(0, 10), // Due tomorrow
    });

    const dueLaterItems = dueLater();
    expect(dueLaterItems.length).toBe(1);
    expect(dueLaterItems[0].title).toBe('Due later todo');
  });
});
