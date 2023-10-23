const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;
const config = {
    host: "db-mysql",
    user: "root",
    password: "non-root",
    database: "node-mysql",
};


async function getNames() {
    let name = "João";
    const url = "https://gerador-nomes.wolan.net/nome/aleatorio";
    const response = await fetch(url);
    const responseJson = await response.json();
    name = responseJson.reduce(
        (accumulator, currentValue) => accumulator + " " + currentValue
    );
    const conn = mysql.createConnection(config);
    const sql = `insert into people(name) values("${name}");`;
    conn.query(sql);
    conn.end();
}

const conn = mysql.createConnection(config);
const createTable = "CREATE TABLE IF NOT EXISTS people(id int not null auto_increment, name varchar(255) not null, primary key (id));"
conn.query(createTable);
conn.end();

getNames();

app.get("/", async (req, res) => {
    const pool = mysql.createPool(config).promise();
    const sql = `select * from people;`;
    let tableNames = await pool.query(sql);
    pool.end();

    listName = "";
    tableNames[0].forEach((row)=>{
        listName += `<li>${row.name}</li>`
    })
    
    res.send("<h1>Full Cycle Rocks!</h1>"+`<ul>${listName}</ul>`);
});

app.listen(port, () => {
    console.log("Rodando na porta " + port);
});
