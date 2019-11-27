const taskdb = new DB('task');

window.onload = () => updateTasks();

const reset = (e, t) => Get(e).html(atob(t));

function updateTasks() {
  const r = taskdb.get() || [];
  taskTemplate('donetask', r.filter(r => r.status == null));
  taskTemplate('pendingtask', r.filter(r => r.status == 'pending'));
}

function taskTemplate(idcontainer, tasks = []) {
  const el = document.querySelector(`#${idcontainer}`);
  el.innerHTML = '';
  if (tasks.length > 0) {
    tasks.forEach(task => {
      const d = new Date(task.createdAt);
      const template = `
        <ul class="list-group">
          <li class="list-group-item" id="t${task.id}">
            <span title='Remove task' class="badge" onclick="deleteTask(${task.id})">
              <span class='glyphicon glyphicon-trash'></span>
            </span>
            <span title='Edit task' class="badge" onclick="editTaskTemplate(${task.id})">
              <span class='glyphicon glyphicon-pencil'></span>
            </span>
            <span title='Change status' class="badge" onclick="changeStatus(${task.id}, '${task.status}')">
              <span class='glyphicon glyphicon-refresh'></span>
            </span>
            <span class="badge">${d.toDateString()}</span>
            ${task.name}, ${task.assign}
          </li>
        </ul>
      `;
      el.innerHTML += template;
    });
  } else {
    const template = `
      <ul class="list-group">
        <li class="list-group-item">
          No records found
        </li>
      </ul>
    `;
    el.innerHTML = template;
  }
}

function changeStatus(id, currentStatus) {
  if (confirm('Change status for this task?')) {
    switch (currentStatus) {
      case 'null':
        taskdb.update({ id: +id }, { status: 'pending' });
        break;
      case 'pending':
        taskdb.update({ id: +id }, { status: null });
        break;
    }
    updateTasks();
  }
}

function deleteTask(id) {
  if (confirm('Delete this task right now?')) {
    taskdb.remove({ id });
    updateTasks();
  }
}

function editTaskTemplate(id) {
  let task = taskdb.get({ id })[0];
  const el = Get(`#t${id}`);
  const node = el.node();
  const template = node.innerHTML;

  el.html(`
    <div class='row'>
      <div class='col-md-6'>
        <input type='text' class='form-control' value='${task.name}' id='nameid${id}'/>
      </div>
      <div class='col-md-3'>
        <select name="assigneid" id="assigneid${id}" class="form-control">
          <option ${task.assign == 'Frank' ? 'selected' : ''} value="Frank">Frank</option>
          <option ${task.assign == 'John' ? 'selected' : ''} value="John">John</option>
          <option ${task.assign == 'Alice' ? 'selected' : ''} value="Alice">Alice</option>
          <option ${task.assign == 'Mary' ? 'selected' : ''} value="Mary">Mary</option>
        </select>
      </div>
      <div class='col-md-3'>
        <button title='Cancel' class='btn btn-danger' onclick="reset('#t${id}', '${btoa(template)}')">
          <span class='glyphicon glyphicon-remove'></span>
        </button>
        <button title='Edit task' class='btn btn-success' onclick="editTask('${id}')">
          <span class='glyphicon glyphicon-check'></span>
        </button>
      </div>
    </div>
  `);
}

function editTask(id) {
  const name = Get(`#nameid${id}`).val();
  const assign = Get(`#assigneid${id}`).val();
  if (isValid(name, 'string', /^([a-zA-Z\d#.@!]{1,100}[\W]?){1,}$/gm)) {
    if (isValid(assign, 'string', /^([a-zA-Z]{1,50}[\W]?){1,}$/gm)) {
      taskdb.update({ id: +id }, { name, assign, createdAt: new Date() });
      const task = taskdb.get({ id: +id })[0];
      const d = new Date(task.createdAt);
      const template = `
        <span title='Remove task' class="badge" onclick="deleteTask(${task.id})">
          <span class='glyphicon glyphicon-trash'></span>
        </span>
        <span title='Edit task' class="badge" onclick="editTaskTemplate(${task.id})">
          <span class='glyphicon glyphicon-pencil'></span>
        </span>
        <span title='Change status' class="badge" onclick="changeStatus(${task.id}, '${task.status}')">
          <span class='glyphicon glyphicon-refresh'></span>
        </span>
        <span class="badge">${d.toDateString()}</span>
        ${task.name}, ${task.assign}
      `;
      Get(`#t${id}`).html(template);
    }
  }
}

function createTask() {
  const btn = Get('#createtask');
  btn.attr('disabled', true);
  setTimeout(() => {
    let errors = [];
    const id = Math.round(Math.random() * 1000);
    const name = Get('#nameid').val();
    const assign = Get('#assignid').val();
    const status = Get('#statusid:checked').val();
    const createdAt = new Date();

    if (isValid(name.trim(), 'string', /^([a-zA-Z\d#.@!]{1,100}[\W]?){1,}$/gm)) {
      if (isValid(assign.trim(), 'string', /^([a-zA-Z]{1,50}[\W]?){1,}$/gm)) {
        taskdb.set([{ id, name, assign, status, createdAt }], false);
        updateTasks();
        resetForm();
      } else {
        errors.push('Assign is not valid');
      }
    } else {
      errors.push('Name is not valid');
    }
    updateErrors(errors);
    btn.attr('disabled', false);
  }, 500);
}

function updateStatusLabelState() {
  if (Get('#statusid:checked').val() === 'pending') {
    Get('#statusro').val('is pending!');
  } else {
    Get('#statusro').val('is done!');
  }
}

function updateErrors(errors) {
  const list = [];
  const el = Get('#errors');
  errors.forEach(el => list.push(`<li>${el}</li>`));
  if (list.length > 0) {
    const template = `
      <div class="alert alert-danger">
        <ul>
          ${list.join('')}
        </ul>
      </div>
    `;
    el.html(template);
  } else {
    el.html('');
  }
}

const resetForm = () => {
  Get('#nameid').val('');
  Get('#assignid').val('Frank');
  Get('#statusid').attr('checked', false);
  updateStatusLabelState();
}

function searchByName(status) {
  const name = Get(`#search${status == null ? 'done' : 'pending'}`).val();
  const data = taskdb.get({ status }, false);
  const rdata = [];
  data.forEach(el => {
    if (el.name.toLowerCase().includes(name.toLowerCase())) {
      rdata.push(el);
    }
  });
  taskTemplate(status != null ? 'pendingtask' : 'donetask', rdata);
}

function onChangeOrder(status) {
  const s = status != null ? 'pending' : 'done';
  const c = Get(`#order${s}id:checked`).val();
  const data = taskdb.sort({ 'createdAt': Date }, c != null ? -1 : 1, { status });
  taskTemplate(`${s}task`, data);
}

function isValid(varbl, type = null, pattern = null) {
  if (varbl != undefined && varbl != null && varbl.length > 0) {
    let flag = true;
    if (type != null) flag = typeof varbl === type;
    if (pattern != null) flag = (new RegExp(pattern)).test(varbl);

    return flag;
  }
  return false;
}