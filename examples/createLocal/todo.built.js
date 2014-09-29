/** @jsx React.DOM */

var TodoApp = {};

TodoApp.todoStore = Bifrost.createLocal({name:"todo",key:"todoid"});

var TodoItem = React.createClass({displayName: 'TodoItem',
	render: function() {
		return (
			React.DOM.li({className: "todo-list-item"}, 
				React.DOM.div({className: "todo-list-field"}, this.props.key), 
				React.DOM.div({className: "todo-list-field"}, this.props.text), 
				React.DOM.div({className: "todo-list-field"}, this.props.isdone), 
				React.DOM.div({className: "todo-list-field"}, this.props.date)
			)
		)
	}
});


var TodoList = React.createClass({displayName: 'TodoList',
	mixins: [TodoApp.todoStore.reactMixin()],
	render: function() {
		var self = this;
		var todoitems = self.state.items.map(function(item){
			return (
				TodoItem({key: item.todoid, date: item.tododate, text: item.todotext, isdone: item.isdone})
			)
		})
		return (
			React.DOM.ul({className: "todo-list"}, 
				TodoItem({key: "Key", date: "Date", text: "Text", isdone: "Done?"}), 
				todoitems
			)
		)
	}
});


var TodoEntry = React.createClass({displayName: 'TodoEntry',
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
			React.DOM.div({className: "todo-form"}, 
				React.DOM.textarea({id: "todotext", value: state.todotext, onChange: this.handleChange}), 
				React.DOM.button({id: "todosave", onClick: this.handleSave}, "Add")
			)
		);
	}
});

React.initializeTouchEvents(true);
React.renderComponent(TodoEntry(),document.getElementById("entry"));
React.renderComponent(TodoList(),document.getElementById("list"));
