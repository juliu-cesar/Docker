const express = require("express");
const app = express();
const port = 3000;
const config = {
    host: "db-mysql",
    user: "root",
    password: "non-root",
    database: "node-mysql",
};

const mysql = require("mysql2");
const conn = mysql.createConnection(config);

const sql = `insert into people(name) values('Jão')`;
conn.query(sql);
conn.end();

app.get("/", (req, res) => {
    res.send("<h1>Full Cycle</h1>");
});

app.listen(port, () => {
    console.log("Rodando na porta " + port);
});
