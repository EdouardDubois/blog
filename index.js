/*******************************************************************************
************************************* Setup ************************************
*******************************************************************************/

//Dépendances
const fs = require ("fs");
const chalk = require ("chalk");
const parseurl = require("parseurl");
const db = require("mongodb");
const bodyParser = require("body-parser");

// Express
const express = require("express");
const app = express();
// const articles = require("./routes/articles");
// const admin = require("./routes/admin");
app.use("/img", express.static(__dirname + "/img"));
app.use("/html", express.static(__dirname + "/html"));
app.use("/css", express.static(__dirname + "/css"));

// Pug
const pug = require ("pug");
app.set("view engine", "pug");
app.set("views","html");

//MongoClient
const MongoClient = require("mongodb").MongoClient;
const URL = "mongodb://127.0.0.1:27017/blog";
var maDb;

/*******************************************************************************
************************************* Routes ***********************************
*******************************************************************************/

app.get("/", function (req, res) {
  var articles = maDb.collection("articles");
  articles.find({}).toArray(function(err, data){
    res.render("index.pug",{donnees:data.reverse()},function(erreur, donnees){
      if (erreur) {
        res.status(404).send("404 - Impossible de charger la page");
      } else {
        res.send(donnees);
      }
    });
  });
});


app.get("/liste", function (req, res) {
  var articles = maDb.collection("articles");
  articles.find({}).toArray(function(err, data){
    res.render("liste.pug",{donnees:data.reverse()},function(erreur, donnees){
      if (erreur) {
        res.status(404).send("404 - Impossible de charger la page");
      } else {
        res.send(donnees);
      }
    });
  });
});

app.get("/articles/:premier",function(req,res){

  var id = new db.ObjectId(req.params.premier);
  console.log("l'article demandé a l'Id : " + chalk.yellow(id));

  var articles = maDb.collection("articles");
  articles.findOne({_id: id}, function(err, data){
    console.log(data);
    res.render("article.pug",{donnees:data},function(erreur, donnees){
      if (erreur) {
        res.status(404).send("404 - Impossible de charger la page");
      } else {
        res.send(donnees);
      }
    });
  });
});


app.get("/ecrire",function(req,res){
  res.render("ecrire.pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});


app.use(bodyParser.urlencoded({ extended: false }));
app.post("/submitArticle",function(req,res){
  console.log(JSON.stringify(req.body));

  laDate = new Date();
  console.log(laDate.getYear());
  laDate = laDate.getDate() + "/" + (laDate.getMonth()+1) + "/" + laDate.getFullYear();

  var articles = maDb.collection("articles");
  articles.insert(
    {
      titre : req.body.titre,
      contenu : req.body.contenu,
      auteur : "Édouard",
      date : laDate
    }
    ,function(){
      res.redirect("../");
    });
  });

  app.get("/supprimer/:premier",function(req,res){

    var id = new db.ObjectId(req.params.premier);
    console.log("Supression de l'article à l'Id : " + chalk.yellow(id));

    var articles = maDb.collection("articles");
    articles.remove({_id: id}, function(err, data){
      res.redirect("../liste");
    });
  });

  // app.use("/",articles);
  // app.use("/admin",admin);

  /*******************************************************************************
  ************************************ Serveur ***********************************
  *******************************************************************************/

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
