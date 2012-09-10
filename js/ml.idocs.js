/*
Copyright 2002-2012 MarkLogic Corporation.  All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*********************/
/* Utility functions */ 
/*********************/
var ML = ML || {};

ML.console = function(method,message) {
	if (typeof console === 'undefined') {
		var nop = function () {};
		console = {};
		["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function (method) {
			console[method] = nop;
		});
	}
	console[method](message);
};

ML.assert = function (exp, method, message) {
	"use strict";
	if (!exp) {
	  ML.console(method, message);   
	}
	return exp;
};


/*************************************************/
/* iDOCS - Doc visualizer & experimentation tool */ 
/*************************************************/
ML.IDOCS = function () {
	
	var that,
	
	// private vars
	docs,  // object references by container ID  

	// private methods
	_docExists,
	// public methods
	create,
	get;
	
	/***********************/
	/*** INITIALIZE VARS ***/
	/***********************/
	docs = [];

	/***********************/
	/*** PRIVATE METHODS ***/
	/***********************/
	// DOC - function for creating a new DOC instance, attached to a particular DIV on the page
	_docExists = function (containerID) {  
		var exists = false;
		if (typeof docs[containerID] === 'object')
			exists = true;
			
		return exists;
	}

	/**********************/
	/*** PUBLIC METHODS ***/
	/**********************/
	// creates a DOC object
	/* 	sample config object
		// Array of objects, each representing a tab
		config = {"tabs":[
			{
				name: 'REST API',					// REQUIRED: name -> name displayed on the tab
				request: {
					method:'GET',
					endpoint: 'http://sbrooks:8003/v1/',
					headers: {},
					params: {}						// object with paramaters to pass to endpoint
				},
				write: false,						// write -> whether or not the container is writeable - not supported in v1
				execute: true,						// execute -> whether or not to execute against server
			},
			
			// CURL object purely for display only, not executable
			{
				name: 'CURL',						// REQUIRED: name -> name displayed on the tab
				contents: "curl -X GET 'http://myhost/store?uri=/afternoon-drink.json'",  // REQUIRED: contents -> for display in container
				write: false,						// write -> whether or not the container is writeable - not supported in v1
				execute: false						// execute -> whether or not to execute against server
			}			
		]}
	*/

	// Creates a single IDOC object in the UI, wired to a valid container ID
	create = function (containerID,config) {    
		var doc;
		
		// ensure defaults required variable are defined
		if (!ML.assert((containerID !== undefined),'error','ERROR: ML.IDOCS (create) - required variable "containerID" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config !== undefined),'error','ERROR: ML.IDOCS (create) - required variable "config" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config.tabs !== undefined),'error','ERROR: ML.IDOCS (create) - the "tabs" array in "config" is undefined')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((config.tabs.length !== 0),'error','ERROR: ML.IDOCS (create) - the "tabs" array is empty')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert(($(containerID).length !== 0),'error','ERROR: ML.IDOCS (create) - the passed "containerID" does not exist')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert(($(containerID).length === 1),'error','ERROR: ML.IDOCS (create) - the passed "containerID" is defined more than once.  Ensure the identifier is unique.')) return false; /* exits ML.IDOCS doc creation */
		if (!ML.assert((!_docExists(containerID)),'error','ERROR: ML.IDOCS (create) - the doc you are attempting to create for "' + containerID + '" already exists.')) return false; /* exits ML.IDOCS doc creation */
		
		// create new doc object
		docs[containerID] = function () { 
			var doc,
				display,
				execute;
			
			// set defaults
			doc = {};			
			doc.containerID = containerID;
			doc.container = $(containerID);
			doc.config = config;		
			doc.display = display;
			doc.execute = execute;
			
			/*** Public iDOC functions ***/
			display = function(currentTab) {
				if (!ML.assert((containerID !== undefined),'error','ERROR: ML.IDOCS (displayTab) - required variable "containerID" is undefined')) return false; 
				if (!ML.assert((currentTab !== undefined),'error','ERROR: ML.IDOCS (displayTab) - required variable "currentTab" is undefined')) return false;
				if (!ML.assert((currentTab >= 0),'error','ERROR: ML.IDOCS (displayTab) - required variable "currentTab" is not a valid array location')) return false;
				
				if (!ML.assert((doc.config.tabs[currentTab] !== undefined),'error','ERROR: ML.IDOCS (displayTab) - "currentTab" ' + currentTab + ' is not valid array location')) return false; /* exits ML.IDOCS doc creation */
				
				currentTabConfig = doc.config.tabs[currentTab];
				doc.container.find('.tabs li').removeClass('selected');
				$(doc.container.find('.tabs li')[currentTab]).addClass('selected');
				
				doc.container.find('textarea').val(doc.config.tabs[currentTab].contents);
				// TODO:  Add any CodeMirror related wiring here for highlighting
				
				if (doc.config.tabs[currentTab].execute) {
					$(doc.container.find('.execute')).addClass('show');  // displays execute button
					// create request - if fails, display error message in DIV
				}	
			};

			execute = function () {    
				alert('TODO: Add execute code here...')
			};
			/*** END Public iDOC functions ***/
			
			/*** RENDER UI ***/
			doc.container.append('<ul class="tabs"></ul><div class="input"></div><div class="output"></div>');
			doc.container.find('.input').append('<textarea class="content"></textarea><br /><div class="button execute">Execute</div>');
			doc.container.find('.output').append('<h2 class="idoc-header">Request URI</h2><div class="request-uri output-info"></div>');
			doc.container.find('.output').append('<h2 class="idoc-header">Response Code</h2><div class="response-code output-info"></div>');
			doc.container.find('.output').append('<h2 class="idoc-header">Response Headers</h2><div class="response-headers output-info"></div>');
			doc.container.find('.output').append('<h2 class="idoc-header">Response Body</h2><div class="response-body output-info"></div>');
			
			// create UI for the tabs
			$.each(doc.config.tabs, function(key, value) {			
				if (!ML.assert((value.name !== undefined),'error','ERROR: ML.IDOCS (create) - the required property "name" in "config" tabs array location: ' + key + ' is undefined')) return false; /* exits ML.IDOCS doc creation */
				doc.container.find('.tabs').append('<li id="' + doc.container.attr('id') + key + '">' + value.name + '</li>');
			});
			
			// default display of first tab
			display(0);
			/*** END RENDER UI ***/
			
			
			/******* iDOC INTERACTIONS ******/
			doc.container.delegate(".tabs li", "click", function(event){	
				var tabToDisplay = $(this).attr('id').replace(doc.container.attr('id'),'');
				display(tabToDisplay);
			});
			doc.container.delegate(".execute", "click", function(event){	
				var tabToExecute = doc.container.find('li.selected').attr('id').replace(doc.container.attr('id'),'');
				execute(tabToExecute);
			});
			
			return doc;
		}();
		
		
	};

	// returns an existing DOC object
	get = function (containerID) {    
		var requestedDoc;
		if (docs[containerID] !== undefined)
			requestedDoc = docs[containerID];
		return requestedDoc;
	};

	that = {
		create: create,
		get: get
	};
	return that;

}();


