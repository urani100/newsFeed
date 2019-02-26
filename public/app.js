// Grab the articles as a json

$(function(){

  function articleTemplate(newsData){
    var len = newsData.length;
    var preLink = "https://newrepublic.com";
    for(var i =0; i<2; i++){
      var articleInfo = $("<div>");
      // give it an attr value
      // articleInfo.attr('data-value', newsData[i].article_id);
      var titre = "titre" + newsData[i].article_id;

      articleInfo = "<div id ='oneArtcl' data-id= " + newsData[i].article_id + ">"+
      "<div id ='infoArtcl'><h3 id =" + titre + ">" + newsData[i].title +"</h3> <p>" + newsData[i].excerpt + "</p>" +
      "By " + newsData[i].author + " <br> <a href=" + preLink+ newsData[i].link + " target='_blank'>  Read Full Article</a> </div>" +  
      "<div id='imgArtcl'> <img src= http://" + newsData[i].image + " width=200px> </div>" +
      "</div> <br> " +
       "<button id = saveArtcl data-value=" + newsData[i].article_id +"> Save Article</button>" 
       console.log(articleInfo)
      $("#articles").append(articleInfo); 
    }
    
    
}

// get articles from scraping
  $("#getArticleBtn").on("click", function(event){
    $("#articles").empty();
    event.preventDefault();   
    
    $.get("/scrape", function(newsData) {
      articleTemplate(newsData);
    });
  });
   

 
//save an article
$(document).on("click","#saveArtcl", function(){
  // event.preventDefault();
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-value");
  var titre = "#titre" + thisId

  // var t = $(titre).text() ;
  // console.log(thisId , t);

  $.ajax({
    method: "POST",
    url: "/submit/" +  thisId,
    dataType: 'json',
    data: {
      // title input
      title: $(titre).text(),
      artclsaved : true 
    }
  })
    .then(function(data) {
      // Log the response
      console.log(data);
    });
});

//save article
$("#saved").on("click", function(){
  $("#articles").empty();
  $.get("/savedartcl", function(newsData) {
  console.log(newsData)
  articleTemplate(newsData);
  });
});
    


