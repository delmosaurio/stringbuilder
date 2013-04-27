/*!
 * StringBuilder.Insert
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

 /**
 * Initialize a new Insert instruction
 * 
 *
 * @param {Object} options
 */
var Insert = module.exports = function Insert(value, position) {
	var self = this;

	self.value = value || '';
	self.position = position || 0;
	
	return self;
}

Insert.prototype.constructor = Insert;