ML.REQUEST = function (method, uri, headers, dataType, params, body, callback) {
'use strict';
// method 			- (required) "GET","POST","PUT","DELETE"
// uri 				- (required) path to request endpoint  (cross-site requests not supported in v.1)
// dataType 		- (optional) expected response data type (default: 'json')
// params 			- (optional) object containing URL parameters
// headers 			- (optional) request headers - FORMAT: [{name: value1}, {name: value2}, {name2: valuefoo}]
// body 			- (optional) request body - used with PUT/POST
// callback 		- (optional) callback function executed when request completes successfully.  Response data passed back.

	// protected object for return
	var that,
	
	// private vars
	config,
	methodTypes,
	
	// public methods
	execute,  // execute server request
	set, 	  // set a configuration variable
	
	// private methods
	_getResponseHeaders,
	_serverRequest,
	_addParamsToQueryString,
	_countKeys;
	
	// initialize private variables
	that 					= null; 	// returned for debugging	
	config 					= {};		// REQUEST object configuration
	// request defaults 
	config.params			= {};		
	config.params.format	= 'json';
	config.params.view		= 'all';
	config.params.options	= 'all';
	
	numQueriesExecuting 	= 0; 
    serverConnectionDown    = false;
	methodTypes 			= ["GET","POST","PUT","DELETE"];
	
	// ensure defaults required variable are defined
	if (!ML.assert((method === undefined),'error','ERROR: ML.REQUEST - required variable "method" is undefined')) return false; /* exits ML.REQUEST creation */
	if (!ML.assert((uri === undefined),'error','ERROR: ML.REQUEST - required variable "uri" is undefined')) return false; /* exits ML.REQUEST creation */
	if (!ML.assert(($.inArray(method,methodTypes) === -1),'error','ERROR: ML.REQUEST - variable "method" is not an acceptable type ("GET","POST","PUT","DELETE")')) return false; /* exits ML.REQUEST creation */
	
	// create configuration object & extend defaults
	config.method 			= method;
	config.uri 				= uri;	
	config.params 			= $.extend(true, config.params, params);
	config.params.cache 	= new Date().getTime();  // cache-buster	
	config.headers 			= headers;
	config.body 			= body;
	config.dataType 		= (dataType) ? dataType : 'json'; 

	/************************************/
	/*** SERVER INTERACTION FUNCTIONS ***/
	/************************************/
	_getResponseHeaders = function (xhr) {
		// MODIFY FOR MY PURPOSES
		var getAllResponseHeaders = xhr.getAllResponseHeaders;

		xhr.getAllResponseHeaders = function () {
			if ( getAllResponseHeaders() ) {
				return getAllResponseHeaders();
			}
			var allHeaders = "";
			$( ["Cache-Control", "Content-Language", "Content-Type",
					"Expires", "Last-Modified", "Pragma"] ).each(function (i, header_name) {

				if ( xhr.getResponseHeader( header_name ) ) {
					allHeaders += header_name + ": " + xhr.getResponseHeader( header_name ) + "\n";
				}
				return allHeaders;
			});
		};
		return xhr;
	};

	_serverRequest = function (callback) {    
		var ajaxObj = {}, requestURI;
		
		config.params.cache 	= new Date().getTime();  // cache-buster	
		
		switch(method)
		{
		case 'GET':
			// no special processing
			break;
		case 'POST': 
			requestURI = this._addParamsToQueryString(config.uri,params);        
			break;
		case 'PUT':
			if (config.body !== undefined) {
				ajaxObj.data = config.body;
			}
			requestURI = this._addParamsToQueryString(config.uri,params);
			break;
		case 'DELETE':
			requestURI = this._addParamsToQueryString(config.uri,params);
			break;
		default: 
			break;
		}
		
		// TODO:  Add setting of request headers
		
		$.ajax({
			type: method,
			contentType: "text/plain",
			url: requestURI,
			data: config.params,
			dataType: config.dataType,
			success:function(data, textStatus, jqXHR){
				if (callback !== undefined)
					callback(data,_getResponseHeaders(jqXHR));
			},
			error:function(jqXHR, textStatus, errorThrown){ 
				var data = {};
				data.error = {};
				data.error.textStatus = textStatus;
				data.error.errorThrown = errorThrown;					
				if (callback !== undefined)
					callback(data,_getResponseHeaders(jqXHR));
			}
		});    
	};

	_addParamsToQueryString = function (url, params) {
		if (this._countKeys(params) > 0) {
			url += "?";
			for(var key in params) {
				if (params[key] !== undefined)
					url += key + "=" + encodeURIComponent(params[key]) + "&";
			}
			// remove final '&'
			url = url.substr(0,url.length - 1);
		}
		return url;
	};

	_countKeys = function (obj) {
		if (obj.__count__ !== undefined) {
			return obj.__count__;
		}

		var c = 0, p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				c += 1;
			}
		}

		return c;
	};	
	/****************************************/
	/*** END SERVER INTERACTION FUNCTIONS ***/
	/****************************************/
	
	
	/**********************/
	/*** PUBLIC METHODS ***/
	/**********************/
	// execute server request
	set = function (configName,configValue) {    
		// no need for undefined check as the user may way to set to undefined
		config[configName] = configValue;  
	};
	
	// execute server request
	execute = function (callback) {    
		this._serverRequest(function(data,headers) {
			if (callback !== undefined)
				callback(data,headers);
		});   
	};

	that = {
		set: set,
		execute:execute
	};
	return that;
};