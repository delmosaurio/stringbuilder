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
  , Replace = require('./replace')
  , async = require('async')
  , formatter = require('./utils/formatter');

/**
 * Expose current version.
 */
 
module.exports.version = '0.0.5';

/**
 * XRegExp for formats
 */
var regexLib = {
	format: '{(?<arg>\\d+)(:(?<format>[^{}]+))?}'
};


/**
 * Initialize a new StringBuilder with `options`
 * 
 * defaults options:
 *  - newline='\n'
 *
 * @param {Object} options
 */
var StringBuilder = module.exports = function StringBuilder(options) {
	var self = this;

	var ops = options || {};

	self.newline = ops.newline || '\n';
	
	self.instructions = [];   // instruction to build
	self.index = 0;           // index of instruction
	
	return self;
}

/** 
 * Add instruction into the StringBuilder 
 *
 * @param {Object} instruction
 */
StringBuilder.prototype.add = function(instruction, type) {
	var self = this
	  , current;
	
	if (type === null && !(/^[air]{1}$/i).test(type) ) {
		type = getTypeInstruction(instruction);
	}

	// if still undefined so, nothing to do
	if (type === null || type === '') return self;

	current = self.instructions[self.index];

	if (current == undefined) { // the first time
		self.instructions[self.index]  = { type:type,  items: [instruction]}
		return self;
	}

	// `Append` all in one
	if (type === 'a' && current.type === 'a') {
		current.items.push(instruction);
		return self; 
	}	

	self.instructions[++self.index]  = { type:type,  items: [instruction]}
	
	return self;
};

/**
 * 
 */
StringBuilder.prototype.append = function() {
	var self = this;
	
	self.add( new Append( arguments ), 'a' );

	return self; 
};

/**
 * 
 */
StringBuilder.prototype.appendLine = function() {
	var self = this;
	
	self.add( new Append( arguments ), 'a' );
	self.append(self.newline);

	return self;
};

/**
 * 
 */
StringBuilder.prototype.insert = function(value, position) {
	var self = this;
	
	return self.add( new Insert(value, position), 'i' );
};

/**
 * 
 */
StringBuilder.prototype.replace = function(searchvalue, newvalue) {
	var self = this;
	
	return self.add( new Replace(searchvalue, newvalue), 'r' );
};

/**
 * Overrides toString
 */
StringBuilder.prototype.build = function(fn) {
	var self = this;

	var wfall = [];

	wfall.push(function(callback){
		callback(null, '');
	});

	self.instructions.forEach(function(inst){

		if (inst.type === 'a') {
			wfall.push(function(result, callback){
				buildAppends(
					inst.items, 
					function(err, builded) {
						callback(null, result + builded);
					}
				);
			});
		} else if ((/^[ir]{1}$/i).test(inst.type)) {
			var item = inst.items[0];

			if (item != undefined) {
				wfall.push(function(result, callback){
					item.build.apply(item, [result, callback]);
				});
			}

		}
	});

	async.waterfall(
		wfall,
		function(err, result){
			if (err) fn && fn(err)
			fn(null, result);
		}
	);
}

/**
 * Overrides toString
 */
StringBuilder.prototype.toString = function(fn) {
	var self = this;

	if (fn && typeof fn === 'function') {
		self.build(fn)
	}

	return '[Object StringBuilder]'
};

/**
 * Return the type of `instruction`
 *   a == 'Append'
 *   i == 'Insert'
 *   R == 'Replace'
 * 
 *
 * @param {Object} instruction
 */
function getTypeInstruction(instruction) {

	if(false === (this instanceof Append)) {
        return 'a';
    }

    if(false === (this instanceof Insert)) {
        return 'i';
    }

    if(false === (this instanceof Replace)) {
        return 'r';
    }

    return '';
}

/**
 * Build all `items` Append on parallel
 */
function buildAppends(items, fn) {
	
	var fns = items.map(function(item){
		return function(callback){
			buildAppend.apply(item, [item, callback]);
		}
	});

	async.parallel(
		fns,
		function(err, results) {
			if (err) fn && fn(err)
			fn(null, results.join(''))
		}
	);

}

/**
 * Build and Append
 */
function buildAppend(append, fn){
	var r = new XRegExp(regexLib.format, 'g');
	
	if (r.test( append.format )) {
		var result = XRegExp.replace(append.format, r, function(match){
			if (match.format !== null) {

				return formatter.format(match.format, append.values[match.arg]);
			} 

			return append.values[match.arg].toString();
		});
		fn(null, result);
	} else {
		if (true === (append.format instanceof StringBuilder)) {
			append.format.build(fn);
		} else {
			fn(null, append.format);	
		}
	}
}
