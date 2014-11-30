var cheerio = require('cheerio');
var http = require('http');
var md5 = require('MD5');
var Q = require('q')

var Db = require('db4js');

if(process.argv.length != 4) {
	console.log("Expect country and db file params i.e.")
	console.log("node loc-fetch.js NZ nz.db")
	process.exit(1)
}

var COUNTRY = process.argv[2]
var LOCATIONDB = process.argv[3]

var options = {
	host : "www.fallingrain.com",
	path : "/world/" + COUNTRY + "/a"
}

/*
/world/LI/a/B/a/g
/world/LI/a/B/h
/world/LI/a/M/a/s
/world/LI/a/B/a/32
/world/LI/a/B
*/
var LISTING_LINK_RE = new RegExp("^/world/[A-Z]{2,}/a/[A-Z]{1}([a-z0-9/]+)*$"); 

function processResponse(response) {
	var html = '';

	response.on('data', function (chunk) {
		html += chunk;
	});

	response.on('end', function () {
		processPage(html)
	});
}

function processPage(html) {
	var $page = cheerio.load(html);

	processDataTable($page).then(function() {
		processListing($page)	
	})
	
}

function processListing($page) {
	var arefs = $page('a')
	for (var i = arefs.length - 1; i >= 0; i--) {
		var ref = $page(arefs[i]).attr("href");

		if(ref.match(LISTING_LINK_RE)) {
			var options = {
				host : "www.fallingrain.com",
				path : ref
			}
			http.request(options, processResponse).end();
		}
	};
}

function processDataTable($page) {
	var trs = $page('table[border=2] tr')

	var savePromise = Q.defer()
	var promises = []
	$page(trs).each(function(i, tr){
		var tds = $page(tr).find("td")
		if(tds.length == 0) return

		var place = {
			name : $page(tds[0]).text(),
			what : $page(tds[1]).text(),
			region: $page(tds[2]).text(),
			country : $page(tds[3]).text(),
			lat : $page(tds[4]).text(),
			long : $page(tds[5]).text(),
			elevFt : $page(tds[6]).text(),
			estPop : $page(tds[7]).text(),
			id : md5($page(tds[0]).text()+$page(tds[2]).text()+$page(tds[3]).text())
		}

		promises.push(locationDb.save("id", place, function(error) {
			console.log(error);
		}))
	})

	return Q.allSettled(promises)
}

var locationDb = Db.create();
locationDb.loadFromFile(LOCATIONDB, {
	keyField : "id",
	indexes : {
		id : Db.indexBuilders.fromKey
	}
}, "id");

http.request(options, processResponse).end();