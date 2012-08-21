idocs
=====

Interactive API Docs - idocs

Features
* Editing and execution of REST API calls 

Display of
  * method
  * URI minus the scheme, host, and port
  * Query string parameters 
  * Request body (formatted?)
  * Someday headers

Run button
 * indication query is in progress
 * display of errors on failure
 * Response display
 * response status code, headers, body
 * Max height, width then scroll.

Implementation details
 * Requests made to a proxy on the dmc server.  Say something like /v1/documents goes to /try/prefix/v1/documents

Links
* Multi-lang docs: http://developers.soundcloud.com/docs/api/guide#uploading
* Mashery iodocs - http://dev.mashery.com/iodocs
* apigee console - https://apigee.com/console

API thoughts
* jquery library with a single jquery opject, css include
* jquery object must take in url path prefix for proxy.
* individual objects will take in method, URI, list of query params, list of headers, request body
