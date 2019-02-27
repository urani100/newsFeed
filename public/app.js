// Grab the articles as a json

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

