// -------------------- Selectors --------------------

var newTaskTextFields = document.querySelectorAll(".text-field");
var addNewTaskButton = document.querySelector("#btn-add");
var taskListDiv = document.querySelector("#task-list");
var sortButton = document.querySelectorAll(".btn-sort");
var alertOfTaskAdded = document.querySelector("#alert-add-task");
var alertAddTask = document.querySelector("#alert-add-task");
var draggedItem;

// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------- Event Listeners --------------------

taskListDiv.addEventListener("mouseover", makeTodoItemDraggable);
document.addEventListener("DOMContentLoaded", loadTodosToScreen);
addNewTaskButton.addEventListener("click", addNewTodo);
taskListDiv.addEventListener("click", taskClickHandler);
taskListDiv.addEventListener("dragover", dragoverHandler);
sortButton.forEach((button) => {
  button.addEventListener("click", sortHandler);
});
newTaskTextFields.forEach((txtField) => {
  txtField.addEventListener("keyup", (key) => {
    if (key.key === "Enter") {
      addNewTodo();
    } else if (key.key === "z") {
      convertDateFormat();
    }
  })
})

// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------- Objects --------------------

function Task(status, study, category, patient, task, dueDate) {
  (this.status = status),
    (this.study = study),
    (this.category = category),
    (this.patient = patient),
    (this.task = task),
    (this.dueDate = dueDate);
}

// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// -------------------- Logic --------------------

function checkStorageAndReturnTodoList() {
  if (localStorage.getItem("todos") === null) {
    localStorage.setItem("todos", "[]");
    return [];
  } else {
    return JSON.parse(localStorage.getItem("todos"));
  }
}

function getObjectFromStringfiedObject(stringfiedObject) {
  return JSON.parse(stringfiedObject);
}

function updateElementValueFromObject(element, object) {
  var stringfiedObject = JSON.stringify(object);
  element.setAttribute("value", stringfiedObject);
}

function lookForIndexOfObjectInStorage(object) {
  var currentTodoList = checkStorageAndReturnTodoList();
  var index = currentTodoList.findIndex((element) => {
    return (
      element.status === object.status &&
      element.study === object.study &&
      element.patient === object.patient &&
      element.task === object.task &&
      element.category === object.category &&
      element.dueDate === object.dueDate
    );
  });
  return index;
}

function updateSpecificObjectInStorage(object, indexOfObject) {
  var currentTodoList = checkStorageAndReturnTodoList();

  currentTodoList.splice(indexOfObject, 1, object);

  localStorage.setItem("todos", JSON.stringify(currentTodoList));
}

//
//
//
//
// -------------------- Handlers --------------------

function loadTodosToScreen() {
  var todoList = checkStorageAndReturnTodoList();
  todoList.forEach((todoItem) => {
    createNewElementFromTodoObject(todoItem);
  });
}

