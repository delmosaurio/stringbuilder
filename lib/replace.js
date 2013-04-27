/*!
 * StringBuilder.Replace
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

/**
 * Initialize a new Replace instruction
 * 
 * @param {Object} searchvalue
 * @param {Object} newvalue
 */
var Replace = module.exports = function Replace(searchvalue, newvalue) {
	var self = this;

	self.searchvalue = searchvalue || '';
	self.args = newvalue || '';
	
	return self;
}

Replace.prototype.constructor = Replace;