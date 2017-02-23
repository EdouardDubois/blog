const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

// ******************************** Page écrire ********************************

router.get("/ecrire",function(req,res){
  res.render("ecrire.pug",function(erreur, data){
    if(erreur){
      res.status(404).send("404 - Impossible de charger la page");
    } else {
      res.send(data);
    }
  });
});

// ******************************** Page submit ********************************

router.use(bodyParser.urlencoded({ extended: false }));
router.post("/submitArticle",function(req,res){
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


module.exports = router;
