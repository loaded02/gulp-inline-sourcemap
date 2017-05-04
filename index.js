/**
 * Append external SourceMap to the end of js-bundle
 *
 * Created by m.hilberg on 27.04.2017.
 */
'use strict';
var through = require('through2');
var encode = require('./lib/encode');

module.exports = function (opts) {
	
	function rebase(file, encoding, callback) {
		var self = this;
		
		encode.jsfile(file, opts, function (err, src) {
			if (err) {
				console.error(err);
			}
			file.contents = new Buffer(src);
			
			self.push(file);
			callback();
		});
		
	}
	
	return through.obj(rebase);
};