function taskClickHandler(event) {
  var allTodoItems = document.querySelectorAll(".task-item");
  allTodoItems.forEach((element) => {
    element.classList.remove("working-todo");
  });
  const clickedElement = event.target;
  const clickedItem = event.path[1];

  // if (clickedElement.classList[0] === "task-item") {
  //   clickedElement.classList.add("working-todo");
  // }

  if (
    clickedElement.classList[0] === "item-checkbox" ||
    clickedElement.classList[0] === "item-delete" ||
    clickedElement.classList[0] === "item-study" ||
    clickedElement.classList[0] === "item-category" ||
    clickedElement.classList[0] === "item-patient" ||
    clickedElement.classList[0] === "item-task" ||
    clickedElement.classList[0] === "item-due-date"
  ) {
    var clickedItemObject = getObjectFromStringfiedObject(
      clickedItem.getAttribute("value")
    );
    var indexOfClickedItemOnStorage =
      lookForIndexOfObjectInStorage(clickedItemObject);
  }

  if (clickedElement.classList[0] === "item-checkbox") {
    if (clickedItemObject.status === 0) {
      clickedItemObject.status = 1;
      clickedItem.classList.add("check");
      clickedElement.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (clickedItemObject.status === 1) {
      clickedItemObject.status = 0;
      clickedItem.classList.remove("check");
      clickedElement.innerHTML = '<i class="far fa-circle"></i>';
    }
    updateSpecificObjectInStorage(
      clickedItemObject,
      indexOfClickedItemOnStorage
    );
    updateElementValueFromObject(clickedItem, clickedItemObject);
  }

  if (clickedElement.classList[0] === "item-delete") {
    deleteObjectFromStorage(indexOfClickedItemOnStorage);
    deleteElementFromPage(clickedItem);
  }

  if (clickedElement.classList[0] === "item-handle") {
    clickedItem.classList.add("working-todo")
  }

  if (
    clickedElement.classList[0] === "item-study" ||
    clickedElement.classList[0] === "item-patient" ||
    clickedElement.classList[0] === "item-task" ||
    clickedElement.classList[0] === "item-category" ||
    clickedElement.classList[0] === "item-due-date"
  ) {
    replaceTextWithTextField(
      clickedItem,
      clickedElement,
      indexOfClickedItemOnStorage
    );
  }
}

//
//
//
//
// -------------------- Drag and Drop --------------------

function makeTodoItemDraggable(event) {
  if (event.target.classList[0] === "task-item") {
    event.target.addEventListener("dragstart", dragstartHandler);
    event.target.addEventListener("dragend", dragendHandler);
  }
}

function dragstartHandler(event) {
  event.toElement.classList.add("dragged");
  draggedItem = document.querySelector(".dragged");
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragged)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function dragoverHandler(event) {
  event.preventDefault();
  const afterElement = getDragAfterElement(taskListDiv, event.clientY);
  if (afterElement == null) {
    taskListDiv.appendChild(draggedItem);
  } else {
    taskListDiv.insertBefore(draggedItem, afterElement);
  }
}

function dragendHandler(event) {
  event.toElement.classList.remove("dragged");
  var newOrder = [];
  var currentOrder = taskListDiv
    .querySelectorAll(".task-item")
    .forEach((element) => {
      newOrder.push(JSON.parse(element.getAttribute("value")));
    });

  localStorage.setItem("todos", JSON.stringify(newOrder));
}

//
//
//
//
// -------------------- Adding New Elements to Screen --------------------

function createNewElementFromTodoObject(todoObject) {
  const todoItem = document.createElement("div");
  todoItem.classList.add("task-item");
  todoItem.setAttribute("draggable", "true");
  todoItem.setAttribute("value", JSON.stringify(todoObject));

  const todoStatus = document.createElement("div");
  todoStatus.classList.add("item-checkbox");
  if (todoObject.status === 0) {
    todoStatus.setAttribute("value", "0");
    todoItem.classList.remove("check");
    todoStatus.innerHTML = '<i class="far fa-circle"></i>';
  } else if (todoObject.status === 1) {
    todoStatus.setAttribute("value", "1");
    todoItem.classList.add("check");
    todoStatus.innerHTML = '<i class="fas fa-check-circle"></i>';
  }

  const todoStudy = document.createElement("div");
  todoStudy.classList.add("item-study");
  todoStudy.innerHTML = todoObject.study;

  const todoCategory = document.createElement("div");
  todoCategory.classList.add("item-category");
  todoCategory.innerHTML = todoObject.category;

  const todoPatient = document.createElement("div");
  todoPatient.classList.add("item-patient");
  todoPatient.innerHTML = todoObject.patient;

  const todoTask = document.createElement("div");
  todoTask.classList.add("item-task");
  todoTask.innerHTML = todoObject.task;

  const todoDueDate = document.createElement("div");
  todoDueDate.classList.add("item-due-date");
  todoDueDate.innerHTML = convertDateFormat(todoObject.dueDate);

  const todoDelete = document.createElement("div");
  todoDelete.classList.add("item-delete");
  todoDelete.innerHTML = '<i class="fas fa-trash"></i>';

  const todoHandle = document.createElement("div");
  todoHandle.classList.add("item-handle");
  todoHandle.innerHTML = '<i class="fas fa-arrow-circle-right"></i>';

  todoItem.append(todoStatus);
  todoItem.append(todoStudy);
  todoItem.append(todoCategory);
  todoItem.append(todoPatient);
  todoItem.append(todoTask);
  todoItem.append(todoDueDate);
  todoItem.append(todoDelete);
  todoItem.append(todoHandle);

  taskListDiv.append(todoItem);
}

//
//
//
//
// -------------------- Adding New Todos to System --------------------

function addNewTodo() {
  var newTodo = getTodoInfoFromUser();
  createNewElementFromTodoObject(newTodo);
  addObjectToStorage(newTodo);
  alertAddTask.classList.remove("invisible");
  setTimeout(() => {
    alertAddTask.classList.add("invisible");
  }, 2000);
}

function convertDateFormat(dateReceived) {
  var dateOptions = {month: 'short', day: "numeric", year: '2-digit', timeZone: "UTC"};
  var date = new Date(dateReceived);
  console.log(dateReceived)
  console.log(date)
  return date.toLocaleDateString("en-US", dateOptions);
}

function getTodoInfoFromUser() {
  var newTodoStudy = newTaskTextFields[0].value == "" ? "---" : newTaskTextFields[0].value;
  var newTodoCategory = newTaskTextFields[1].value == "" ? "---" : newTaskTextFields[1].value;
  var newTodoPatient = newTaskTextFields[2].value == "" ? "---" : newTaskTextFields[2].value;
  var newTodoTask = newTaskTextFields[3].value == "" ? "---" : newTaskTextFields[3].value;
  var newTodoDueDate = newTaskTextFields[4].value == "" ? "01-01-2000" : newTaskTextFields[4].value;

  return new Task(
    0,
    newTodoStudy,
    newTodoCategory,
    newTodoPatient,
    newTodoTask,
    newTodoDueDate
  );
}

function addObjectToStorage(object) {
  var todoList = checkStorageAndReturnTodoList();
  todoList.push(object);
  localStorage.setItem("todos", JSON.stringify(todoList));
}

//
//
//
//
// -------------------- Deleting Todos --------------------

function deleteObjectFromStorage(objectIndex) {
  var todoList = checkStorageAndReturnTodoList();
  todoList.splice(objectIndex, 1);
  localStorage.setItem("todos", JSON.stringify(todoList));
}

function deleteElementFromPage(item) {
  taskListDiv.removeChild(item);
}

//
//
//
//
// -------------------- Sorting Todos --------------------

function sortHandler(event) {
  var sortType = event.target.getAttribute("value");
  var todoList = checkStorageAndReturnTodoList();
  var sortedTodoList;

  switch (sortType) {
    case "sort-date":
      sortedTodoList = bubbleSortAlgorithmByDate(todoList);
      break;
    case "sort-study":
      sortedTodoList = bubbleSortAlgorithmByStudy(todoList);
      break;
    case "sort-category":
      sortedTodoList = bubbleSortAlgorithmByCategory(todoList);
      break;
    default:
      sortedTodoList = bubbleSortAlgorithmByDate(todoList);
  }

  localStorage.setItem("todos", JSON.stringify(sortedTodoList));
  clearTodoList();
  updateTodoListOnScreen();
}

function bubbleSortAlgorithmByDate(array) {
  for (var j = 0; j < array.length - 1; j++) {
    for (var i = 0; i < array.length - 1; i++) {
      if (array[i].dueDate > array[i + 1].dueDate) {
        swapNeighbors(array, i);
      }
    }
  }
  return array;
}

function bubbleSortAlgorithmByStudy(array) {
  for (var j = 0; j < array.length - 1; j++) {
    for (var i = 0; i < array.length - 1; i++) {
      if (array[i].study > array[i + 1].study) {
        swapNeighbors(array, i);
      }
    }
  }

  for (var j = 0; j < array.length - 1; j++) {
    for (var i = 0; i < array.length - 1; i++) {
      if (
        array[i].study === array[i + 1].study &&
        array[i].dueDate > array[i + 1].dueDate
      ) {
        swapNeighbors(array, i);
      }
    }
  }

  return array;
}

function bubbleSortAlgorithmByCategory(array) {
  for (var j = 0; j < array.length - 1; j++) {
    for (var i = 0; i < array.length - 1; i++) {
      if (array[i].category > array[i + 1].category) {
        swapNeighbors(array, i);
      }
    }
  }

  for (var j = 0; j < array.length - 1; j++) {
    for (var i = 0; i < array.length - 1; i++) {
      if (
        array[i].category === array[i + 1].category &&
        array[i].dueDate > array[i + 1].dueDate
      ) {
        swapNeighbors(array, i);
      }
    }
  }

  return array;
}

function swapNeighbors(array, startPosition) {
  if (startPosition >= array.length) {
    startPosition = array.length - 2;
  } else if (startPosition < 0) {
    startPosition = 0;
  }
  var selection;
  selection = array[startPosition];
  array.splice(startPosition, 1);
  array.splice(startPosition + 1, 0, selection);
  return array;
}

function clearTodoList() {
  while (taskListDiv.firstChild) {
    taskListDiv.removeChild(taskListDiv.firstChild);
  }
}

function updateTodoListOnScreen() {
  var todoList = checkStorageAndReturnTodoList();
  todoList.forEach((todo) => {
    createNewElementFromTodoObject(todo);
  });
}

//
//
//
//
// -------------------- Editing Todos --------------------

function replaceTextWithTextField(clickedItem, clickedElement, index) {
  if (clickedElement.classList[0] != "item-due-date") {
    currentValue = clickedElement.innerText;
    clickedItem.removeChild(
      clickedItem.querySelector("." + clickedElement.classList[0])
    );
    var editField = document.createElement("input");
    editField.setAttribute("type", "text");
    editField.classList.add(clickedElement.classList[0] + "-edit");
    editField.classList.add("text-field");
    editField.value = currentValue;
    clickedItem.appendChild(editField);
    editField.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        switch (clickedElement.classList[0]) {
          case "item-study":
            replaceTextFieldWithTextStudy(event, clickedItem, index);
            break;
          case "item-patient":
            replaceTextFieldWithTextPatient(event, clickedItem, index);
            break;
          case "item-category":
            replaceTextFieldWithTextCategory(event, clickedItem, index);
            break;
          case "item-task":
            replaceTextFieldWithTextTask(event, clickedItem, index);
            break;
          case "item-due-date":
            replaceTextFieldWithTextDueDate(event, clickedItem, index);
            break;
        }
      }
    });
  } else if (clickedElement.classList[0] === "item-due-date") {
    currentValue = clickedElement.innerText;
    clickedItem.removeChild(
      clickedItem.querySelector("." + clickedElement.classList[0])
    );
    var editField = document.createElement("input");
    editField.setAttribute("type", "date");
    editField.classList.add(clickedElement.classList[0] + "-edit");
    editField.value = currentValue;
    clickedItem.appendChild(editField);
    editField.addEventListener("focusout", (event) => {
      replaceTextFieldWithTextDueDate(event, clickedItem, index);
    });
  }
}

