const mysql = require("mysql")

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "electrontodo"
})

connection.connect((error) => {
    if (error) throw error
    console.log("Connection Successful")
})

module.exports = {
    db: connection
}