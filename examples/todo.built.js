/** @jsx React.DOM */

var TodoItem = React.createClass({displayName: 'TodoItem',
	handleDone: function(){
		var item = this.props.item;
		item.isdone = !item.isdone;
		TodoApp.todoStore.save(item);
	},
	render: function() {
		return (
			React.DOM.li({className: "todo-list-item"}, 
				React.DOM.div({className: "todo-list-field"}, this.props.key), 
				React.DOM.div({className: "todo-list-text"}, this.props.item.todotext), 
				React.DOM.div({className: "todo-list-field"}, this.props.item.isdone?'Yes':'No'), 
				React.DOM.div({className: "todo-list-field"}, this.props.item.tododate), 
				React.DOM.div({className: "todo-list-field"}, React.DOM.button({onClick: this.handleDone}, "(un)do"))
			)
		)
	}
});


var TodoList = React.createClass({displayName: 'TodoList',
	mixins: [TodoApp.todoStore.reactMixin()],
	render: function() {
		// The todoStore reactMixin adds the store to 'this.state.items'
		var todoitems = this.state.items.map(function(item){
			return (
				TodoItem({key: item.todoid, item: item})
			)
		});
		return (
			React.DOM.ul({className: "todo-list"}, 
				React.DOM.li({className: "todo-list-head"}, 
					React.DOM.div({className: "todo-list-field"}, "Key"), 
					React.DOM.div({className: "todo-list-text"}, "Todo Item"), 
					React.DOM.div({className: "todo-list-field"}, "Is Done?"), 
					React.DOM.div({className: "todo-list-field"}, "Date Entered"), 
					React.DOM.div({className: "todo-list-field"}, "Actions")
				), 
				todoitems
			)
		)
	}
});


var TodoEntry = React.createClass({displayName: 'TodoEntry',
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
