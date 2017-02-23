// dependances
const fs = require ("fs");
const chalk = require ("chalk");
const parseurl = require("parseurl");

// Express
const express = require("express");
const app = express();
app.use("/img", express.static(__dirname + "/img"));
app.use("/html", express.static(__dirname + "/html"));
app.use("/css", express.static(__dirname + "/css"));

// Pug
const pug = require ("pug");
app.set("view engine", "pug");
app.set("views","html");

// Cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(session({
  secret:'123456789SECRET',
  saveUninitialized : false,
  resave: false,
  cookie:{}
}));

app.use(function (req, res, next) {
  var views = req.session.views;

  if (!views) {
    views = req.session.views = {};
  }
  var pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) + 1;

  next();
});

//MongoClient
const MongoClient = require("mongodb").MongoClient;
const URL = "mongodb://127.0.0.1:27017/blog";
var maDb;

// Body Parser (POST)
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/resultat",function(req,res){
  console.log("le req.body est : " + chalk.red(JSON.stringify(req.body)));
  res.render("resultat.pug",{prenom:req.body.prenom, nom:req.body.nom });
});

// Envoi des pages (GET)

app.get("/", function (req, res) {
  var collection = maDb.collection("articles");
  collection.find().toArray(function(err, data){
    res.render("index",function(erreur, data){
      if (erreur) {
        res.status(404).send("404 - Impossible de charger la page");
      } else {
      res.send(data);
      console.log("Page d'accueil chargée");
    }
  });
  });
});

app.get("/articles/:premier",function(req,res){

  console.log("l'url demandée est : " + chalk.yellow(req.params.premier + ".pug"));
  console.log("Cookies: " + chalk.blue(JSON.stringify(req.cookies)));
  console.log("SignedCookies: " + chalk.blue(JSON.stringify(req.signedCookies)));
  console.log("Session : " + chalk.blue(JSON.stringify(req.session)));
  res.render(req.params.premier + ".pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});

// Lancer le serveur
MongoClient.connect(URL, function(err, db) {
  if (err) {
    return;
  }
  maDb = db;
  var server = app.listen(8080, function() {
    var adresseHote = server.address().address;
    var portEcoute = server.address().port;
    console.log(chalk.black.bgWhite("Le serveur est bien démarré sur " + adresseHote + ":" + portEcoute));
    console.log();  });
  });
