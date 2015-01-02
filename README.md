# Bifrost

State and data transport manager for mobile and web applications

## Intro

Bifrost is a small library that focuses local and remote state management to a single abstraction.  Bifrost is useful in mobile applications that make use of a local storage, and need to sync to a remote server or device.  Applications subscribe to local state events, and when requests are made to or pushed from the remote server or device, the local state is synchronised, updating the application.  Bifrost is also helpful when multiple components of the application are dependent on the same state.

## Todo List Conceptual Example

When a new item is added to a todo list, the local state is updated.  If the device is online, the state will sync to the server.  If the device is offline, the sync will queue until the connection is enabled.  When the remote sync completes, the local state will update with any remote keys set by the server.  If the application is closed, and reopened - the state is loaded the local storage while the sync takes place in the background.

## React

A reactMixin method is provided to allow easy integration with React components.  By invoking the mixin, the component will bind to the local state.

## Quick Start

To use Bifrost, include the script on your page:

```html
<script type="text/javascript" src="javascripts/bifrost.js"></script>
```

In your Application, create a Bifrost store (where TodoApp is your global app namespace):

```js
TodoApp.todoStore = Bifrost.createResource({
	host:"http://todo.example.com/", 
	name:"todo", 
	key:"todoid"
});
```

In your List React component, add the Mixin:

```js
var TodoList = React.createClass({
	mixins: [TodoApp.todoStore.reactMixin()],
	render: function() {
		// The todoStore reactMixin adds the store to 'this.state.items'
		var todoitems = this.state.items.map(function(item){
			return (
				<TodoItem key={item.todoid} item={item} />
			)
		});
		return (
			<ul className="todo-list">
				<li className="todo-list-head">
					<div className="todo-list-field">Key</div>
					<div className="todo-list-text">Todo Item</div>
					<div className="todo-list-field">Is Done?</div>
					<div className="todo-list-field">Date Entered</div>
					<div className="todo-list-field">Actions</div>
				</li>
				{todoitems}
			</ul>
		)
	}
});
```

Create your data-entry Component, and you're done!

```js
var TodoEntry = React.createClass({
	getInitialState:function(){
		return {
			"todoid": null,
			"todotext": "",
			"tododate": null,
			"isdone": false,
		};
	},
	componentDidMount:function(){
		var self = this;
		TodoApp.todoStore.bind(function(){
			self.setState(self.getInitialState());
		});
	},
	handleChange:function(e){
		this.state.todotext = e.target.value;
		this.setState(this.state);
	},
	handleSave:function(e){
		this.state.tododate = (new Date()).toLocaleString();
		TodoApp.todoStore.add(this.state);
	},
	render: function(){
		var self = this;
		var state = self.state;
		return (
			<div className="todo-form">
				<textarea id="todotext" value={state.todotext} onChange={this.handleChange} />
				<button id="todosave" onClick={this.handleSave}>Add</button>
			</div>
		);
	}
});
```

Now, when you add a new Todo list item, it will sync to the local state, and to your remote resource at http://todo.example.com/todos

If you close and reopen your app - it will instantly load the local storage data, while it fetches any updated data from the remote server in the background.

See the full example in the /examples directory of the repo.

## API

The Bifrost API is meant to be simple to use to create a store that automatically syncs to a remote server.  Bifrost also comes with an extended API providing methods for events and ajax that work across all browsers.  The API methods are as follows, with documentation on their parameters:

### createLocal

Creates a localStorage only store.

	@name :: The name of the store
	@key  :: The unique keyname field for each item kept in the store

### createResource

Creates a local store synced with a remote RESTful resource.

	@host     :: The hostname of the REST api
	@resource :: The RESTful resource endpoint 
	@key      :: The unique keyname field for each item kept in the store

### online

Tells Bifrost that the app is connected to the network (on by default)

	This method accepts no parameters

### offline

Tells Bifrost that the app is not connected to the network (on by default).  When Bifrost is offline, it will queue any remote requests to be called when a connection is made.

	This method accepts no parameters

### on

Subscribes a function to a custom event

	@name     :: The name of the event type
	@callback :: the function to be called when the event fires

### off

Unsubscribes a function from a custom event

	@name     :: The name of the event type
	@callback :: the function to be removed from the subscription (must be the same as on)

If @callback is blank, all functions are unsubscribed from the event


### trigger

Fires a custom event

	@name :: The name of the event to fire
	@data :: The data to send to the event callback

### get

Performs an ajax GET request to a remote resource

	@url      :: The URL to request
	@data     :: The querystring object for the request
	@callback :: The function to call with the response

*Note: the data parameter must be given, for no data, use null*

### head

Performs an ajax HEAD request to a remote resource

	@url      :: The URL to request
	@data     :: The querystring object for the request
	@callback :: The function to call with the response

*Note: the data parameter must be given, for no data, use null*

### post

Performs an ajax POST request to a remote resource

	@url      :: The URL to request
	@data     :: The body object for the request
	@callback :: The function to call with the response

*Note: the data parameter must be given, for no data, use null*

### put

Performs an ajax PUT request to a remote resource

	@url      :: The URL to request
	@data     :: The body object for the request
	@callback :: The function to call with the response

*Note: the data parameter must be given, for no data, use null*

### del

Performs an ajax DELETE request to a remote resource

	@url      :: The URL to request
	@data     :: null
	@callback :: The function to call with the response

*Note: the data parameter must be given but is always ignored, use null*
