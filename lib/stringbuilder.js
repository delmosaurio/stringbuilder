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
 
module.exports.version = '0.0.6';

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
	
	var first = arguments[0] || ''; 

	if (typeof first!=='string') {
		throw new Error('The first args can\'t be an ' + typeof first);
	}

	arguments[0] =  first 
					 ? first + self.newline 
			 		 : self.newline;

	self.add( new Append( arguments ), 'a' );
	//self.append(self.newline);

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
 * Write into `stream` the result of the StringBuilder
 *
 * @param {Stream} stream
 * @param {Function} fn
 */
StringBuilder.prototype.writeStream = function(stream, fn) {
	var self =  this;

	self.build(function(err, results) {
		if (err) { fn && fn(err) }
		stream.write(results);
	    fn && fn(null, results);
	});

	return self;
}

/**
 * Install the `feature` into Node.js
 */
StringBuilder.extend = function(feature) {
	var self = this;
	
	if (feature && feature.toLowerCase() === 'string') {
		extendString();
	}

	return self;
};

/**
 * Overrides toString
 */
StringBuilder.prototype.toString = function(fn) {
	var self = this;

	if (fn && typeof fn === 'function') {
		self.build(fn)
	}

	return '[Object StringBuilder]';
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

/**
 * Extends the String object
 */
function extendString() {
	
	if (!String.format  && !String.prototype.format) {

		String.format = function() {

			if (!arguments || arguments.length === 0) return '';

			if (arguments.length === 1) return arguments[0];

			var text = arguments[0];
			var values = [];

			for (var i = 1; i < arguments.length; i++) {
				values[i-1] = arguments[i]
			};

			var r = new XRegExp(regexLib.format, 'g');

			if (r.test( text )) {
				var result = XRegExp.replace(text, r, function(match){

					if (match.format != undefined) {
						return formatter.format(match.format, values[match.arg]);
					} 

					return values[match.arg].toString();
				});
				return result;
			} else {
				return text;
			}

			
		}

		String.prototype.format = function() {
			var self = String(this);

			if (!arguments || arguments.length === 0) return self; 

			var args = [];
			args[0] =  self

			for (var i=0; i < arguments.length;i++) {
				args[i+1] = arguments[i]
			}
			
			return String.format.apply(null, args);
		}

	}

}