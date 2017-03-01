/*

Fixer la width de la text-area des commentaires
Cas spécial pour login fail

Gérer la visiblité suivant les users des articles
Modification des articles
Modification de ses commentaires

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

// Gestion des cookies et des sessions

//Cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBStore = require('connect-mongodb-session')(session);
app.use(cookieParser());

const store = new MongoDBStore(
  {
    uri: "mongodb://localhost:27017/blog",
    collection: "sessions"
  });

  store.on("error", function(error) {
    assert.ifError(error);
    assert.ok(false);
  });

  app.use(require("express-session")({
    secret: "This is a secret",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
  }));

  /*******************************************************************************
  ************************************* Routes ***********************************
  *******************************************************************************/

  /*---------------------------------- Routes ----------------------------------*/

  app.get("/", function (req, res) {
    console.log("Session : " + chalk.blue(JSON.stringify(req.session)));
    var articles = maDb.collection("articles");
    var page = req.query.page || 1;
    articles.find({}).toArray(function(err, data){
      res.render("index.pug",{donnees:data.reverse().slice((page-1)*5, (page*5)), session:req.session},function(erreur, donnees){
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

    var articles = maDb.collection("articles");
    var commentaires = maDb.collection("commentaires");
    commentaires.find({article: req.params.premier}).toArray(function(err, commentaires){
      articles.find({}).toArray(function(err, lesArticles){
        articles.findOne({_id: id}, function(err, unArticle){
          res.render("article.pug",{articleSeul:unArticle, tousLesArticles:lesArticles.reverse().slice(0, 5), lesCommentaires: commentaires, session:req.session},function(erreur, data){
            if (erreur) {
              res.status(404).send("404 - Impossible de charger la page");
            } else {
              res.send(data);
            }
          });
        });
      });
    });
  });

  app.get("/ecrire",function(req,res){
    if(req.session.niveau >= 1){
      res.render("ecrire.pug",{session:req.session},function(erreur, data){
        if(erreur){
          res.status(404).send("404 - Impossible de charger la page");
        } else {
          res.send(data);
        }
      });
    } else {
      res.status(403).send("403 - Vous ne disposez pas les droits suffisants.");
    }
  });

  app.get("/login",function(req,res){
    if(req.session._id){
      res.render("user.pug",{session:req.session},function(erreur, data){
        if(erreur){
          res.status(404).send("404 - Impossible de charger la page");
        } else {
          res.send(data);
        }
      });
    } else {
      res.render("login.pug",{session:req.session},function(erreur, data){
        if(erreur){
          res.status(404).send("404 - Impossible de charger la page");
        } else {
          res.send(data);
        }
      });
    }
  });

  app.get("/register",function(req,res){
    res.render("register.pug",{session:req.session},function(erreur, data){
      if(erreur){
        res.status(404).send("404 - Impossible de charger la page");
      } else {
        res.send(data);
      }
    });
  });

  app.get("/liste", function (req, res) {
    if(req.session.niveau >= 1){
      var articles = maDb.collection("articles");
      articles.find({}).toArray(function(err, data){
        res.render("liste.pug",{donnees:data.reverse(), session:req.session},function(erreur, donnees){
          if (erreur) {
            res.status(404).send("404 - Impossible de charger la page");
          } else {
            res.send(donnees);
          }
        });
      });
    } else {
      res.status(403).send("403 - Vous ne disposez pas les droits suffisants.");
    }
  });

  app.get("/utilisateurs", function (req, res) {
    if(req.session.niveau >= 1){
      var utilisateurs = maDb.collection("utilisateurs");
      utilisateurs.find({}).toArray(function(err, data){
        res.render("utilisateurs.pug",{donnees:data.reverse(), session:req.session},function(erreur, donnees){
          if (erreur) {
            res.status(404).send("404 - Impossible de charger la page");
          } else {
            res.send(donnees);
          }
        });
      });
    } else {
      res.status(403).send("403 - Vous ne disposez pas les droits suffisants.");
    }
  });

  /*-------------------------------- Fonctions ---------------------------------*/

  // Soumettre un article
  app.use(bodyParser.urlencoded({ extended: false }));

  app.post("/submitArticle",function(req,res){

    laDate = new Date();
    laDate = laDate.getDate() + "/" + (laDate.getMonth()+1) + "/" + laDate.getFullYear();

    var articles = maDb.collection("articles");
    articles.insert(
      {
        titre : req.body.titre,
        contenu : req.body.contenu,
        auteur : req.session.nom,
        date : laDate
      }
      ,function(){
        res.redirect("../");
      });
    });

    // Écrire un commentaire
    app.post("/commenter/:premier",function(req,res){

      laDate = new Date();
      laDate = laDate.getDate() + "/" + (laDate.getMonth()+1) + "/" + laDate.getFullYear();

      var commentaires = maDb.collection("commentaires");
      commentaires.insert(
        {
          contenu : req.body.contenu,
          auteur : req.session.nom,
          article : req.params.premier,
          date : laDate
        }
        ,function(){
          res.redirect("../articles/" + req.params.premier);
        });
      });


      // Supprimer un article
      app.post("/supprimer/:premier",function(req,res){

        var id = new db.ObjectId(req.params.premier);

        var articles = maDb.collection("articles");
        articles.remove({_id: id}, function(err, data){
          res.redirect("../liste");
        });
      });

      // Supprimer un commentaire
      app.post("/supprimerCommentaire/:commentaire/:article",function(req,res){

        var id = new db.ObjectId(req.params.commentaire);

        var commentaires = maDb.collection("commentaires");
        commentaires.remove({_id: id}, function(err, data){
          res.redirect("/articles/" + req.params.article);
        });
      });

      // Connexion
      app.post("/seConnecter",function(req,res){

        var utilisateurs = maDb.collection("utilisateurs");
        utilisateurs.find({login:req.body.login}).toArray(function(err, data){
          if(err){
            console.log("Impossible de joindre la base de donnée");
            res.redirect("../500");
          } else {
            console.log("La base correspondante contient : " + chalk.blue(JSON.stringify(data)));
            if(data[0]){
              if (data[0].login == req.body.login && data[0].password == req.body.password) {
                req.session._id = data[0]._id;
                req.session.niveau = data[0].niveau;
                req.session.nom = data[0].nom;
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

      // Déconnexion
      app.post("/deconnecter",function(req,res){
        if (req.session._id) {
          console.log("Déconnexion pour : " + chalk.yellow(JSON.stringify(req.session._id)));
          delete req.session._id;
          delete req.session.niveau;
          delete req.session.nom;
          res.redirect("../");
        } else {
          res.status(500).send("500 - Erreur de serveur : vous n'êtes pas connecté");
        }
      });

      // Créer un compte
      app.post("/creerCompte",function(req,res){
        console.log("une tentative de création de compte a été effectuée avec : " + chalk.yellow(JSON.stringify(req.body)));

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

        // Modifier les droits
        app.post("/modificationDroits/:premier",function(req,res){
          var utilisateurs = maDb.collection("utilisateurs");
          var id = new db.ObjectId(req.params.premier);
          utilisateurs.update({ _id: id},
            {$set:{niveau: req.body.niveau}}, //
            function(){
              console.log(chalk.yellow(JSON.stringify(id)) + " est maintenant niveau : " + chalk.yellow(req.body.niveau));
              res.redirect("../utilisateurs");
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
