var express = require("express");
var app = express();
var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "freelancer",
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.listen(8080, function () {
    console.log("Serwer dziala na porcie 8080");
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(express.json());

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/categories", function (req, res) {
    con.query("SELECT * FROM categories", function (err, result, fields) {
        if (err) throw err;
        res.send(result);
    });
});
app.get("/skills/:id", function (req, res) {
    const id = req.params.id;
    con.query("SELECT * FROM skills WHERE category_id = " + id, function (
        err,
        result,
        fields
    ) {
        if (err) throw err;
        res.send(result);
    });
});
app.post("/post", function (req, res) {
    con.query(
        "INSERT INTO projects(category_id, description, price) VALUES (" +
            req.body.category +
            ", '" +
            req.body.desc +
            "', " +
            req.body.price +
            ")",
        function (err, result) {
            if (err) throw err;
            console.log(result.insertId); // wstawione id
        }
    );
});
