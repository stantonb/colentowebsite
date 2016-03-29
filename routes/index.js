var express = require('express');
var router = express.Router();
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
client.execute("OPEN Colenso");


/* GET home page. */
router.get("/",function(req,res){
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0';" +
  " (//name[@type='place'])[1] ",
	  function (error, result) {
		if(error){ 
		  console.error(error);
		} else {
		  res.render('index', { title: 'Colenso Project', place: result.result });
		}
	  }
	);
});

/* Search String Function. */
router.get('/search', function(req, res) {    
  var searchString = req.query.searchString
  var searchwords = searchString.split(" ");
  searchwords = replaceWords(searchwords);
  var replacedQuery = "";
  for (var i = 0; i< searchwords.length;i++){
      replacedQuery += searchwords[i];
  }
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; for $n in .//TEI[. contains text "+replacedQuery+"]" + " return db:path($n)",
  function(error, result) {     
    if(error) {
      console.error(error);
    } else{
      var content = result.result;
      console.log(content);
      content = content.split("\n");
      //console.log(searchString);
      res.render('search', { title: 'Search Results', query: content });  
    }
  });
});

function replaceWords(splitQuery){
  var newArr = [];
  for(var i = 0; i < splitQuery.length; i++){
    if(splitQuery[i] === "and"){
      if(i != splitQuery.length - 1){
        if(splitQuery[i + 1] === "not"){
          newArr[i] = "' ftand ";
        } else {
          newArr[i] = "' ftand '";
        }
      }
    }else if(splitQuery[i] === "or"){
      if(i != splitQuery.length - 1){
		if(splitQuery[i + 1] === "not"){
		  newArr[i] = "' ftor ";
		} else {
		  newArr[i] = "' ftor '";
		  }
      }
    }else if(splitQuery[i] === "not"){
      newArr[i] = " ftnot '";
    }else{
        newArr[i] = splitQuery[i];
		if(i != splitQuery.length - 1){
		  newArr[i] = newArr[i] + " ";
		}
    }	
	if(newArr[0] != " ftnot '"){
	    newArr[0] = "'" + newArr[0];
	}
	newArr[newArr.length - 1] = newArr[newArr.length - 1] + "'";
	return newArr;
}

/* Search Markup Function. */
router.get('/searchXQuery', function(req, res) {    
  var searchMarkup = req.query.searchMarkup
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; for $n in" + searchMarkup + " return db:path($n)",
  function(error, result) {     
    if(error) {
      console.error(error);
    } else{
      var content = result.result;
      console.log(content);
      content = content.split("\n");
      //console.log(searchMarkup);
      res.render('searchXQuery', { title: 'Search Results', query: content });  
    }
  });  
});

/*routes to newfile*/
router.get('/displayFile',function(req,res){  
  client.execute("XQUERY declare namespace tei='http://www.tei-c.org/ns/1.0';" + "(doc('Colenso/"+req.query.file+"'))[1]",
  function (error,result){
    if(error) {
      console.error(error);
    } else{
        var content = result.result;
      res.render('displayFile', { title: 'Colenso Project', file: content });  
    }
  });    
});

module.exports = router;
