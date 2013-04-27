/*!
 * StringBuilder
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

/**
 * Expose current version.
 */
 
module.exports.version = '0.0.1';

/**
 * Initialize a new StringBuilder with optional `data`
 * 
 * @param {String} str
 */
var StringBuilder = module.exports = function StringBuilder(data) {
	var self = this;

	self.buffer = data !== null ? data.toString() || '';

	return self;
}

/**
 * Overrides toString
 */
StringBuilder.prototype.toString = function() {
  return this.buffer;
};