function replaceTextFieldWithTextStudy(event, clickedItem, index) {
  var todoList = checkStorageAndReturnTodoList();
  todoList[index].study = event.target.value;

  localStorage.setItem("todos", JSON.stringify(todoList));

  clearTodoList();
  updateTodoListOnScreen();
}

function replaceTextFieldWithTextPatient(event, clickedItem, index) {
  var todoList = checkStorageAndReturnTodoList();
  todoList[index].patient = event.target.value;

  localStorage.setItem("todos", JSON.stringify(todoList));

  clearTodoList();
  updateTodoListOnScreen();
}

function replaceTextFieldWithTextCategory(event, clickedItem, index) {
  var todoList = checkStorageAndReturnTodoList();
  todoList[index].category = event.target.value;

  localStorage.setItem("todos", JSON.stringify(todoList));

  clearTodoList();
  updateTodoListOnScreen();
}

function replaceTextFieldWithTextTask(event, clickedItem, index) {
  var todoList = checkStorageAndReturnTodoList();
  todoList[index].task = event.target.value;

  localStorage.setItem("todos", JSON.stringify(todoList));

  clearTodoList();
  updateTodoListOnScreen();
}

function replaceTextFieldWithTextDueDate(event, clickedItem, index) {
  var todoList = checkStorageAndReturnTodoList();
  todoList[index].dueDate = event.target.value;

  localStorage.setItem("todos", JSON.stringify(todoList));

  clearTodoList();
  updateTodoListOnScreen();
}
