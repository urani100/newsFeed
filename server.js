//dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

//port
var PORT = 7000;

// initialize Express
var app = express();


// configure middleware
// use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsFeed", { useNewUrlParser: true });
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//array to hold scraping result
var results = [];

// Routes
app.get("/", function(req, res) {
  res.render("index");
});

// A GET route for scraping website
app.get("/scrape", function(req, res) {
  //grab the body of the html with axios

  axios.get("https://newrepublic.com/").then(function(response) {

    //load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // grab every elements within article tag
    $("div .homepage-wrap article").each(function(i, el) { 
      var title = $(el).find("h2").text();
      var link = $(el).find("a").attr("href");
      var excerpt = $(el).find("div .card-subhead").text();
      var author = $(el).find("h3 :nth-child(2)").text();
      var image = $(el).find("a").find("div :nth-child(1)").css();
      var article_id = link.replace(/[^0-9]/g, "");

     //push objects in array
      results.push(
        {
          title:title,
          link:link,
          excerpt:excerpt,
          author:author,
          imageLink:image["background-image"].replace("url(//", "").replace(")", ""),
          article_id: article_id
        }
      );
  });
    res.json(results);
});
  
});


// submit article route
app.post("/submit/:id", function(req, res) {
  db.Article.create(req.body)
    .then(function(dbNote) {
      console.log(dbNote);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//saving article route
app.get("/savedartcl", function(req, res) {
	db.Article.find(function(err, data) {
		if(data.length === 0) {
			res.render("noArticles", {memo: "You Have Not Saved Any Articles."});
		}
		else {
			res.render("articles", {saved: data});
		}
	});
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/savedartcl/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});





























/////////////////////////////////////


// app.get("/savedartcl", function(req, res) {
// 	Article.find({artclsaved: true},  function(err, result) {
// 		if(result.length === 0) {
// 			res.render("noArticle", {message: "You have no articles saved"});
// 		}
// 		else {
// 			res.render("articles", {saved: result});
// 		}
// 	});
// });
// app.get("/articles", function(req, res) {
//   // get  from collection database
//   db.Article.find({})
//     .then(function(dbArticle) {
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Create a new Article using the `result` object built from scraping
// db.Article.create(result)
//   .then(function(dbArticle) {
//     // View the added result in the console
//     console.log(dbArticle);
//   })
//   .catch(function(err) {
//     // If an error occurred, log it
//     console.log(err);
//   });
// console.log(result);
//});

//Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   //Grab every document in the Articles collection
//   db.Article.find({})
//     .then(function(dbArticle) {
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article.findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
