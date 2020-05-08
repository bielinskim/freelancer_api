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
app.get("/projectsbyskills/:skills", function (req, res) {
    new Promise((resolve, reject) => {
        con.query(
            "SELECT p.* FROM projects p, project_skills ps WHERE ps.skill_id IN (" +
                req.params.skills +
                ") GROUP BY p.project_id",
            function (err, projects) {
                if (err) throw err;
                resolve(projects);
            }
        );
    }).then((projects) => {
        projects.forEach((row) => {
            new Promise((resolve2, reject) => {
                con.query(
                    "SELECT s.name FROM project_skills ps, skills s WHERE ps.skill_id = s.skill_id AND ps.project_id = " +
                        row.project_id,
                    function (err, skills) {
                        if (err) throw err;
                        resolve2(skills);
                    }
                );
            }).then((skills) => {
                row.skills = skills;
                if (projects.indexOf(row) == projects.length - 1) {
                    res.send(projects);
                }
            });
        });
    });
});
app.post("/post", function (req, res) {
    console.log("test");
    var projectId = null;
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
            projectId = result.insertId; // wstawione id
            req.body.skills.forEach((skill) => {
                con.query(
                    "INSERT INTO project_skills(project_id, skill_id) VALUES (" +
                        projectId +
                        ", " +
                        skill +
                        ")",
                    function (err) {
                        if (err) throw err;
                    }
                );
            });
        }
    );
});
