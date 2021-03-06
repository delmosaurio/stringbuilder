/*!
 * StringBuilder
 * Copyright(c) 2013 Delmo Carrozzo <dcardev@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var XRegExp = require('xregexp').XRegExp
  , stream = require("stream")
  , async = require('async')
  , util = require('util')
  , utils = require('./utils')
  , Append = require('./append')
  , Insert = require('./insert')
  , Replace = require('./replace');

/**
 * XRegExp for formats
 * 
 */
var regexLib = {
	format: '{(?<arg>\\d+)(:(?<format>[^{}]+))?}'
};

var _config = { };

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

	stream.Stream.call(self)

	var ops = options || {};

	if (_config.newline === undefined) {
		var isWindows = process.platform == 'win32';
		_config.newline = isWindows ? '\r\n' : '\n';
	}

	self.newline = ops.newline || _config.newline;
	
	self.instructions = [];   // instruction to build
	self.index = 0;           // index of instruction
		
	self.version = require("../package.json").version;

	return self;
};

// inherits base
util.inherits(StringBuilder, stream.Stream)

/** 
 * Configure all instance of StringBuilder with `ops`
 *
 * @param {Object} ops
 */
StringBuilder.prototype.configure = function(ops) {
	var self = this

	if (ops.newline !== undefined) {
		_config.newline = ops.newline	;
	}
		
	return self;
};

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
 * Append `arguments`
 * 
 * @return {[type]} [description]
 */
StringBuilder.prototype.append = function() {
	var self = this;
	
	self.add( new Append( arguments ), 'a' );

	return self; 
};

/**
 * Append a new lines after the arguments
 * 
 * @return {StringBuilder}        it self
 */
StringBuilder.prototype.appendLine = function() {
	var self = this;
	
	var first = arguments[0] || ''; 

	if (typeof first !== 'string') {
		throw new Error('The first args can\'t be an ' + typeof first);
	}

	arguments[0] =  first !== undefined
					 ? first.concat(self.newline)
			 		 : self.newline;
    
	self.add( new Append( arguments ), 'a' );
	//self.append(self.newline);

	return self;
};

/**
 *	Insert the `value` at `position`
 * 
 * @param  {[type]} value
 * @param  {[type]} position
 * @return {StringBuilder}        it self
 */
StringBuilder.prototype.insert = function(value, position) {
	var self = this;
	
	return self.add( new Insert(value, position), 'i' );
};

/**
 * Replace `searchvalue` with `newvalue` at before
 * 
 * @param  {Object} searchvalue 
 * @param  {String} newvalue    
 * @return {StringBuilder}        it self
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
};

/**
 * Implemet the flush
 */
StringBuilder.prototype._flush = function(clean, type) {
	var self = this;

	self.build(function(err, data){
		if (err) {
			self.emit.apply(self, 'error', err);
		} else {
			self.emit.apply(self, [type, data]);
		}

		if (clean) {

		}
	});

	return self;
};

/**
 * Flush the data on the stream an `clean`? the cuerrent
 * buffer
 *
 * @param {Bollean} clean
 */
StringBuilder.prototype.flush = function(clean) {
	var self = this;

	clean = clean || false;

    self._flush(clean, 'data');

	return self;
};

/**
 *
StringBuilder.prototype.end = function() {
	var self = this;

	self._flush(true, 'end');

	return self;
};*/

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
};

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
	//console.log(items);
	
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
		
	if ( utils.hasArgs(append.format) ) {
		
		var result = utils.replaceArgs(append.format, append.values);
		
		fn(null, result);
	} else {
		if (true === (append.format instanceof StringBuilder)) {
			append.format.build(fn);
		} else {
			fn(null, append.format.toString());	
		}
	}
}

/**
 * Extends the String object
 */
function extendString() {
	
	if (String.format === undefined  && String.prototype.format === undefined) {
		String.format = function() {
			if (arguments === undefined || arguments.length === 0) {
				return '';
			}

			if (arguments.length === 1) {
				return arguments[0];
			}

			var str = arguments[0];
			var values = [];

			for (var i = 1; i < arguments.length; i++) {
				values[i-1] = arguments[i]
			};

			if (utils.hasArgs(str) ) {
				return utils.replaceArgs(str, values);
			}

			return str;
		}

		String.prototype.format = function() {
			var self = String(this);

			if (arguments === undefined || arguments.length === 0) {
				return self;
			}

			var args = [];
			args[0] =  self;

			for (var i=0; i < arguments.length;i++) {
				args[i+1] = arguments[i]
			}
			
			return String.format.apply(null, args);
		}
	}

	if ( String.prototype.toTitleCase === undefined  
		&& String.prototype.toCamelCase === undefined
		&& String.prototype.toJsonCase === undefined) {

		String.prototype.toTitleCase = function(clean) {
			return utils.toTitleCase(String(this), clean);
		}

		String.prototype.toCamelCase = function(clean) {
			return utils.toCamelCase(String(this), clean);
		}

		String.prototype.toJsonCase = function(clean) {
			return utils.toJsonCase(String(this), clean);
		}
	}
	

}