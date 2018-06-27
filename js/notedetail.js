(function () {

    'use strict';

    var ENTER_KEY = 13;
    var newTodoDom = document.getElementById('new-todo');
    var syncDom = document.getElementById('sync-wrapper');

    // EDITING STARTS HERE (you dont need to edit anything above this line)

    var db = new PouchDB('note');
    var remoteCouch = 'https://d39f64bb-b370-4ca8-84d2-70ecf2bfe2bc-bluemix:9ce8a9c23ac8f6df065abc280681051f1072a1ae47bc34acc5dfc1055d83b178@d39f64bb-b370-4ca8-84d2-70ecf2bfe2bc-bluemix.cloudant.com/note';
    var id = window.location.search.split("id=")[1];

    db.changes({
        since: 'now',
        live: true
    }).on('change', showTodos);


    // We have to create a new todo document and enter it in the database
    function addTodo(text) {
        var todo = {
            _id: new Date().toISOString(),
            content: text,
            // completed: false
        };
        db.put(todo, function callback(err, result) {
            if (!err) {
                console.log('Successfully posted a todo!');
            }
        });
    }

    // Show the current list of todos by reading them from the database
    function showTodos() {
        db.get(id).then(function (doc) {
            console.log(doc);
            redrawTodosUI(doc);
        });
    }

    function checkboxChanged(todo, event) {
        todo.completed = event.target.checked;
        db.put(todo);
    }

    // User pressed the delete button for a todo, delete it
    function deleteButtonPressed(todo) {
        db.remove(todo);
    }

    // The input box when editing a todo has blurred, we should save
    // the new title or delete the todo if the title is empty
    function todoBlurred(todo, event) {
        var trimmedText = event.target.value.trim();
        if (!trimmedText) {
            db.remove(todo);
        } else {
            todo.title = trimmedText;
            db.put(todo);
        }
    }

    // Initialise a sync with the remote server
    function sync() {
        syncDom.setAttribute('data-sync-state', 'syncing');
        var opts = {live: true};
        db.replicate.to(remoteCouch, opts, syncError);
        db.replicate.from(remoteCouch, opts, syncError);
    }

    // EDITING STARTS HERE (you dont need to edit anything below this line)

    // There was some form or error syncing
    function syncError() {
        syncDom.setAttribute('data-sync-state', 'error');
    }

    // User has double clicked a todo, display an input so they can edit the title
    function todoDblClicked(todo) {
        var div = document.getElementById('li_' + todo._id);
        var inputEditTodo = document.getElementById('input_' + todo._id);
        div.className = 'editing';
        inputEditTodo.focus();
    }

    // If they press enter while editing an entry, blur it to trigger save
    // (or delete)
    function todoKeyPressed(todo, event) {
        if (event.keyCode === ENTER_KEY) {
            var inputEditTodo = document.getElementById('input_' + todo._id);
            inputEditTodo.blur();
        }
    }

    // Given an object representing a todo, this will create a list item
    // to display it.
    function createTodoListItem(todo) {
        var img = document.createElement('img');
        img.className = 'mui-media-object mui-pull-left head-img';
        img.src = "images/default.jpg";
        img.addEventListener('change', checkboxChanged.bind(this, todo));

        var span3 = document.createElement('span');
        span3.className = 'font';
        span3.appendChild(document.createTextNode("164"));
        // span3.addEventListener('click', deleteButtonPressed.bind(this, todo));

        var span1 = document.createElement('span');
        span1.className = "mui-media-object mui-pull-right mui-icon-extra mui-icon-extra-like";
        span1.appendChild(span3);

        var span2 = document.createElement('span');
        span2.className = 'mui-pull-right mui-icon mui-icon-trash';
        span2.addEventListener('click', deleteButtonPressed.bind(this, todo));

        var p = document.createElement('p');
        p.className = 'mui-ellipsis';
        p.appendChild(document.createTextNode(todo._id));

        var divDisplay = document.createElement('div');
        divDisplay.className = 'mui-media-body';
        divDisplay.appendChild(document.createTextNode("郭老师"));
        divDisplay.appendChild(p);

        var ahref = document.createElement('a');
        ahref.appendChild(img);
        ahref.appendChild(span1);
        ahref.appendChild(span2);
        ahref.appendChild(divDisplay);
        // ahref.addEventListener('keypress', todoKeyPressed.bind(this, todo));
        // ahref.addEventListener('blur', todoBlurred.bind(this, todo));

        var li = document.createElement('li');
        li.className = 'mui-table-view-cell';
        li.appendChild(ahref);
        li.appendChild(document.createTextNode(todo.content));

        return li;
    }

    function redrawTodosUI(todos) {
        var div = document.getElementById('todo-list');
        div.innerHTML = '';
        div.appendChild(document.createTextNode(todos.content));
        // if (todos.length > 0) ul.innerHTML = '';
        // todos.forEach(function (todo) {
        //     ul.appendChild(createTodoListItem(todo.doc));
        // });
    }

    function newTodoKeyPressHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            addTodo(newTodoDom.value);
            newTodoDom.value = '';
        }
    }

    function addEventListeners() {
        var modifyNote = document.getElementById('modify');
        modifyNote.addEventListener('click', function (event) {
            addTodo(newTodoDom.value);
            newTodoDom.value = '';
        });
    }

    // addEventListeners();
    showTodos();

    if (remoteCouch) {
        sync();
    }

})();
