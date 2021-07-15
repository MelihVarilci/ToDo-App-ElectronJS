const electron = require("electron")
const url = require("url")
const path = require("path")
const { Menu } = require("electron")

const db = require("./lib/connection").db

const { app, BrowserWindow, ipcMain } = electron

let mainWindow, addWindow

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.setResizable(false)

    // Pencerenin oluşturulması...
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/mainWindow.html"),
            protocol: "file:",
            slashes: true
        })
    );

    // Menünün oluşturulması...
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)

    ipcMain.on("todo:close", () => {
        app.quit()
        addWindow = null
    })

    // New TODO penceresi Eventleri...
    ipcMain.on("newTodo:close", () => {
        addWindow.close()
        addWindow = null
    })

    ipcMain.on("newTodo:save", (err, data) => {
        if (data) {
            db.query("Insert Into todos Set text =?", data.todoValue, (error, results, fields) => {
                if (results.insertId > 0) {
                    mainWindow.webContents.send("todo:addItem", {
                        id: results.insertId,
                        text: data.todoValue
                    })
                }
            })

            if (data.ref == "new") {
                addWindow.close()
                addWindow = null
            }
        }
    })

    // Update TODO penceresi Eventleri...
    ipcMain.on("updateTodo:close", () => {
        addWindow.close()
        addWindow = null
    })

    ipcMain.on("updateTodo:save", (err, data) => {
        console.log(data)
        // if (data) {
        //     // Bu çalışmıyor
        //     // db.query("Update todos Set id =? text =?", [5, data.todoValue], (error, results, fields) => {
        //     db.query("Update todos Set text =?", data.todoValue, (error, results, fields) => {
        //         if (results.insertId > 0) {
        //             mainWindow.webContents.send("todo:updateItem", {
        //                 id: results.insertId,
        //                 text: data.todoValue
        //             })
        //         }
        //     })

        //     if (data.ref == "update") {
        //         addWindow.close()
        //         addWindow = null
        //     }
        // }
    })
    /**/
    mainWindow.on("close", () => {
        app.quit()
    })

    mainWindow.webContents.once("dom-ready", () => {
        db.query("Select * From todos", (error, results, fields) => {
            mainWindow.webContents.send("initApp", results)
        })
    })

    ipcMain.on("remove:todo", (error, id) => {
        db.query("Delete From todos Where id =?", id, (error, results, fields) => {
            if (results.affectedRows > 0) {
                console.log("Silme islemi basarilidir...")
            }
        })
    })

    ipcMain.on("update:todo", (error, id) => {
        createUpdateWindow()
    })
});

// Menü template yapısı...
const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni TODO Ekle",
                click() {
                    createAddWindow()
                }
            },
            {
                label: "Tümünü Sil"
            },
            {
                label: "Çıkış",
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                role: "quit"
            }
        ]
    },
]

// İOS menü template yapısı...
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: app.getName(),
        role: "TODO"
    })
}

// Windows menü template yapısı...
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push(
        {
            label: "Geliştirici Araçları",
            submenu: [
                {
                    label: "Geliştirici Araçları",
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools()
                    }
                },
                {
                    label: "Yenile",
                    role: "reload"
                }
            ]
        }
    )
}

function createAddWindow() {
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 480,
        height: 181,
        title: "Yeni Bir Penceere",
        frame: false
    })

    addWindow.setResizable(false)

    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/newTodo.html"),
            protocol: "file:",
            slashes: true
        })
    )

    addWindow.on("close", () => {
        addWindow = null
    })
}

function createUpdateWindow() {
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 480,
        height: 181,
        title: "Yeni Bir Penceere",
        frame: false
    })

    addWindow.setResizable(false)

    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/updateTodo.html"),
            protocol: "file:",
            slashes: true
        })
    )

    addWindow.on("close", () => {
        addWindow = null
    })
}