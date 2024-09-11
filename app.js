const express = require("express");
const app = express();

const usermodel = require("./models/user");

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Path = require("path");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", (req, res) => {
  const { username, email, password, age } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createduser = await usermodel.create({
        username,
        email,
        password: hash,
        age,
      });

      let token = jwt.sign({ email }, "secretkey");

      res.cookie("token", token);
      res.send(createduser);
    });
  });
});

app.get("/login", async (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  let user = await usermodel.findOne({ email: req.body.email });
  if (!user) return res.send("Somthing is wrong");

  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if(result) {
        let token = jwt.sign({ email: user.email }, "secretkey");

      res.cookie("token", token);
      res.send("yes you can login");
    }
    else res.send("Somthing is wrong");
  });
});

app.get("/logout", async (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.listen(3000);
