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
    res.header("Access-Control-Allow-Methods", "*");
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
        result
    ) {
        if (err) throw err;
        res.send(result);
    });
});
app.get("/projectsbyskills/:skills", function (req, res) {
    new Promise((resolve, reject) => {
        // pobierz projekt jesli przynajmniej jeden skill_id jest taki sam jak w req.params
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
                                res.end();
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
        "SELECT user_id, role_id FROM users WHERE login = '" +
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
app.get("/checkifcanpostoffer/:userId/:projectId", function (req, res) {
    con.query(
        "SELECT offer_id FROM offers WHERE user_id = " +
            req.params.userId +
            " AND project_id = " +
            req.params.projectId,
        function (err, result) {
            if (err) throw err;
            if (result.length >= 1) {
                res.send(false);
            } else {
                res.send(true);
            }
        }
    );
});
app.get("/getprojectsbydate/:period", function (req, res) {
    new Promise((resolve, reject) => {
        con.query(
            "SELECT * FROM projects WHERE DATEDIFF(created_at, NOW()) <= 7",
            function (err, result) {
                if (err) throw err;
                resolve(result);
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
app.get("/getmyprojects/:userId", function (req, res) {
    new Promise((resolve, reject) => {
        con.query(
            "SELECT * FROM projects WHERE author_id = " + req.params.userId,
            function (err, result) {
                if (err) throw err;
                resolve(result);
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
app.get("/getprojectstodo/:userId", function (req, res) {
    new Promise((resolve, reject) => {
        con.query(
            "SELECT p.*, u.login, u.email FROM projects p, offers o, users u WHERE p.accepted_offer_id = o.offer_id AND o.user_id = " +
                req.params.userId +
                " AND u.user_id = " +
                req.params.userId,
            function (err, result) {
                if (err) throw err;
                resolve(result);
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
app.post("/createproject", function (req, res) {
    con.query(
        "INSERT INTO projects(category_id, description, price, status_id, author_id) VALUES (" +
            req.body.category +
            ", '" +
            req.body.desc +
            "', " +
            req.body.price +
            ", 1," +
            req.body.user_id +
            ")",
        function (err, result) {
            if (err) throw err;
            var projectId = result.insertId; // wstawione id
            req.body.skills.forEach((skill) => {
                con.query(
                    "INSERT INTO project_skills(project_id, skill_id) VALUES (" +
                        projectId +
                        ", " +
                        skill +
                        ")",
                    function (err) {
                        if (err) throw err;
                        res.end();
                    }
                );
            });
        }
    );
});

app.post("/postoffer", function (req, res) {
    con.query(
        "INSERT INTO offers(category_id, message, estimated_time, price, project_id, user_id) VALUES (" +
            req.body.category +
            ", '" +
            req.body.message +
            "', " +
            req.body.estimated_time +
            ", " +
            req.body.price +
            ", " +
            req.body.project_id +
            ", " +
            req.body.user_id +
            ")",
        function (err, result) {
            if (err) throw err;
            var offerId = result.insertId; // wstawione id
            req.body.skills.forEach((skill) => {
                con.query(
                    "INSERT INTO offer_skills(offer_id, skill_id) VALUES (" +
                        offerId +
                        ", " +
                        skill +
                        ")",
                    function (err) {
                        if (err) throw err;
                        res.end();
                    }
                );
            });
        }
    );
});
app.patch("/chooseoffer", function (req, res) {
    con.query(
        "UPDATE projects SET accepted_offer_id = " +
            req.body.offer_id +
            ", status_id = 2 WHERE project_id = " +
            req.body.project_id,
        function (err, result) {
            if (err) throw err;
            res.end();
        }
    );
});
app.patch("/setstatustodone", function (req, res) {
    con.query(
        "UPDATE projects SET status_id = 3 WHERE project_id = " +
            req.body.project_id,
        function (err, result) {
            if (err) throw err;
            res.end();
        }
    );
});
app.delete("/deleteproject/:projectId", function (req, res) {
    con.query(
        "DELETE FROM projects WHERE project_id = " + req.params.projectId,
        function (err, result) {
            if (err) throw err;
            res.end();
        }
    );
});
