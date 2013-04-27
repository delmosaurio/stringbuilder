/*!
 * StringBuilder.Append
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

 /**
 * Module dependencies.
 */
var XRegExp = require('xregexp').XRegExp;

/**
 * XRegExp for formats
 */
var regexLib = {
	format: '{(?<arg>\\d+)(:(?<format>[^{}]+))?}'
};

/**
 * Initialize a new Append with `args`
 * 
 *
 * @param {Object} args
 */
var Append = module.exports = function Append(args) {
	var self = this;

	args = args || arguments;

	self.format = args[0];
	self.values = [];

	for (var i = 1; i < args.length; i++) {
		self.values[i-1] = args[i]
	};
	
	return self;
}

Append.prototype.constructor = Append;
