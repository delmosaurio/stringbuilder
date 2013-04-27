/*!
 * StringBuilder
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var XRegExp = require('xregexp').XRegExp
  , Append = require('./append')
  , Insert = require('./insert')
  , Replace = require('./replace');

/**
 * Expose current version.
 */
 
module.exports.version = '0.0.2';

/**
 * Initialize a new StringBuilder with `options`
 * 
 * defaults options:
 *  - newLine='\n'
 *
 * @param {Object} options
 */
var StringBuilder = module.exports = function StringBuilder(options) {
	var self = this;

	var ops = options || {};

	self.newline = '\n';
	self.instructions = [];
	self.buffer = '';

	return self;
}

/**
 * Add instruction into the StringBuilder 
 *
 * @param {Object} instruction
 */
StringBuilder.prototype.add = function(instruction) {
	var self = this;
	
	self.instructions.push( instruction );
	
	return self; 
};

/**
 * 
 */
StringBuilder.prototype.append = function() {
	var self = this;
	
	if (arguments.length === 0 ) return self;

	self.add( new Append( arguments ) );

	return self; 
};

/**
 * 
 */
StringBuilder.prototype.appendLine = function() {
	var self = this;
	
	return self.append(arguments).append(self.newline);
};

/**
 * 
 */
StringBuilder.prototype.insert = function(value, position) {
	var self = this;
	
	return self.add( new Insert(value, position) );
};

/**
 * 
 */
StringBuilder.prototype.replace = function(searchvalue, newvalue) {
	var self = this;
	
	return self.add( new Replace(searchvalue, newvalue) );
};

/**
 * Overrides toString
 */
StringBuilder.prototype.toString = function() {
	var self = this;

	self.instructions.forEach(function(item){
		self.buffer += item.toString();
	});

	return this.buffer;
};