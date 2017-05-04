/*
 * Taken from
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 *
 * and
 * Gulp Base64
 * https://github.com/Wenqer/gulp-base64
 *
 * Copyright (c) 2014 Wenqer
 * Licensed under the MIT license.
 */

// Node libs
var fs = require("fs");
var path = require("path");
var mime = require("mime");

var extend = require("extend");
var async = require("async");

// Cache regex's
var rUrl = /([\s\S]*)(\/\/# sourceMappingURL=)([\s\S]*)/img;
var rData = /^data:/;
var rQuotes = /['"]/g;
var rParams = /([?#].*)$/g;

// Grunt export wrapper
module.exports = (function () {
	"use strict";
	
	var exports = {};
	
	/**
	 * Takes a JS file as input, goes through it line by line, and base64
	 * encodes any sourceMaps it finds.
	 *
	 * @param srcFile Relative or absolute path to a source stylesheet file.
	 * @param opts Options object
	 * @param done Function to call once encoding has finished.
	 */
	exports.jsfile = function(file, opts, done) {
		opts = opts || {};
		
		// Shift args if no options object is specified
		if(typeof opts === "function") {
			done = opts;
			opts = {};
		}
		
		var src = file.contents.toString();
		var result = "";
		var srcMap, group;
		
		async.whilst(function() {
				group = rUrl.exec(src);
				return group != null;
			},
			function(complete) {
				// group[0] = will hold the entire file
				// group[1] = will hold everything up to the url declaration
				// group[2] = //# sourceMappingURL=
				// group[3] = fileName.js.map
				
				// already inline sourceMap?
				var test = rData.test(group[3])
				if (test) {
					result = group[0];
					complete();
				}
				
				result = group[1];
				
				var rawUrl = group[3].trim();
				srcMap = rawUrl
					.replace(rQuotes, "")
					.replace(rParams, ""); // remove query string/hash parmams in the filename, like foo.png?bar or foo.png#bar
				
				// process it and put it into the cache
				var loc = srcMap;
				
				// Resolve the sourceMap path relative to the JS file
				// local file system.. fix up the path
				// loc = path.join(path.dirname(file.path), srcMap);
				
				loc = opts.baseDir ? path.join(opts.baseDir, srcMap) :
					path.join(path.dirname(file.path), srcMap);
				
				// If that didn't work, try finding the sourceMap relative to
				// the current file instead.
				if(!fs.existsSync(loc)) {
					if (opts.debug) {
						console.log('in ' + loc + ' file doesn\'t exist');
					}
					loc = path.join(file.cwd, srcMap);
				}
				
				exports.sourceMap(loc, opts, function (err, resp) {
					if (err == null) {
						var url = "//# sourceMappingURL=" + resp;
						result += url;
					} else {
						result = group[0];
					}
					
					complete();
				});
			},
			function() {
				if (result === "") result = src; // falls nichts gefunden wurde
				done(null, result);
			});
	};
	
	
	/**
	 * Takes a sourceMap (absolute path or remote) and base64 encodes it.
	 *
	 * @param srcMap Absolute, resolved path to a sourceMap
	 * @param opts Options object
	 * @return A data URI string (mime type, base64 srcMap, etc.) that a browser can interpret as a sourceMap
	 */
	exports.sourceMap = function(srcMap, opts, done) {
		
		// Shift args
		if(typeof opts === "function") {
			done = opts;
			opts = {};
		}
		
		var complete = function(err, encoded) {
			// Return the original source if an error occurred
			if(err) {
				// grunt.log.error(err);
				done(err, srcMap);
				
				// Otherwise cache the processed sourceMap and return it
			} else {
				done(null, encoded);
			}
		};
		
		// Local file

		// Does the sourceMap actually exist?
		if(!fs.existsSync(srcMap) || !fs.lstatSync(srcMap).isFile()) {
			// grunt.fail.warn("File " + srcMap + " does not exist");
			if (opts.debug) {
				console.warn("File " + srcMap + " does not exist");
			}
			complete(true, srcMap);
			return;
		}
		
		// grunt.log.writeln("Encoding file: " + srcMap);
		if (opts.debug) {
			console.info("Encoding file: " + srcMap);
		}
		
		// Read the file in and convert it.
		var src = fs.readFileSync(srcMap);
		var type = mime.lookup(srcMap);
		var encoded = exports.getDataURI(type, src);
		complete(null, encoded);
	};
	
	
	/**
	 * Base64 encodes a sourceMap and builds the data URI string
	 *
	 * @param mimeType Mime type of the sourceMap
	 * @param srcMap The source sourceMap
	 * @return Data URI string
	 */
	exports.getDataURI = function(mimeType, srcMap) {
		var ret = "data:";
		ret += mimeType; // application/json;charset=utf8
		ret += ";base64,";
		ret += srcMap.toString("base64");
		return ret;
	};
	
	return exports;
})();