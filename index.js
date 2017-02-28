/*

Sessions
Users

Cas spécial pour login fail

********************************************************************************
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

//Cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(session({
  secret:'123456789SECRET',
  saveUninitialized : false,
  resave: false,
  cookie:{}
}));

/*******************************************************************************
************************************* Routes ***********************************
*******************************************************************************/

/*---------------------------------- Routes ----------------------------------*/

app.get("/", function (req, res) {

  console.log("Cookies: " + chalk.blue(JSON.stringify(req.cookies)));
  console.log("Session : " + chalk.blue(JSON.stringify(req.session)));

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

app.get("/ecrire",function(req,res){
  res.render("ecrire.pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});

app.get("/login",function(req,res){
  res.render("login.pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});

app.get("/register",function(req,res){
  res.render("register.pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});

/*-------------------------------- Fonctions ---------------------------------*/

// Soumettre un article
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/submitArticle",function(req,res){
  console.log("Un article a été posté avec : " + JSON.stringify(req.body));

  laDate = new Date();
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


  // Supprimer un article
  app.post("/supprimer/:premier",function(req,res){

    var id = new db.ObjectId(req.params.premier);
    console.log("Supression de l'article à l'Id : " + chalk.yellow(id));

    var articles = maDb.collection("articles");
    articles.remove({_id: id}, function(err, data){
      res.redirect("../liste");
    });
  });

  // Se connecter
  app.post("/seConnecter",function(req,res){
    console.log("une tentative de connection a été effectuée avec : " + chalk.yellow(JSON.stringify(req.body)));

    var utilisateurs = maDb.collection("utilisateurs");
    utilisateurs.find({login:req.body.login}).toArray(function(err, data){
      if(err){
        console.log("Impossible de joindre la base de donnée");
        res.redirect("../500");
      } else {
        console.log("La base correspondante contient : " + chalk.blue(JSON.stringify(data)));
        if(data[0]){
          if (data[0].login == req.body.login && data[0].password == req.body.password) {
            console.log("Identification réussie");
            res.redirect("../#success");
          } else {
            console.log("Mot de passe incorrect");
            res.redirect("../login#fail");
          }
        } else {
          console.log("Identifiant incorrect");
          res.redirect("../login#fail");
        }
      }
    });
  });

  // Créer un compte
  app.post("/creerCompte",function(req,res){
    console.log("une tentative de création a été effectuée avec : " + chalk.yellow(JSON.stringify(req.body)));

    var utilisateurs = maDb.collection("utilisateurs");
    utilisateurs.find({ $or: [ { login: req.body.login }, { nom: req.body.nom } ] }).toArray(function(err, data){
      if(err){
        console.log("Impossible de joindre la base de donnée");
        res.redirect("../500");
      } else {
        if(data[0]){
          console.log("Cet utilisateur existe déjà");
          res.redirect("../register#fail");
        } else {
          utilisateurs.insert(
            {
              login : req.body.login,
              password : req.body.password,
              nom : req.body.nom,
              niveau : 0
            }
            ,function(){
              console.log("Création effectuée");
              res.redirect("../login");
            });
          }
        }
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
