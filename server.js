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
app.get("/offers/:project_id", function (req, res) {
    new Promise((resolve, reject) => {
        con.query(
            "SELECT offer_id, category_id, message, estimated_time, price, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at, project_id, user_id  FROM offers WHERE project_id = " +
                req.params.project_id,
            function (err, offers) {
                if (err) throw err;
                resolve(offers);
            }
        );
    }).then((offers) => {
        offers.forEach((row) => {
            new Promise((resolve2, reject) => {
                setTimeout(() => resolve2(), 1);
            })
                .then(function () {
                    con.query(
                        "SELECT s.name FROM offer_skills os, skills s WHERE os.skill_id = s.skill_id AND os.offer_id = " +
                            row.offer_id,
                        function (err, skills) {
                            if (err) throw err;
                            row.skills = skills;
                        }
                    );
                })
                .then(function (skills) {
                    con.query(
                        "SELECT login, email FROM users WHERE user_id = " +
                            row.user_id,
                        function (err, user) {
                            if (err) throw err;
                            row.user = user;
                            if (offers.indexOf(row) == offers.length - 1) {
                                res.send(offers);
                            }
                        }
                    );
                });
        });
    });
});

app.post("/register", function (req, res) {
    con.query(
        "INSERT INTO users(login, password, email, role_id) VALUES ('" +
            req.body.login +
            "', '" +
            req.body.password +
            "', '" +
            req.body.mail +
            "', " +
            req.body.role +
            ")",
        function (err) {
            if (err) throw err;
            res.end();
        }
    );
});
app.get("/login/:login/:password", function (req, res) {
    con.query(
        "SELECT user_id FROM users WHERE login = '" +
            req.params.login +
            "' AND password = '" +
            req.params.password +
            "' GROUP BY login",
        function (err, result) {
            if (err) throw err;
            res.send(result);
        }
    );
});
app.post("/createproject", function (req, res) {
    var projectId = null;
    con.query(
        "INSERT INTO projects(category_id, description, price, author_id) VALUES (" +
            req.body.category +
            ", '" +
            req.body.desc +
            "', " +
            req.body.price +
            ", " +
            req.body.user_id +
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

app.post("/postoffer", function (req, res) {
    var offerId = null;
    con.query(
        "INSERT INTO offers(category_id, message, estimated_time, price, project_id, user_id) VALUES (" +
            req.body.category +
            ", '" +
            req.body.desc +
            "', " +
            req.body.time +
            ", " +
            req.body.price +
            ", " +
            req.body.project_id +
            ", " +
            req.body.user_id +
            ")",
        function (err, result) {
            if (err) throw err;
            offerId = result.offerId; // wstawione id
            req.body.skills.forEach((skill) => {
                con.query(
                    "INSERT INTO offer_skills(offer_id, skill_id) VALUES (" +
                        offerId +
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
