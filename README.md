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

In your Application, create a Bifrost store (where MyApp is your global app namespace):

```js
MyApp.todoStore = Bifrost.createRemote({
    host: "https://example.com",
    name: "todoid",
    key: "tododate"
});
```

In your List React component, add the Mixin:

```js
var TodoList = React.createClass({
	mixins: [MyApp.todoStore.reactMixin()],
	render: function() {
		var self = this;
		var todoitems = self.state.items.map(function(item){
			return (
				<TodoItem key={item.todoid} tododate={item.tododate} text={item.todotext} isdone={item.isdone} />
			)
		})
		return (
			<ul className="todo-list">
				{todoitems}
			</ul>
		)
	}
});
```

Create your data-entry Component, and you're done!

```js
var TodoEntry = React.createClass({
	getDefaultProps:function(){
		return {
			"todoid": -1,
			"todotext": "",
			"tododate": null,
			"isdone": false,
		}
	},
	getInitialState:function(){
		return this.getDefaultProps();
	},
	componentDidMount:function(){
		var self = this;
		Bifrost.on("localtodos",function(){
			self.setState(self.getDefaultProps());
		});
	},
	handleChange:function(e){
		var self = this;
		var state = self.state;
		state.todotext = e.target.value;
		self.setState(state);
	},
	handleSave:function(e){
		var now = moment();
		now.utc();
		this.state.tododate = now.format();
		MyApp.todoStore.add(this.state);
	},
	render: function(){
		var self = this;
		var state = self.state;
		return (
			<div className="todo-form">
				<textarea id="todotext" value={state.todotext} onChange={this.handleChange} />
				<button id="todosave" onClick={this.handleSave}></button>
			</div>
		);
	}
});
```
