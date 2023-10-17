const express = require("express");
const app = express();
const port = 3000;
const config = {
    host: "db",
    user: "root",
    password: "non-root",
    database: "node-mysql",
};

const mysql = require("mysql");
const conn = mysql.createConnection(config);

const sql = `inset into people(name) values('juliu')`;
conn.query(sql);
conn.end();

app.get("/", (req, res) => {
    res.send("<h1>Full Cycle</h1>");
});

app.listen(port, () => {
    console.log("Rodando na porta " + port);
});
