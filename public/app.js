
$(function(){

    function articleTemplate(newsData){
      var len = newsData.length;
      var preLink = "https://newrepublic.com";

      for(var i =0; i<3; i++){
        //div to contend html 
        var articleInfo = $("<div>");
        
        //formulating id for each element
        var titleId = "titleId" + newsData[i].article_id;
        var excerptId = "excerptId" +  newsData[i].article_id;
        var authorId = "authorId" +  newsData[i].article_id;
        var imgId =  "imgId" +  newsData[i].article_id;
        var linkId =  "linkId" +  newsData[i].article_id;

       
        articleInfo = "<div id ='oneArtcl' data-id= " + newsData[i].article_id + ">" +
        " <br> <div id ='infoArtcl'><h3 id =" + titleId + ">" + newsData[i].title + 
        "</h3><p id =" + excerptId + ">" + newsData[i].excerpt + 
        "<h5 id =" + authorId + "> By " + newsData[i].author + 
        "<br> <a + id =" + linkId + " href=" + preLink + newsData[i].link + " target='_blank'> Read Full Article</a> </h5></div>" +  
        "<div id='imgArtcl'> <img id=" + imgId + " src= http://" + newsData[i].imageLink + " width=200px> </div>" +
        "<br> " +
        "<button id = saveArtcl data-value=" + newsData[i].article_id +"> Save Article</button>" 

        console.log(articleInfo);
        //apending articleInfo to html component within index
        $("#articles").append(articleInfo); 
      }
      
      //<img id='id1' src='one.jpg'>
  }

  // get articles from scraping
    $("#getArticleBtn").on("click", function(){
      console.log("hola")
      $("#articles").empty(); 
      $.get("/scrape", function(newsData) {
        articleTemplate(newsData);
        // window.location.href = "/scrape";
      });
    });
    

  
  //save an article
  $(document).on("click","#saveArtcl", function(){
    // event.preventDefault();
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-value");
    

   // establish elements to grab as per button id
    var linkId  = "#linkId" + thisId;
    var titleId = "#titleId" + thisId;
    var excerptId = "#excerptId" + thisId;
    var authorId = "#authorId" + thisId;
    // var imgId = "#imgId" + thisId;

    console.log(authorId);

    $.ajax({
      method: "POST",
      url: "/submit/" +  thisId,
      dataType: 'json',
      data: {
        link: $(linkId).attr('href'), 
        title: $(titleId).text(),
        excerpt: $(excerptId).text(),
        author: $(authorId).text(),
        // imageLink: $(imgId).html(),
        artclsaved : true 
      }
    })
      .then(function(data) {
        // Log the response
        console.log(data);
      });
  });

  // get saved articles
  $("#saved").on("click", function(){
    $("#articles").empty();
    $.get("/savedartcl", function(newsData) {
      window.location.href = "/savedartcl";
    // console.log(newsData)
    // articleTemplate(newsData);
    });
  });

});    


//Notes
// Whenever someone clicks  add notes
$(document).on("click", "#addNote", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  
  //Save the id from the data-id
  var thisId = $(this).attr("data-id");
  
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h5 id= notetitle>Add Note: " + data.title + "</h5>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' value = 'Title'><br><br>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea> <br><br>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});



// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    dataType: 'json',
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      body: $("#bodyinput").val(),
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#notes").empty();
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
