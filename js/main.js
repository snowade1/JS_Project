const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const tasksList = document.querySelector("#tasksList");
const inputButton = document.querySelector("#task-submit");
const filterSelect = document.querySelector("#filter");
const sortSelect = document.querySelector("#sort");
const task = input.value;
inputButton.disabled = true;

//Установка текущего значения фильтра
if (localStorage.getItem("filter")) {
  filterSelect.value = localStorage.getItem("filter");
}

//Установка текущего значения сортировки
if (localStorage.getItem("sort")) {
  sortSelect.value = localStorage.getItem("sort");
}

let tasks = [];

//Заполнение списка задач из LS
if (localStorage.getItem("tasks")) {
  tasks = JSON.parse(localStorage.getItem("tasks"));
}

//Отображение задач на странице в зависимости от установленного фильтра (при перезагрузке страницы)
if (filterSelect.value === "all-tasks") {
  showAllTasks();
}
if (filterSelect.value === "in-process-tasks") {
  showInProcessTasks();
}
if (filterSelect.value === "done-tasks") {
  showDoneTasks();
}

//Кнопка "Добавить" - переключение disabled
input.oninput = function () {
  if (!input.value) {
    inputButton.disabled = true;
  } else {
    inputButton.disabled = false;
  }
};

//Добавление задачи в список
form.addEventListener("submit", addTask);

//Удаление задачи из списка
tasksList.addEventListener("click", deleteTask);

//Изменение задачи в списке
tasksList.addEventListener("click", editTask);

//Завершение задачи в списке
tasksList.addEventListener("click", doneTask);

//Сохранение нового значения фильтра в LS при его выборе
filterSelect.addEventListener("change", (e) => {
  if (e.target.value === "all-tasks") {
    saveFilter();
    location.reload();
  }
  if (e.target.value === "in-process-tasks") {
    saveFilter();
    location.reload();
  }
  if (e.target.value === "done-tasks") {
    saveFilter();
    location.reload();
  }
});

//Сортировка массива задач
sortSelect.addEventListener("change", (e) => {
  if (e.target.value === "ASC-sort") {
    tasks = sortASC();
    saveToLS();
    saveSort();
    location.reload();
  }
  if (e.target.value === "DESC-sort") {
    tasks = sortDESC();
    saveToLS();
    saveSort();
    location.reload();
  }
});

//Функции
function addTask(e) {
  e.preventDefault();

  const task = input.value;

  const newTask = {
    id: Date.now(),
    text: task,
    done: false,
  };

  tasks.push(newTask);

  const taskHTML = `
    <li id="${newTask.id}" class="newTask">
    <div class="content">
    <label>ВЫПОЛНЯЕТСЯ</label>
        <input
        data-action="task"
        type="text"
        pattern="^[a-zA-Z-А-Яа-яЁё\s]+$"
        class="text"
        value="${newTask.text}"
        disabled
        >
        <button data-action="edit" class="task-edit">Изменить</button>
        <button data-action="delete" class="task-delete">Удалить</button>
        </div>
    </li>`;

  if (!task) {
    alert("Введите текст задачи!");
  } else {
    tasksList.insertAdjacentHTML("beforeend", taskHTML);
    input.value = "";
    inputButton.disabled = true;
  }

  saveToLS();
  saveSortTasks();
  location.reload();
}

function deleteTask(e) {
  if (e.target.dataset.action !== "delete") return;

  if (e.target.dataset.action === "delete") {
    const parentLi = e.target.closest("li");
    const parentLiID = Number(parentLi.id);
    const index = tasks.findIndex((task) => task.id === parentLiID);
    tasks.splice(index, 1);
    parentLi.remove();
  }

  saveToLS();
  location.reload();
}

function editTask(e) {
  if (e.target.dataset.action !== "edit") return;

  if (e.target.dataset.action === "edit") {
    const parentLi = e.target.closest("li");
    const isReadonly = parentLi.querySelector("input").disabled;
    if (isReadonly) {
      parentLi.querySelector("input").disabled = false;
    } else {
      parentLi.querySelector("input").disabled = true;
    }
    parentLi.querySelector("input").focus();
    const parentLiID = Number(parentLi.id);
    const task = tasks.find(function (task) {
      if (task.id === parentLiID) {
        return task;
      }
    });
    if (!parentLi.querySelector("input").value.includes("^[ 0-9]+$")) {
      task.text = parentLi.querySelector("input").value;
    }
  }

  saveToLS();
  saveSortTasks();
}

function doneTask(e) {
  if (e.target.dataset.action !== "task") return;

  if (e.target.dataset.action === "task") {
    const parentLi = e.target.closest("li");
    const taskStatus = parentLi.querySelector("label").textContent;
    const parentLiID = Number(parentLi.id);
    const task = tasks.find(function (task) {
      if (task.id === parentLiID) {
        return task;
      }
    });

    if (taskStatus === "ВЫПОЛНЯЕТСЯ") {
      task.done = true;
      parentLi.querySelector("label").textContent = "СДЕЛАНО";
      parentLi.querySelector("input").style = "text-decoration: line-through";
      location.reload();
    }
    if (taskStatus === "СДЕЛАНО") {
      task.done = false;
      parentLi.querySelector("label").textContent = "ВЫПОЛНЯЕТСЯ";
      parentLi.querySelector("input").style = "text-decoration: none";
      location.reload();
    }
  }

  saveToLS();
}

