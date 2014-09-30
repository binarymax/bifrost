/** @jsx React.DOM */

var TodoItem = React.createClass({
	mixins: [TodoApp.todoStore.reactMixin()],	
	handleDone: function(){
		var item = this.props.item;
		item.isdone = !item.isdone;
		this.setPersistentState(item);
	},
	render: function() {
		return (
			<li className="todo-list-item">
				<div className="todo-list-field">{this.props.key}</div>
				<div className="todo-list-text">{this.props.item.todotext}</div>
				<div className="todo-list-field">{this.props.item.isdone?'Yes':'No'}</div>
				<div className="todo-list-field">{this.props.item.tododate}</div>
				<div className="todo-list-field"><button onClick={this.handleDone}>(un)do</button></div>
			</li>
		)
	}
});


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

React.initializeTouchEvents(true);
React.renderComponent(TodoEntry(),document.getElementById("entry"));
React.renderComponent(TodoList(),document.getElementById("list"));
