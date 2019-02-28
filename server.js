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
var PORT = process.env.PORT || 8080;

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
// mongoose.connect("mongodb://localhost/newsFeed", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsFeed";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//array to hold scraping results
var results = [];

// Routes

//default route
app.get("/", function(req, res) {
  res.render("index");
});

// get route for scraping website
app.get("/scrape", function(req, res) {
  //grab the body of the html with axios
  axios.get("https://newrepublic.com/").then(function(response) {
    //load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // grab every elements within article tag
    $("div .homepage-wrap article").each(function(i, el) {
      var title = $(el)
        .find("h2")
        .text();
      var link = $(el)
        .find("a")
        .attr("href");
      var excerpt = $(el)
        .find("div .card-subhead")
        .text();
      var author = $(el)
        .find("h3 :nth-child(2)")
        .text();
      var image = $(el)
        .find("a")
        .find("div :nth-child(1)")
        .css();
      var article_id = link.replace(/[^0-9]/g, "");

      //push objects in array
      results.push({
        title: title,
        link: link,
        excerpt: excerpt,
        author: author,
        imageLink: image["background-image"]
          .replace("url(//", "")
          .replace(")", ""),
        article_id: article_id
      });
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
    if (data.length === 0) {
      res.render("noArticles", { memo: "You Have Not Saved Any Articles..." });
    } else {
      res.render("articles", { saved: data });
    }
  });
});

// Route for grabbing a specific Article by id
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


//delete route
app.delete("/delartcl/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.deleteOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .remove("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});






/////////
//Notes

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
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

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`.
      //Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
