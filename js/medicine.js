(function () {

  'use strict';

  var ENTER_KEY = 13;
  var newTodoDom = document.getElementById('new-todo');
  var syncDom = document.getElementById('sync-wrapper');

  // EDITING STARTS HERE (you dont need to edit anything above this line)

  var db = new PouchDB('medicine');
  var remoteCouch = 'https://d39f64bb-b370-4ca8-84d2-70ecf2bfe2bc-bluemix:9ce8a9c23ac8f6df065abc280681051f1072a1ae47bc34acc5dfc1055d83b178@d39f64bb-b370-4ca8-84d2-70ecf2bfe2bc-bluemix.cloudant.com/medicine';
  var id = window.location.search.split("id=")[1];

  db.changes({
    since: 'now',
    live: true
  }).on('change', showTodos);


  // We have to create a new todo document and enter it in the database
  function addTodo(text) {
    var todo = {
      _id: new Date().toISOString(),
      title: text,
      completed: false
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
      redrawTodosUI(doc);
      console.log(doc);
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
    var opts = { live: true };
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

  function createMedicineImage(todo) {
    var img = document.createElement('img');
    img.src = 'images/' + todo._id + '.jpg';

    var li = document.createElement('li');
    li.className = 'mui-table-view-cell';
    li.appendChild(img);

    return li;
  }

  function createMedicinePronounce(todo) {
    var div1 = document.createElement('div');
    div1.className = 'medicine-title';
    div1.appendChild(document.createTextNode('拼音'));

    var div2 = document.createElement('div');
    div2.className = 'title';
    div2.appendChild(document.createTextNode(todo.pinyin));

    var li = document.createElement('li');
    li.className = 'mui-table-view-cell';
    li.appendChild(div1);
    li.appendChild(div2);

    return li;
  }

  // Given an object representing a todo, this will create a list item
  // to display it.
  function createTodoListItem(page, todo) {
    var div1 = document.createElement('div');
    div1.className = 'medicine-title';
    var title = ['性味功效', '常用方', '来源产地', ''];
    var arr = [todo.abstract, todo.application, todo.source, todo.process];
    div1.appendChild(document.createTextNode(title[page - 1]));

    var li = document.createElement('li');
    li.className = 'mui-table-view-cell';
    li.appendChild(div1);
    arr[page - 1].forEach(function (effect) {
      var div2 = document.createElement('div');
      var br = document.createElement('br');

      var span = document.createElement('span');
      span.className = 'medicine-small-title';
      span.appendChild(document.createTextNode(effect.title));

      div2.appendChild(span);
      div2.innerHTML += effect.author + '<br />';
      div2.innerHTML += effect.content + '<br />' + '<br />';
      // console.log(div2.innerHTML);
      li.appendChild(div2);
    });

    return li;
  }

  function redrawTodosUI(todos) {
    // var ul = document.getElementById('todo-list');
    // ul.innerHTML = '';
    // todos.forEach(function (todo) {
    //   ul.appendChild(createTodoListItem(todo.doc));
    // });
    var h = document.getElementById('medicine-header');
    h.innerHTML = '';
    h.appendChild(document.createTextNode(todos.name));

    var ul1 = document.getElementById('abstract');
    ul1.innerHTML = '';
    // todos.forEach(function (todo) {
    // console.log(todos);
    // ul.appendChild(createTodoListItem(todos));
    ul1.appendChild(createMedicineImage(todos));
    ul1.appendChild(createMedicinePronounce(todos));
    ul1.appendChild(createTodoListItem(1, todos));
    // });

    var ul2 = document.getElementById('application');
    ul2.innerHTML = '';
    ul2.appendChild(createTodoListItem(2, todos));


    var ul3 = document.getElementById('source');
    ul3.innerHTML = '';
    ul3.appendChild(createTodoListItem(3, todos));


    var ul4 = document.getElementById('process');
    ul4.innerHTML = '';
    ul4.appendChild(createTodoListItem(4, todos));
  }

  // function redrawTodosUIPage(page, todos) {
  //   var ul = document.createElement('ul');
  //   ul.className = 'mui-table-view';

  //   ul.appendChild(createTodoListItem(page, todos));
  //   // console.log(ul.innerHTML);
  //   return ul.innerHTML;
  // }

  function newTodoKeyPressHandler(event) {
    if (event.keyCode === ENTER_KEY) {
      addTodo(newTodoDom.value);
      newTodoDom.value = '';
    }
  }

  // function addEventListeners() {
  //   newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
  // }

  // addEventListeners();
  showTodos();

  if (remoteCouch) {
    sync();
  }

})();
