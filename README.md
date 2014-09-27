# Balder

State manager for mobile and web applications

## Intro

Balder is a small library that focuses local and remote state management to a single location.  Balder is useful in mobile applications that make use of a local storage, and need to sync to a remote server.  Applications subscribe to local state events, and when requests are made to the remote server, the local state is synchronised, updating the application.

## Todo List Conceptual Example

When a new item is added to a todo list, the local state is updated.  If the device is online, the state will sync to the server.  If the device is offline, the sync will queue until the connection is enabled.  When the remote sync completes, the local state will update with any remote keys set by the server.

## React

A reactMixin method is provided to allow easy integration with React components.  By invoking the mixin, the component will bind to the local state.

## Quick Start

To use Balder, include the script on your page:

```html
<script type="text/javascript" src="javascripts/balder.js"></script>
```

In your Application, create a Balder store (where MyApp is your global app namespace):

```js
MyApp.todoStore = Balder.create("https://example.com","/todos","todoid","tododate");
```

In your List React component, add the Mixin:

```jsx
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

```jsx
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
		Balder.on("localtodos",function(){
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
				<textarea id="todotext" name="todo" className="todo-text" value={state.todotext} onChange={this.handleChange} />
				<button id="todosave" className="todo-save" onClick={this.handleSave}></button>
			</div>
		);
	}
});
```