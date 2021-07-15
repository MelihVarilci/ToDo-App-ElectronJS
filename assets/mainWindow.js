const electron = require("electron")
const { ipcRenderer } = electron

checkTodoCount()

const todoValue = document.querySelector("#todoValue")

ipcRenderer.on("initApp", (error, todos) => {
    todos.forEach(todo => {
        drawRow(todo)
    });
})

// Enter'a tıkladığımızda TODO ekleme...
todoValue.addEventListener("keypress", (event) => {
    if (event.keyCode === 13) {
        ipcRenderer.send("newTodo:save", { ref: "main", todoValue: event.target.value })
        event.target.value = ""
    }
})

// Butondan ekleme işlemi...
document.querySelector("#addBtn").addEventListener("click", () => {
    ipcRenderer.send("newTodo:save", { ref: "main", todoValue: todoValue.value })
    todoValue.value = ""
})

// Uygulamayı kapatma...
document.querySelector('#closeBtn').addEventListener("click", () => {
    if (confirm("Uygulamayı sonlandırmak istiyor musunuz ?")) {
        ipcRenderer.send("todo:close")
    }
})

ipcRenderer.on("todo:addItem", (error, todo) => {
    drawRow(todo)
})

ipcRenderer.on("todo:updateItem", (error, todo) => {
    console.log(todo)
    drawRow(todo)
})

function checkTodoCount() {
    const container = document.querySelector(".todo-container")
    const alertContainer = document.querySelector(".alert-container")

    // Footer'a toplam TODO sayısını yazdırma...
    document.querySelector(".total-count-container").innerText = container.children.length;

    if (container.children.length !== 0) {
        alertContainer.style.display = "none"
    } else {
        alertContainer.style.display = "block"
    }
}

function drawRow(todo) {
    // container...
    const container = document.querySelector(".todo-container")

    // row...
    const row = document.createElement("div")
    row.className = "row"

    // col...
    const col = document.createElement("div")
    col.className = "todo-item p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center"

    // p...
    const p = document.createElement("p")
    p.className = "m-0 w-100"
    p.innerHTML = todo.text

    // Güncelle btn...
    const updateBtn = document.createElement("button")
    updateBtn.className = "btn btn-sm btn-outline-warning flex-shrink-1 mr-1"
    updateBtn.innerHTML = "Düzenle"
    updateBtn.setAttribute("data-id", todo.id)

    updateBtn.addEventListener("click", (event) => {
        ipcRenderer.send("update:todo", event.target.getAttribute("data-id"))
    })

    // Sil btn...
    const deleteBtn = document.createElement("button")
    deleteBtn.className = "btn btn-sm btn-outline-danger flex-shrink-1"
    deleteBtn.innerText = "X"
    deleteBtn.setAttribute("data-id", todo.id)

    deleteBtn.addEventListener("click", (event) => {
        if (confirm("Bu Kaydı Silmek İstediğinizden Emin Misiniz?")) {
            event.target.parentNode.parentNode.remove()
            ipcRenderer.send("remove:todo", event.target.getAttribute("data-id"))
            checkTodoCount()
        }
    })

    col.appendChild(p)
    col.appendChild(updateBtn)
    col.appendChild(deleteBtn)

    row.appendChild(col)

    container.appendChild(row)

    checkTodoCount()
}