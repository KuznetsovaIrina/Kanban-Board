const HIDE_CLASS = 'hide'
const HOLD_CLASS = 'hold'
const HOVERED_CLASS = 'hovered'
const DELETE_BTN_CLASS = 'task-delete'
const AREA_SELECTOR = '.area'
const DELETE_BTN_HTML = `<button title="Удалить" class="${DELETE_BTN_CLASS}">x</button>`
const date = document.querySelector('.app-date')
const tasks = document.querySelectorAll('.task')
const placeholders = document.querySelectorAll(AREA_SELECTOR)
const areaStart = document.querySelector(`${AREA_SELECTOR}-start`)
const addTaskForm = document.querySelector('.add-task')
const store = JSON.parse(localStorage.getItem('tasks')) || []
let dragItem = null

/*
    Local Storage
*/

if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(store));
}

if (store.length) {
    store.forEach(task => {
        const placeholder = document.querySelector(`${AREA_SELECTOR}-${task.status}`)
        renderTask(createTask(task), placeholder)
    });
}

/*
    Set Date
*/

function formatDate(value, format = 'date') {
    const options = {}

    if (format.includes('date')) {
        options.day = '2-digit'
        options.month = 'long'
        options.year = 'numeric'
    }

    if (format.includes('time')) {
        options.hour = '2-digit'
        options.minute = '2-digit'
        options.second = '2-digit'
    }

    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(value))
}

setInterval(() => {
    date.innerHTML = formatDate(new Date(), 'datetime')
}, 1000)

/*
    Add and Delete Tasks
*/

addTaskForm.addEventListener('submit', submitForm)

function submitForm(evt) {
    evt.preventDefault()
    const input = addTaskForm.querySelector('.add-task-input')
    const text = input.value.trim()

    if (!text) return

    const task = {
        id: Date.now(),
        text,
        status: 'start'
    }

    input.value = ''

    renderTask(createTask(task))

    store.push(task)
    localStorage.setItem('tasks', JSON.stringify(store))
}

function createTask(task) {
    const $task = document.createElement('div')
    $task.classList.add('task')
    $task.setAttribute('draggable', true)
    $task.setAttribute('data-id', task.id)
    $task.setAttribute('data-status', task.status)
    $task.setAttribute('draggable', true)
    $task.innerHTML = `<span class="task-text">${task.text}</span> ${DELETE_BTN_HTML}`

    return $task
}

function renderTask(task, container = areaStart) {
    container.append(task)
    task.addEventListener('dragstart', dragstart)
    task.addEventListener('dragend', dragend)
    task.querySelector(`.${DELETE_BTN_CLASS}`).addEventListener('click', deleteTask)
}

function getElementByIndex(id) {
    return store.findIndex(item => +item.id === +id)
}

function deleteTask(evt) {
    const parent = evt.target.closest('.task')
    store.splice(getElementByIndex(parent.dataset.id), 1)
    localStorage.setItem('tasks', JSON.stringify(store))

    parent.remove()
}

/*
    DragDrop Element
*/

for (const task of tasks) {
    task.addEventListener('dragstart', dragstart)
    task.addEventListener('dragend', dragend)
}

for (const placeholder of placeholders) {
    placeholder.addEventListener('dragover', dragover)
    placeholder.addEventListener('dragenter', dragenter)
    placeholder.addEventListener('dragleave', dragleave)
    placeholder.addEventListener('drop', dragdrop)
}

function dragover(evt) {
    evt.preventDefault()
}

function dragenter(evt) {
    if (evt.target.nodeName === '#text') return
    evt.target.classList.add(HOVERED_CLASS)
}

function dragleave(evt) {
    if (evt.target.nodeName === '#text') return
    evt.target.classList.remove(HOVERED_CLASS)
}

function dragdrop(evt) {
    evt.target.classList.remove(HOVERED_CLASS)
    evt.target.closest(AREA_SELECTOR).append(dragItem)
    const newStatus = evt.target.dataset.status
    dragItem.setAttribute('data-status', newStatus)

    const index = getElementByIndex(dragItem.dataset.id)
    store[index].status = newStatus
    localStorage.setItem('tasks', JSON.stringify(store))
}

function dragstart(evt) {
    evt.target.classList.add(HOLD_CLASS)
    setTimeout(() => evt.target.classList.add(HIDE_CLASS))
    dragItem = evt.target
}

function dragend(evt) {
    evt.target.classList.remove(HOLD_CLASS, HIDE_CLASS)
    dragItem = null
}