//Сохранение массива в LS
function saveToLS() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Сохранение значения фильтра в LS
function saveFilter() {
  localStorage.setItem("filter", filterSelect.value);
}

//Сохранение значения сортировки в LS
function saveSort() {
  localStorage.setItem("sort", sortSelect.value);
}

function showAllTasks() {
  let doneTasks = (inProgressTasks = 0);
  tasks.forEach(function (task) {
    if (task.done === false) {
      inProgressTasks++;
      const taskHTML = `
        <li id="${task.id}" class="newTask">
        <div class="content">
        <label>ВЫПОЛНЯЕТСЯ</label>
            <input
            data-action="task"
            type="text"
            pattern="^[a-zA-Z-А-Яа-яЁё\s]+$"
            class="text"
            value="${task.text}"
            disabled
            >
            <button data-action="edit" class="task-edit">Изменить</button>
            <button data-action="delete" class="task-delete">Удалить</button>
            </div>
        </li>`;
      tasksList.insertAdjacentHTML("beforeend", taskHTML);
    }
    if (task.done === true) {
      doneTasks++;
      const taskHTML = `
        <li id="${task.id}" class="newTask">
        <div class="content">
        <label>СДЕЛАНО</label>
            <input
            data-action="task"
            type="text"
            pattern="^[a-zA-Z-А-Яа-яЁё\s]+$"
            style="text-decoration: line-through"
            class="text"
            value="${task.text}"
            disabled
            >
            <button data-action="edit" class="task-edit">Изменить</button>
            <button data-action="delete" class="task-delete">Удалить</button>
            </div>
        </li>`;
      tasksList.insertAdjacentHTML("beforeend", taskHTML);
    }
  });
  tasksList.insertAdjacentHTML(
    "beforeend",
    "<br>Всего задач: " + (inProgressTasks + doneTasks)
  );
  tasksList.insertAdjacentHTML(
    "beforeend",
    "<br>Всего ВЫПОЛНЯЕМЫХ задач: " + inProgressTasks
  );
  tasksList.insertAdjacentHTML(
    "beforeend",
    "<br>Всего СДЕЛАННЫХ задач: " + doneTasks
  );
}

function showInProcessTasks() {
  let inProgressTasks = 0;
  tasks.forEach(function (task) {
    if (task.done === false) {
      inProgressTasks++;
      const taskHTML = `
        <li id="${task.id}" class="newTask">
        <div class="content">
        <label>ВЫПОЛНЯЕТСЯ</label>
            <input
            data-action="task"
            type="text"
            pattern="^[a-zA-Z-А-Яа-яЁё\s]+$"
            class="text"
            value="${task.text}"
            disabled
            >
            <button data-action="edit" class="task-edit">Изменить</button>
            <button data-action="delete" class="task-delete">Удалить</button>
            </div>
        </li>`;
      tasksList.insertAdjacentHTML("beforeend", taskHTML);
    }
  });
  tasksList.insertAdjacentHTML(
    "beforeend",
    "Всего ВЫПОЛНЯЕМЫХ задач: " + inProgressTasks
  );
}

function showDoneTasks() {
  let doneTasks = 0;
  tasks.forEach(function (task) {
    if (task.done === true) {
      doneTasks++;
      const taskHTML = `
        <li id="${task.id}" class="newTask">
        <div class="content">
        <label>СДЕЛАНО</label>
            <input
            data-action="task"
            type="text"
            pattern="^[a-zA-Z-А-Яа-яЁё\s]+$"
            style="text-decoration: line-through"
            class="text"
            value="${task.text}"
            disabled
            >
            <button data-action="edit" class="task-edit">Изменить</button>
            <button data-action="delete" class="task-delete">Удалить</button>
            </div>
        </li>`;
      tasksList.insertAdjacentHTML("beforeend", taskHTML);
    }
  });
  tasksList.insertAdjacentHTML(
    "beforeend",
    "Всего СДЕЛАННЫХ задач: " + doneTasks
  );
}

function sortASC() {
  for (let i = 1; i < tasks.length; i++) {
    for (let j = 0; j < tasks.length - i; j++) {
      if (tasks[j].text.length > tasks[j + 1].text.length) {
        var swap = tasks[j];
        tasks[j] = tasks[j + 1];
        tasks[j + 1] = swap;
      }
    }
  }
  return tasks;
}

function sortDESC() {
  for (let i = 1; i < tasks.length; i++) {
    for (let j = 0; j < tasks.length - i; j++) {
      if (tasks[j].text.length < tasks[j + 1].text.length) {
        var swap = tasks[j];
        tasks[j] = tasks[j + 1];
        tasks[j + 1] = swap;
      }
    }
  }
  return tasks;
}

function saveSortTasks() {
  if (sortSelect.value === "ASC-sort") {
    tasks = sortASC();
    saveToLS();
    saveSort();
  }
  if (sortSelect.value === "DESC-sort") {
    tasks = sortDESC();
    saveToLS();
    saveSort();
  }
}
