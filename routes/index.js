var express = require('express');
var router = express.Router();
var basex = require('basex');
var fs = require('fs');
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
      //console.log(content);
      content = content.split("\n");
      console.log(searchString);
      res.render('search', { title: 'Search Results', query: content });  
    }
  });
});

/*function which add '' and ft to logical functions*/
function replaceWords(searchWords){
  var newArr = [];
  for(var i = 0; i < searchWords.length; i++){
    if((searchWords[i] === "and") && (i != searchWords.length - 1)) {
      if(searchWords[i + 1] === "not"){
        newArr[i] = "' ftand ";
      } else {
        newArr[i] = "' ftand '";
      }      
    }else if((searchWords[i] === "or") && (i != searchWords.length - 1)){
	  if(searchWords[i + 1] === "not"){
		newArr[i] = "' ftor ";
	  } else {
	    newArr[i] = "' ftor '";
	  }
    }else if(searchWords[i] === "not"){
      newArr[i] = " ftnot '";
    }else{
        newArr[i] = searchWords[i];
		if(i != searchWords.length - 1){
		  newArr[i] = newArr[i] + " ";
		}
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
      //console.log(content);
      content = content.split("\n");
      console.log(searchMarkup);
      res.render('searchXQuery', { title: 'Search Results', query: content });  
    }
  });  
});

/*routes to displayfile*/
router.get('/displayFile',function(req,res){  
  client.execute("XQUERY declare namespace tei='http://www.tei-c.org/ns/1.0';" + "(doc('Colenso/"+req.query.file+"'))[1]",
  function (error,result){
    if(error) {
      console.error(error);
    } else{
      //console.log(req.query.file);
      var content = result.result;
      res.render('displayFile', { title: 'Colenso Project', file: content, path: req.query.file});  
    }
  });    
});

/*routes to save XML*/
router.get('/saveXML',function(req,res){  
  console.log(req.query.file);
  client.execute("XQUERY declare namespace tei='http://www.tei-c.org/ns/1.0';" + "(doc('Colenso/"+req.query.file+"'))[1]",
  function (error,result){
    if(error) {
      console.error(error);
    } else{
      var content = result.result;
      var file = filePath(req.query.file);
      fs.writeFile(file.filepath + file.filename, content, {flags: 'w'}, 
      function(error,result){
        if(error){
          console.error(error);
        }else{
          console.log('Saved XML');
          res.render('displayFile', { title: 'Colenso Project', file: content, path: req.query.file, saved: 'File Saved'});
        }
      });
    }
  });    
});

/*splits req.query.file into parts*/
function filePath(file){
	var splitfile = file.split("/");
	var path = __dirname + '/../saveFiles/';
	for(var i = 0; i < splitfile.length - 1; i++){
		path += splitfile[i] + "/";
		if(!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
	}
	return {filepath: path, filename: splitfile[splitfile.length-1]};
}

/*routes to Browse*/
router.get("/Browse",function(req,res){
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; for $n in .//TEI" + " return db:path($n)",
	  function (error, result) {
		if(error){ 
		  console.error(error);
		} else {
          var content = result.result;
          //console.log(content);
          content = content.split("\n");
		  res.render('Browse', { title: 'Colenso Project', query: content });
		}
	  }
	);
});

/*routes to Add Files*/
router.get("/addFiles",function(req,res){
  client.execute("XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; for $n in .//TEI" + " return db:path($n)",
	  function (error, result) {
		if(error){ 
		  console.error(error);
		} else {
          var content = result.result;
          //console.log(content);
          content = content.split("\n");
		  res.render('Browse', { title: 'Colenso Project', query: content });
		}
	  }
	);
});
module.exports = router;
