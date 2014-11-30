var express = require('express');
var router = express();
var Db = require('db4js');

if(process.argv.length != 3) {
	console.log("Expect db file param i.e.")
	console.log("node server.js nz.db")
	process.exit(1)
}

var LOCATIONDB = process.argv[2]

var error = function(response, message) {
	response.writeHead(200, {'Access-Control-Allow-Origin' : '*'});
	response.end("error : " + message);
}

var locationDb = Db.create();
locationDb.loadFromFile(LOCATIONDB, {
	keyField : "id",
	indexes : {
		id : Db.indexBuilders.fromKey,
		search : function(index, data) {
			return Db.indexBuilders.fromField(index, data, function(object) {
				return object.name
			})
			.then(function(data) { 
				return Db.indexBuilders.trigramFromIndex(index, data)
			});
		}
	}
}, "id")

function respond(response, data) {
	response.writeHead(200, {'Access-Control-Allow-Origin' : '*'});

	if(data) {
		data = JSON.stringify(data)
	}
	response.end(data);
}

router.get("/location/:id", function(request, response) {

	locationDb.get("id", request.params.id)
	.then(function(data) {
		if(data.indexItems)
			respond(response, data.indexItems[0][0])
		else
			error(response, "not found")
	}, function(message) {
		error(response, message);
	})

})

router.get("/location/search/:input", function(request, response) {

	var term = request.params.input.replace(/_+/g ,' ');
	var limit = request.params.limit | 5;

	locationDb.search("search", term, "id", limit)
	.then(function(data) {
		respond(response, data);
	}, function(message) {
		error(response, message);
	}).done();

})

router.listen(3000);
console.error("Server ready");

require('shutdown-handler').on('exit', function() {
  console.log("Shutdown...");
});

