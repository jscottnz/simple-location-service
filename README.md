simple-location-service
=======================

A Simple Rest Location Service

Setup
=====

1. Install node.js (http://nodejs.org)
2. <code>npm install</code>

Generate Location DB
====================

Run <code>loc-fetch.js</code> passing a country code and db file
<pre>
node loc-fetch.js NZ nz.db
</pre>
Notes:
db file must exist (just empty file)

Run Service
===========
Using the generated db file, start up the location service
<pre>
node server.js nz.db
</pre>

Search for Timaru:
<pre>http://localhost:3000/location/search/timaru</pre>

Lookup by id:
<pre>http://localhost:3000/location/048e716fd0ff6a5ce21dda6837943180</pre>

