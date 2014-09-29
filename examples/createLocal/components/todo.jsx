/** @jsx React.DOM */

var TodoApp = {};

TodoApp.todoStore = Bifrost.createLocal({name:"todo",key:"todoid"});

var TodoItem = React.createClass({
	render: function() {
		return (
			<li className="todo-list-item">
				<div className="todo-list-field">{this.props.key}</div>
				<div className="todo-list-field">{this.props.text}</div>
				<div className="todo-list-field">{this.props.isdone}</div>
				<div className="todo-list-field">{this.props.date}</div>
			</li>
		)
	}
});


var TodoList = React.createClass({
	mixins: [TodoApp.todoStore.reactMixin()],
	render: function() {
		var self = this;
		var todoitems = self.state.items.map(function(item){
			return (
				<TodoItem key={item.todoid} date={item.tododate} text={item.todotext} isdone={item.isdone} />
			)
		})
		return (
			<ul className="todo-list">
				<TodoItem key="Key" date="Date" text="Text" isdone="Done?" />
				{todoitems}
			</ul>
		)
	}
});


var TodoEntry = React.createClass({
	getDefaultState:function(){
		return {
			"todoid": null,
			"todotext": "",
			"tododate": null,
			"isdone": false,
		}
	},
	getInitialState:function(){
		return this.getDefaultState();
	},
	componentDidMount:function(){
		var self = this;
		TodoApp.todoStore.bind(function(){
			self.setState(self.getDefaultState());
		});
	},
	handleChange:function(e){
		var self = this;
		var state = self.state;
		state.todotext = e.target.value;
		self.setState(state);
	},
	handleSave:function(e){
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
