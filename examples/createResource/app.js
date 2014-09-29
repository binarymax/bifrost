var TodoApp = window.TodoApp = {};

// -------------------------------------------------------------------
// createLocal example
// Only syncs the app state to the localStorage
//
// All App components are written the same...
// the only thing that changes is how to create the todoStore
//
// Specify the host, the name of the resource, and the keyname of each item:

TodoApp.todoStore = Bifrost.createResource({host:"http://todo.example.com/", name:"todo", key:"todoid"});

// -------------------------------------------------------------------
