const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

// ******************************* Page d'accueil ******************************

router.get("/", function (req, res) {
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

// ******************************* Page d'article ******************************

router.get("/articles/:premier",function(req,res){

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


module.exports = router;
