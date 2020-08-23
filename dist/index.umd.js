/*!
 * @dimkk/pg-worker2 v0.0.0
 * (c) [authorFullName]
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('events'), require('util'), require('crypto'), require('path'), require('fs'), require('stream'), require('string_decoder'), require('dns'), require('url'), require('net'), require('assert'), require('tls'), require('pg-native'), require('os'), require('buffer'), require('zlib'), require('tty'), require('http'), require('https')) :
	typeof define === 'function' && define.amd ? define(['exports', 'events', 'util', 'crypto', 'path', 'fs', 'stream', 'string_decoder', 'dns', 'url', 'net', 'assert', 'tls', 'pg-native', 'os', 'buffer', 'zlib', 'tty', 'http', 'https'], factory) :
	(global = global || self, factory(global['[libraryCammelCaseName]'] = {}, global.events, global.util$4, global.crypto, global.path, global.fs, global.stream$3, global.string_decoder$2, global.dns, global.url, global.net, global.assert, global.tls, global.pgNative, global.os, global.buffer, global.zlib, global.tty$1, global.http, global.https));
}(this, (function (exports, events, util$4, crypto, path, fs, stream$3, string_decoder$2, dns, url, net, assert, tls, pgNative, os, buffer, zlib, tty$1, http, https) { 'use strict';

	events = events && Object.prototype.hasOwnProperty.call(events, 'default') ? events['default'] : events;
	util$4 = util$4 && Object.prototype.hasOwnProperty.call(util$4, 'default') ? util$4['default'] : util$4;
	crypto = crypto && Object.prototype.hasOwnProperty.call(crypto, 'default') ? crypto['default'] : crypto;
	path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
	fs = fs && Object.prototype.hasOwnProperty.call(fs, 'default') ? fs['default'] : fs;
	stream$3 = stream$3 && Object.prototype.hasOwnProperty.call(stream$3, 'default') ? stream$3['default'] : stream$3;
	string_decoder$2 = string_decoder$2 && Object.prototype.hasOwnProperty.call(string_decoder$2, 'default') ? string_decoder$2['default'] : string_decoder$2;
	dns = dns && Object.prototype.hasOwnProperty.call(dns, 'default') ? dns['default'] : dns;
	url = url && Object.prototype.hasOwnProperty.call(url, 'default') ? url['default'] : url;
	net = net && Object.prototype.hasOwnProperty.call(net, 'default') ? net['default'] : net;
	assert = assert && Object.prototype.hasOwnProperty.call(assert, 'default') ? assert['default'] : assert;
	tls = tls && Object.prototype.hasOwnProperty.call(tls, 'default') ? tls['default'] : tls;
	pgNative = pgNative && Object.prototype.hasOwnProperty.call(pgNative, 'default') ? pgNative['default'] : pgNative;
	os = os && Object.prototype.hasOwnProperty.call(os, 'default') ? os['default'] : os;
	buffer = buffer && Object.prototype.hasOwnProperty.call(buffer, 'default') ? buffer['default'] : buffer;
	zlib = zlib && Object.prototype.hasOwnProperty.call(zlib, 'default') ? zlib['default'] : zlib;
	tty$1 = tty$1 && Object.prototype.hasOwnProperty.call(tty$1, 'default') ? tty$1['default'] : tty$1;
	http = http && Object.prototype.hasOwnProperty.call(http, 'default') ? http['default'] : http;
	https = https && Object.prototype.hasOwnProperty.call(https, 'default') ? https['default'] : https;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	function getCjsExportFromNamespace (n) {
		return n && n['default'] || n;
	}

	var parse = function (source, transform) {
	  return new ArrayParser(source, transform).parse()
	};

	class ArrayParser {
	  constructor (source, transform) {
	    this.source = source;
	    this.transform = transform || identity;
	    this.position = 0;
	    this.entries = [];
	    this.recorded = [];
	    this.dimension = 0;
	  }

	  isEof () {
	    return this.position >= this.source.length
	  }

	  nextCharacter () {
	    var character = this.source[this.position++];
	    if (character === '\\') {
	      return {
	        value: this.source[this.position++],
	        escaped: true
	      }
	    }
	    return {
	      value: character,
	      escaped: false
	    }
	  }

	  record (character) {
	    this.recorded.push(character);
	  }

	  newEntry (includeEmpty) {
	    var entry;
	    if (this.recorded.length > 0 || includeEmpty) {
	      entry = this.recorded.join('');
	      if (entry === 'NULL' && !includeEmpty) {
	        entry = null;
	      }
	      if (entry !== null) entry = this.transform(entry);
	      this.entries.push(entry);
	      this.recorded = [];
	    }
	  }

	  consumeDimensions () {
	    if (this.source[0] === '[') {
	      while (!this.isEof()) {
	        var char = this.nextCharacter();
	        if (char.value === '=') break
	      }
	    }
	  }

	  parse (nested) {
	    var character, parser, quote;
	    this.consumeDimensions();
	    while (!this.isEof()) {
	      character = this.nextCharacter();
	      if (character.value === '{' && !quote) {
	        this.dimension++;
	        if (this.dimension > 1) {
	          parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
	          this.entries.push(parser.parse(true));
	          this.position += parser.position - 2;
	        }
	      } else if (character.value === '}' && !quote) {
	        this.dimension--;
	        if (!this.dimension) {
	          this.newEntry();
	          if (nested) return this.entries
	        }
	      } else if (character.value === '"' && !character.escaped) {
	        if (quote) this.newEntry(true);
	        quote = !quote;
	      } else if (character.value === ',' && !quote) {
	        this.newEntry();
	      } else {
	        this.record(character.value);
	      }
	    }
	    if (this.dimension !== 0) {
	      throw new Error('array dimension not balanced')
	    }
	    return this.entries
	  }
	}

	function identity (value) {
	  return value
	}

	var postgresArray = {
		parse: parse
	};

	var arrayParser = {
	  create: function (source, transform) {
	    return {
	      parse: function() {
	        return postgresArray.parse(source, transform);
	      }
	    };
	  }
	};

	var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
	var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
	var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
	var INFINITY = /^-?infinity$/;

	var postgresDate = function parseDate (isoDate) {
	  if (INFINITY.test(isoDate)) {
	    // Capitalize to Infinity before passing to Number
	    return Number(isoDate.replace('i', 'I'))
	  }
	  var matches = DATE_TIME.exec(isoDate);

	  if (!matches) {
	    // Force YYYY-MM-DD dates to be parsed as local time
	    return getDate(isoDate) || null
	  }

	  var isBC = !!matches[8];
	  var year = parseInt(matches[1], 10);
	  if (isBC) {
	    year = bcYearToNegativeYear(year);
	  }

	  var month = parseInt(matches[2], 10) - 1;
	  var day = matches[3];
	  var hour = parseInt(matches[4], 10);
	  var minute = parseInt(matches[5], 10);
	  var second = parseInt(matches[6], 10);

	  var ms = matches[7];
	  ms = ms ? 1000 * parseFloat(ms) : 0;

	  var date;
	  var offset = timeZoneOffset(isoDate);
	  if (offset != null) {
	    date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));

	    // Account for years from 0 to 99 being interpreted as 1900-1999
	    // by Date.UTC / the multi-argument form of the Date constructor
	    if (is0To99(year)) {
	      date.setUTCFullYear(year);
	    }

	    date.setTime(date.getTime() - offset);
	  } else {
	    date = new Date(year, month, day, hour, minute, second, ms);

	    if (is0To99(year)) {
	      date.setFullYear(year);
	    }
	  }

	  return date
	};

	function getDate (isoDate) {
	  var matches = DATE.exec(isoDate);
	  if (!matches) {
	    return
	  }

	  var year = parseInt(matches[1], 10);
	  var isBC = !!matches[4];
	  if (isBC) {
	    year = bcYearToNegativeYear(year);
	  }

	  var month = parseInt(matches[2], 10) - 1;
	  var day = matches[3];
	  // YYYY-MM-DD will be parsed as local time
	  var date = new Date(year, month, day);

	  if (is0To99(year)) {
	    date.setFullYear(year);
	  }

	  return date
	}

	// match timezones:
	// Z (UTC)
	// -05
	// +06:30
	function timeZoneOffset (isoDate) {
	  var zone = TIME_ZONE.exec(isoDate.split(' ')[1]);
	  if (!zone) return
	  var type = zone[1];

	  if (type === 'Z') {
	    return 0
	  }
	  var sign = type === '-' ? -1 : 1;
	  var offset = parseInt(zone[2], 10) * 3600 +
	    parseInt(zone[3] || 0, 10) * 60 +
	    parseInt(zone[4] || 0, 10);

	  return offset * sign * 1000
	}

	function bcYearToNegativeYear (year) {
	  // Account for numerical difference between representations of BC years
	  // See: https://github.com/bendrucker/postgres-date/issues/5
	  return -(year - 1)
	}

	function is0To99 (num) {
	  return num >= 0 && num < 100
	}

	var mutable = extend;

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend(target) {
	    for (var i = 1; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key];
	            }
	        }
	    }

	    return target
	}

	var postgresInterval = PostgresInterval;

	function PostgresInterval (raw) {
	  if (!(this instanceof PostgresInterval)) {
	    return new PostgresInterval(raw)
	  }
	  mutable(this, parse$1(raw));
	}
	var properties = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
	PostgresInterval.prototype.toPostgres = function () {
	  var filtered = properties.filter(this.hasOwnProperty, this);

	  // In addition to `properties`, we need to account for fractions of seconds.
	  if (this.milliseconds && filtered.indexOf('seconds') < 0) {
	    filtered.push('seconds');
	  }

	  if (filtered.length === 0) return '0'
	  return filtered
	    .map(function (property) {
	      var value = this[property] || 0;

	      // Account for fractional part of seconds,
	      // remove trailing zeroes.
	      if (property === 'seconds' && this.milliseconds) {
	        value = (value + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, '');
	      }

	      return value + ' ' + property
	    }, this)
	    .join(' ')
	};

	var propertiesISOEquivalent = {
	  years: 'Y',
	  months: 'M',
	  days: 'D',
	  hours: 'H',
	  minutes: 'M',
	  seconds: 'S'
	};
	var dateProperties = ['years', 'months', 'days'];
	var timeProperties = ['hours', 'minutes', 'seconds'];
	// according to ISO 8601
	PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function () {
	  var datePart = dateProperties
	    .map(buildProperty, this)
	    .join('');

	  var timePart = timeProperties
	    .map(buildProperty, this)
	    .join('');

	  return 'P' + datePart + 'T' + timePart

	  function buildProperty (property) {
	    var value = this[property] || 0;

	    // Account for fractional part of seconds,
	    // remove trailing zeroes.
	    if (property === 'seconds' && this.milliseconds) {
	      value = (value + this.milliseconds / 1000).toFixed(6).replace(/0+$/, '');
	    }

	    return value + propertiesISOEquivalent[property]
	  }
	};

	var NUMBER = '([+-]?\\d+)';
	var YEAR = NUMBER + '\\s+years?';
	var MONTH = NUMBER + '\\s+mons?';
	var DAY = NUMBER + '\\s+days?';
	var TIME = '([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?';
	var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function (regexString) {
	  return '(' + regexString + ')?'
	})
	  .join('\\s*'));

	// Positions of values in regex match
	var positions = {
	  years: 2,
	  months: 4,
	  days: 6,
	  hours: 9,
	  minutes: 10,
	  seconds: 11,
	  milliseconds: 12
	};
	// We can use negative time
	var negatives = ['hours', 'minutes', 'seconds', 'milliseconds'];

	function parseMilliseconds (fraction) {
	  // add omitted zeroes
	  var microseconds = fraction + '000000'.slice(fraction.length);
	  return parseInt(microseconds, 10) / 1000
	}

	function parse$1 (interval) {
	  if (!interval) return {}
	  var matches = INTERVAL.exec(interval);
	  var isNegative = matches[8] === '-';
	  return Object.keys(positions)
	    .reduce(function (parsed, property) {
	      var position = positions[property];
	      var value = matches[position];
	      // no empty string
	      if (!value) return parsed
	      // milliseconds are actually microseconds (up to 6 digits)
	      // with omitted trailing zeroes.
	      value = property === 'milliseconds'
	        ? parseMilliseconds(value)
	        : parseInt(value, 10);
	      // no zeros
	      if (!value) return parsed
	      if (isNegative && ~negatives.indexOf(property)) {
	        value *= -1;
	      }
	      parsed[property] = value;
	      return parsed
	    }, {})
	}

	var postgresBytea = function parseBytea (input) {
	  if (/^\\x/.test(input)) {
	    // new 'hex' style response (pg >9.0)
	    return new Buffer(input.substr(2), 'hex')
	  }
	  var output = '';
	  var i = 0;
	  while (i < input.length) {
	    if (input[i] !== '\\') {
	      output += input[i];
	      ++i;
	    } else {
	      if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
	        output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
	        i += 4;
	      } else {
	        var backslashes = 1;
	        while (i + backslashes < input.length && input[i + backslashes] === '\\') {
	          backslashes++;
	        }
	        for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
	          output += '\\';
	        }
	        i += Math.floor(backslashes / 2) * 2;
	      }
	    }
	  }
	  return new Buffer(output, 'binary')
	};

	function allowNull (fn) {
	  return function nullAllowed (value) {
	    if (value === null) return value
	    return fn(value)
	  }
	}

	function parseBool (value) {
	  if (value === null) return value
	  return value === 'TRUE' ||
	    value === 't' ||
	    value === 'true' ||
	    value === 'y' ||
	    value === 'yes' ||
	    value === 'on' ||
	    value === '1';
	}

	function parseBoolArray (value) {
	  if (!value) return null
	  return postgresArray.parse(value, parseBool)
	}

	function parseBaseTenInt (string) {
	  return parseInt(string, 10)
	}

	function parseIntegerArray (value) {
	  if (!value) return null
	  return postgresArray.parse(value, allowNull(parseBaseTenInt))
	}

	function parseBigIntegerArray (value) {
	  if (!value) return null
	  return postgresArray.parse(value, allowNull(function (entry) {
	    return parseBigInteger(entry).trim()
	  }))
	}

	var parsePointArray = function(value) {
	  if(!value) { return null; }
	  var p = arrayParser.create(value, function(entry) {
	    if(entry !== null) {
	      entry = parsePoint(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseFloatArray = function(value) {
	  if(!value) { return null; }
	  var p = arrayParser.create(value, function(entry) {
	    if(entry !== null) {
	      entry = parseFloat(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseStringArray = function(value) {
	  if(!value) { return null; }

	  var p = arrayParser.create(value);
	  return p.parse();
	};

	var parseDateArray = function(value) {
	  if (!value) { return null; }

	  var p = arrayParser.create(value, function(entry) {
	    if (entry !== null) {
	      entry = postgresDate(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseIntervalArray = function(value) {
	  if (!value) { return null; }

	  var p = arrayParser.create(value, function(entry) {
	    if (entry !== null) {
	      entry = postgresInterval(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseByteAArray = function(value) {
	  if (!value) { return null; }

	  return postgresArray.parse(value, allowNull(postgresBytea));
	};

	var parseInteger = function(value) {
	  return parseInt(value, 10);
	};

	var parseBigInteger = function(value) {
	  var valStr = String(value);
	  if (/^\d+$/.test(valStr)) { return valStr; }
	  return value;
	};

	var parseJsonArray = function(value) {
	  if (!value) { return null; }

	  return postgresArray.parse(value, allowNull(JSON.parse));
	};

	var parsePoint = function(value) {
	  if (value[0] !== '(') { return null; }

	  value = value.substring( 1, value.length - 1 ).split(',');

	  return {
	    x: parseFloat(value[0])
	  , y: parseFloat(value[1])
	  };
	};

	var parseCircle = function(value) {
	  if (value[0] !== '<' && value[1] !== '(') { return null; }

	  var point = '(';
	  var radius = '';
	  var pointParsed = false;
	  for (var i = 2; i < value.length - 1; i++){
	    if (!pointParsed) {
	      point += value[i];
	    }

	    if (value[i] === ')') {
	      pointParsed = true;
	      continue;
	    } else if (!pointParsed) {
	      continue;
	    }

	    if (value[i] === ','){
	      continue;
	    }

	    radius += value[i];
	  }
	  var result = parsePoint(point);
	  result.radius = parseFloat(radius);

	  return result;
	};

	var init = function(register) {
	  register(20, parseBigInteger); // int8
	  register(21, parseInteger); // int2
	  register(23, parseInteger); // int4
	  register(26, parseInteger); // oid
	  register(700, parseFloat); // float4/real
	  register(701, parseFloat); // float8/double
	  register(16, parseBool);
	  register(1082, postgresDate); // date
	  register(1114, postgresDate); // timestamp without timezone
	  register(1184, postgresDate); // timestamp
	  register(600, parsePoint); // point
	  register(651, parseStringArray); // cidr[]
	  register(718, parseCircle); // circle
	  register(1000, parseBoolArray);
	  register(1001, parseByteAArray);
	  register(1005, parseIntegerArray); // _int2
	  register(1007, parseIntegerArray); // _int4
	  register(1028, parseIntegerArray); // oid[]
	  register(1016, parseBigIntegerArray); // _int8
	  register(1017, parsePointArray); // point[]
	  register(1021, parseFloatArray); // _float4
	  register(1022, parseFloatArray); // _float8
	  register(1231, parseFloatArray); // _numeric
	  register(1014, parseStringArray); //char
	  register(1015, parseStringArray); //varchar
	  register(1008, parseStringArray);
	  register(1009, parseStringArray);
	  register(1040, parseStringArray); // macaddr[]
	  register(1041, parseStringArray); // inet[]
	  register(1115, parseDateArray); // timestamp without time zone[]
	  register(1182, parseDateArray); // _date
	  register(1185, parseDateArray); // timestamp with time zone[]
	  register(1186, postgresInterval);
	  register(1187, parseIntervalArray);
	  register(17, postgresBytea);
	  register(114, JSON.parse.bind(JSON)); // json
	  register(3802, JSON.parse.bind(JSON)); // jsonb
	  register(199, parseJsonArray); // json[]
	  register(3807, parseJsonArray); // jsonb[]
	  register(3907, parseStringArray); // numrange[]
	  register(2951, parseStringArray); // uuid[]
	  register(791, parseStringArray); // money[]
	  register(1183, parseStringArray); // time[]
	  register(1270, parseStringArray); // timetz[]
	};

	var textParsers = {
	  init: init
	};

	// selected so (BASE - 1) * 0x100000000 + 0xffffffff is a safe integer
	var BASE = 1000000;

	function readInt8(buffer) {
		var high = buffer.readInt32BE(0);
		var low = buffer.readUInt32BE(4);
		var sign = '';

		if (high < 0) {
			high = ~high + (low === 0);
			low = (~low + 1) >>> 0;
			sign = '-';
		}

		var result = '';
		var carry;
		var t;
		var digits;
		var pad;
		var l;
		var i;

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			t = 0x100000000 * carry + low;
			digits = '' + t % BASE;

			return sign + digits + result;
		}
	}

	var pgInt8 = readInt8;

	var parseBits = function(data, bits, offset, invert, callback) {
	  offset = offset || 0;
	  invert = invert || false;
	  callback = callback || function(lastValue, newValue, bits) { return (lastValue * Math.pow(2, bits)) + newValue; };
	  var offsetBytes = offset >> 3;

	  var inv = function(value) {
	    if (invert) {
	      return ~value & 0xff;
	    }

	    return value;
	  };

	  // read first (maybe partial) byte
	  var mask = 0xff;
	  var firstBits = 8 - (offset % 8);
	  if (bits < firstBits) {
	    mask = (0xff << (8 - bits)) & 0xff;
	    firstBits = bits;
	  }

	  if (offset) {
	    mask = mask >> (offset % 8);
	  }

	  var result = 0;
	  if ((offset % 8) + bits >= 8) {
	    result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
	  }

	  // read bytes
	  var bytes = (bits + offset) >> 3;
	  for (var i = offsetBytes + 1; i < bytes; i++) {
	    result = callback(result, inv(data[i]), 8);
	  }

	  // bits to read, that are not a complete byte
	  var lastBits = (bits + offset) % 8;
	  if (lastBits > 0) {
	    result = callback(result, inv(data[bytes]) >> (8 - lastBits), lastBits);
	  }

	  return result;
	};

	var parseFloatFromBits = function(data, precisionBits, exponentBits) {
	  var bias = Math.pow(2, exponentBits - 1) - 1;
	  var sign = parseBits(data, 1);
	  var exponent = parseBits(data, exponentBits, 1);

	  if (exponent === 0) {
	    return 0;
	  }

	  // parse mantissa
	  var precisionBitsCounter = 1;
	  var parsePrecisionBits = function(lastValue, newValue, bits) {
	    if (lastValue === 0) {
	      lastValue = 1;
	    }

	    for (var i = 1; i <= bits; i++) {
	      precisionBitsCounter /= 2;
	      if ((newValue & (0x1 << (bits - i))) > 0) {
	        lastValue += precisionBitsCounter;
	      }
	    }

	    return lastValue;
	  };

	  var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);

	  // special cases
	  if (exponent == (Math.pow(2, exponentBits + 1) - 1)) {
	    if (mantissa === 0) {
	      return (sign === 0) ? Infinity : -Infinity;
	    }

	    return NaN;
	  }

	  // normale number
	  return ((sign === 0) ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
	};

	var parseInt16 = function(value) {
	  if (parseBits(value, 1) == 1) {
	    return -1 * (parseBits(value, 15, 1, true) + 1);
	  }

	  return parseBits(value, 15, 1);
	};

	var parseInt32 = function(value) {
	  if (parseBits(value, 1) == 1) {
	    return -1 * (parseBits(value, 31, 1, true) + 1);
	  }

	  return parseBits(value, 31, 1);
	};

	var parseFloat32 = function(value) {
	  return parseFloatFromBits(value, 23, 8);
	};

	var parseFloat64 = function(value) {
	  return parseFloatFromBits(value, 52, 11);
	};

	var parseNumeric = function(value) {
	  var sign = parseBits(value, 16, 32);
	  if (sign == 0xc000) {
	    return NaN;
	  }

	  var weight = Math.pow(10000, parseBits(value, 16, 16));
	  var result = 0;
	  var ndigits = parseBits(value, 16);
	  for (var i = 0; i < ndigits; i++) {
	    result += parseBits(value, 16, 64 + (16 * i)) * weight;
	    weight /= 10000;
	  }

	  var scale = Math.pow(10, parseBits(value, 16, 48));
	  return ((sign === 0) ? 1 : -1) * Math.round(result * scale) / scale;
	};

	var parseDate = function(isUTC, value) {
	  var sign = parseBits(value, 1);
	  var rawValue = parseBits(value, 63, 1);

	  // discard usecs and shift from 2000 to 1970
	  var result = new Date((((sign === 0) ? 1 : -1) * rawValue / 1000) + 946684800000);

	  if (!isUTC) {
	    result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
	  }

	  // add microseconds to the date
	  result.usec = rawValue % 1000;
	  result.getMicroSeconds = function() {
	    return this.usec;
	  };
	  result.setMicroSeconds = function(value) {
	    this.usec = value;
	  };
	  result.getUTCMicroSeconds = function() {
	    return this.usec;
	  };

	  return result;
	};

	var parseArray = function(value) {
	  var dim = parseBits(value, 32);

	  var flags = parseBits(value, 32, 32);
	  var elementType = parseBits(value, 32, 64);

	  var offset = 96;
	  var dims = [];
	  for (var i = 0; i < dim; i++) {
	    // parse dimension
	    dims[i] = parseBits(value, 32, offset);
	    offset += 32;

	    // ignore lower bounds
	    offset += 32;
	  }

	  var parseElement = function(elementType) {
	    // parse content length
	    var length = parseBits(value, 32, offset);
	    offset += 32;

	    // parse null values
	    if (length == 0xffffffff) {
	      return null;
	    }

	    var result;
	    if ((elementType == 0x17) || (elementType == 0x14)) {
	      // int/bigint
	      result = parseBits(value, length * 8, offset);
	      offset += length * 8;
	      return result;
	    }
	    else if (elementType == 0x19) {
	      // string
	      result = value.toString(this.encoding, offset >> 3, (offset += (length << 3)) >> 3);
	      return result;
	    }
	    else {
	      console.log("ERROR: ElementType not implemented: " + elementType);
	    }
	  };

	  var parse = function(dimension, elementType) {
	    var array = [];
	    var i;

	    if (dimension.length > 1) {
	      var count = dimension.shift();
	      for (i = 0; i < count; i++) {
	        array[i] = parse(dimension, elementType);
	      }
	      dimension.unshift(count);
	    }
	    else {
	      for (i = 0; i < dimension[0]; i++) {
	        array[i] = parseElement(elementType);
	      }
	    }

	    return array;
	  };

	  return parse(dims, elementType);
	};

	var parseText = function(value) {
	  return value.toString('utf8');
	};

	var parseBool$1 = function(value) {
	  if(value === null) return null;
	  return (parseBits(value, 8) > 0);
	};

	var init$1 = function(register) {
	  register(20, pgInt8);
	  register(21, parseInt16);
	  register(23, parseInt32);
	  register(26, parseInt32);
	  register(1700, parseNumeric);
	  register(700, parseFloat32);
	  register(701, parseFloat64);
	  register(16, parseBool$1);
	  register(1114, parseDate.bind(null, false));
	  register(1184, parseDate.bind(null, true));
	  register(1000, parseArray);
	  register(1007, parseArray);
	  register(1016, parseArray);
	  register(1008, parseArray);
	  register(1009, parseArray);
	  register(25, parseText);
	};

	var binaryParsers = {
	  init: init$1
	};

	/**
	 * Following query was used to generate this file:

	 SELECT json_object_agg(UPPER(PT.typname), PT.oid::int4 ORDER BY pt.oid)
	 FROM pg_type PT
	 WHERE typnamespace = (SELECT pgn.oid FROM pg_namespace pgn WHERE nspname = 'pg_catalog') -- Take only builting Postgres types with stable OID (extension types are not guaranted to be stable)
	 AND typtype = 'b' -- Only basic types
	 AND typelem = 0 -- Ignore aliases
	 AND typisdefined -- Ignore undefined types
	 */

	var builtins = {
	    BOOL: 16,
	    BYTEA: 17,
	    CHAR: 18,
	    INT8: 20,
	    INT2: 21,
	    INT4: 23,
	    REGPROC: 24,
	    TEXT: 25,
	    OID: 26,
	    TID: 27,
	    XID: 28,
	    CID: 29,
	    JSON: 114,
	    XML: 142,
	    PG_NODE_TREE: 194,
	    SMGR: 210,
	    PATH: 602,
	    POLYGON: 604,
	    CIDR: 650,
	    FLOAT4: 700,
	    FLOAT8: 701,
	    ABSTIME: 702,
	    RELTIME: 703,
	    TINTERVAL: 704,
	    CIRCLE: 718,
	    MACADDR8: 774,
	    MONEY: 790,
	    MACADDR: 829,
	    INET: 869,
	    ACLITEM: 1033,
	    BPCHAR: 1042,
	    VARCHAR: 1043,
	    DATE: 1082,
	    TIME: 1083,
	    TIMESTAMP: 1114,
	    TIMESTAMPTZ: 1184,
	    INTERVAL: 1186,
	    TIMETZ: 1266,
	    BIT: 1560,
	    VARBIT: 1562,
	    NUMERIC: 1700,
	    REFCURSOR: 1790,
	    REGPROCEDURE: 2202,
	    REGOPER: 2203,
	    REGOPERATOR: 2204,
	    REGCLASS: 2205,
	    REGTYPE: 2206,
	    UUID: 2950,
	    TXID_SNAPSHOT: 2970,
	    PG_LSN: 3220,
	    PG_NDISTINCT: 3361,
	    PG_DEPENDENCIES: 3402,
	    TSVECTOR: 3614,
	    TSQUERY: 3615,
	    GTSVECTOR: 3642,
	    REGCONFIG: 3734,
	    REGDICTIONARY: 3769,
	    JSONB: 3802,
	    REGNAMESPACE: 4089,
	    REGROLE: 4096
	};

	var getTypeParser_1 = getTypeParser;
	var setTypeParser_1 = setTypeParser;
	var arrayParser_1 = arrayParser;
	var builtins$1 = builtins;

	var typeParsers = {
	  text: {},
	  binary: {}
	};

	//the empty parse function
	function noParse (val) {
	  return String(val);
	}
	//returns a function used to convert a specific type (specified by
	//oid) into a result javascript type
	//note: the oid can be obtained via the following sql query:
	//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
	function getTypeParser (oid, format) {
	  format = format || 'text';
	  if (!typeParsers[format]) {
	    return noParse;
	  }
	  return typeParsers[format][oid] || noParse;
	}
	function setTypeParser (oid, format, parseFn) {
	  if(typeof format == 'function') {
	    parseFn = format;
	    format = 'text';
	  }
	  typeParsers[format][oid] = parseFn;
	}
	textParsers.init(function(oid, converter) {
	  typeParsers.text[oid] = converter;
	});

	binaryParsers.init(function(oid, converter) {
	  typeParsers.binary[oid] = converter;
	});

	var pgTypes = {
		getTypeParser: getTypeParser_1,
		setTypeParser: setTypeParser_1,
		arrayParser: arrayParser_1,
		builtins: builtins$1
	};

	var defaults = createCommonjsModule(function (module) {

	module.exports = {
	  // database host. defaults to localhost
	  host: 'localhost',

	  // database user's name
	  user: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,

	  // name of database to connect
	  database: undefined,

	  // database user's password
	  password: null,

	  // a Postgres connection string to be used instead of setting individual connection items
	  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
	  // in the defaults object.
	  connectionString: undefined,

	  // database port
	  port: 5432,

	  // number of rows to return at a time from a prepared statement's
	  // portal. 0 will return all rows at once
	  rows: 0,

	  // binary result mode
	  binary: false,

	  // Connection pool options - see https://github.com/brianc/node-pg-pool

	  // number of connections to use in connection pool
	  // 0 will disable connection pooling
	  max: 10,

	  // max milliseconds a client can go unused before it is removed
	  // from the pool and destroyed
	  idleTimeoutMillis: 30000,

	  client_encoding: '',

	  ssl: false,

	  application_name: undefined,

	  fallback_application_name: undefined,

	  options: undefined,

	  parseInputDatesAsUTC: false,

	  // max milliseconds any query using this connection will execute for before timing out in error.
	  // false=unlimited
	  statement_timeout: false,

	  // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
	  // false=unlimited
	  idle_in_transaction_session_timeout: false,

	  // max milliseconds to wait for query to complete (client side)
	  query_timeout: false,

	  connect_timeout: 0,

	  keepalives: 1,

	  keepalives_idle: 0,
	};


	// save default parsers
	var parseBigInteger = pgTypes.getTypeParser(20, 'text');
	var parseBigIntegerArray = pgTypes.getTypeParser(1016, 'text');

	// parse int8 so you can get your count values as actual numbers
	module.exports.__defineSetter__('parseInt8', function (val) {
	  pgTypes.setTypeParser(20, 'text', val ? pgTypes.getTypeParser(23, 'text') : parseBigInteger);
	  pgTypes.setTypeParser(1016, 'text', val ? pgTypes.getTypeParser(1007, 'text') : parseBigIntegerArray);
	});
	});
	var defaults_1 = defaults.host;
	var defaults_2 = defaults.user;
	var defaults_3 = defaults.database;
	var defaults_4 = defaults.password;
	var defaults_5 = defaults.connectionString;
	var defaults_6 = defaults.port;
	var defaults_7 = defaults.rows;
	var defaults_8 = defaults.binary;
	var defaults_9 = defaults.max;
	var defaults_10 = defaults.idleTimeoutMillis;
	var defaults_11 = defaults.client_encoding;
	var defaults_12 = defaults.ssl;
	var defaults_13 = defaults.application_name;
	var defaults_14 = defaults.fallback_application_name;
	var defaults_15 = defaults.options;
	var defaults_16 = defaults.parseInputDatesAsUTC;
	var defaults_17 = defaults.statement_timeout;
	var defaults_18 = defaults.idle_in_transaction_session_timeout;
	var defaults_19 = defaults.query_timeout;
	var defaults_20 = defaults.connect_timeout;
	var defaults_21 = defaults.keepalives;
	var defaults_22 = defaults.keepalives_idle;

	function escapeElement(elementRepresentation) {
	  var escaped = elementRepresentation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

	  return '"' + escaped + '"'
	}

	// convert a JS array to a postgres array literal
	// uses comma separator so won't work for types like box that use
	// a different array separator.
	function arrayString(val) {
	  var result = '{';
	  for (var i = 0; i < val.length; i++) {
	    if (i > 0) {
	      result = result + ',';
	    }
	    if (val[i] === null || typeof val[i] === 'undefined') {
	      result = result + 'NULL';
	    } else if (Array.isArray(val[i])) {
	      result = result + arrayString(val[i]);
	    } else if (val[i] instanceof Buffer) {
	      result += '\\\\x' + val[i].toString('hex');
	    } else {
	      result += escapeElement(prepareValue(val[i]));
	    }
	  }
	  result = result + '}';
	  return result
	}

	// converts values from javascript types
	// to their 'raw' counterparts for use as a postgres parameter
	// note: you can override this function to provide your own conversion mechanism
	// for complex types, etc...
	var prepareValue = function (val, seen) {
	  if (val instanceof Buffer) {
	    return val
	  }
	  if (ArrayBuffer.isView(val)) {
	    var buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
	    if (buf.length === val.byteLength) {
	      return buf
	    }
	    return buf.slice(val.byteOffset, val.byteOffset + val.byteLength) // Node.js v4 does not support those Buffer.from params
	  }
	  if (val instanceof Date) {
	    if (defaults.parseInputDatesAsUTC) {
	      return dateToStringUTC(val)
	    } else {
	      return dateToString(val)
	    }
	  }
	  if (Array.isArray(val)) {
	    return arrayString(val)
	  }
	  if (val === null || typeof val === 'undefined') {
	    return null
	  }
	  if (typeof val === 'object') {
	    return prepareObject(val, seen)
	  }
	  return val.toString()
	};

	function prepareObject(val, seen) {
	  if (val && typeof val.toPostgres === 'function') {
	    seen = seen || [];
	    if (seen.indexOf(val) !== -1) {
	      throw new Error('circular reference detected while preparing "' + val + '" for query')
	    }
	    seen.push(val);

	    return prepareValue(val.toPostgres(prepareValue), seen)
	  }
	  return JSON.stringify(val)
	}

	function pad(number, digits) {
	  number = '' + number;
	  while (number.length < digits) {
	    number = '0' + number;
	  }
	  return number
	}

	function dateToString(date) {
	  var offset = -date.getTimezoneOffset();

	  var year = date.getFullYear();
	  var isBCYear = year < 1;
	  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

	  var ret =
	    pad(year, 4) +
	    '-' +
	    pad(date.getMonth() + 1, 2) +
	    '-' +
	    pad(date.getDate(), 2) +
	    'T' +
	    pad(date.getHours(), 2) +
	    ':' +
	    pad(date.getMinutes(), 2) +
	    ':' +
	    pad(date.getSeconds(), 2) +
	    '.' +
	    pad(date.getMilliseconds(), 3);

	  if (offset < 0) {
	    ret += '-';
	    offset *= -1;
	  } else {
	    ret += '+';
	  }

	  ret += pad(Math.floor(offset / 60), 2) + ':' + pad(offset % 60, 2);
	  if (isBCYear) ret += ' BC';
	  return ret
	}

	function dateToStringUTC(date) {
	  var year = date.getUTCFullYear();
	  var isBCYear = year < 1;
	  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

	  var ret =
	    pad(year, 4) +
	    '-' +
	    pad(date.getUTCMonth() + 1, 2) +
	    '-' +
	    pad(date.getUTCDate(), 2) +
	    'T' +
	    pad(date.getUTCHours(), 2) +
	    ':' +
	    pad(date.getUTCMinutes(), 2) +
	    ':' +
	    pad(date.getUTCSeconds(), 2) +
	    '.' +
	    pad(date.getUTCMilliseconds(), 3);

	  ret += '+00:00';
	  if (isBCYear) ret += ' BC';
	  return ret
	}

	function normalizeQueryConfig(config, values, callback) {
	  // can take in strings or config objects
	  config = typeof config === 'string' ? { text: config } : config;
	  if (values) {
	    if (typeof values === 'function') {
	      config.callback = values;
	    } else {
	      config.values = values;
	    }
	  }
	  if (callback) {
	    config.callback = callback;
	  }
	  return config
	}

	const md5 = function (string) {
	  return crypto.createHash('md5').update(string, 'utf-8').digest('hex')
	};

	// See AuthenticationMD5Password at https://www.postgresql.org/docs/current/static/protocol-flow.html
	const postgresMd5PasswordHash = function (user, password, salt) {
	  var inner = md5(password + user);
	  var outer = md5(Buffer.concat([Buffer.from(inner), salt]));
	  return 'md5' + outer
	};

	var utils = {
	  prepareValue: function prepareValueWrapper(value) {
	    // this ensures that extra arguments do not get passed into prepareValue
	    // by accident, eg: from calling values.map(utils.prepareValue)
	    return prepareValue(value)
	  },
	  normalizeQueryConfig,
	  postgresMd5PasswordHash,
	  md5,
	};

	function startSession(mechanisms) {
	  if (mechanisms.indexOf('SCRAM-SHA-256') === -1) {
	    throw new Error('SASL: Only mechanism SCRAM-SHA-256 is currently supported')
	  }

	  const clientNonce = crypto.randomBytes(18).toString('base64');

	  return {
	    mechanism: 'SCRAM-SHA-256',
	    clientNonce,
	    response: 'n,,n=*,r=' + clientNonce,
	    message: 'SASLInitialResponse',
	  }
	}

	function continueSession(session, password, serverData) {
	  if (session.message !== 'SASLInitialResponse') {
	    throw new Error('SASL: Last message was not SASLInitialResponse')
	  }

	  const sv = extractVariablesFromFirstServerMessage(serverData);

	  if (!sv.nonce.startsWith(session.clientNonce)) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce')
	  }

	  var saltBytes = Buffer.from(sv.salt, 'base64');

	  var saltedPassword = Hi(password, saltBytes, sv.iteration);

	  var clientKey = createHMAC(saltedPassword, 'Client Key');
	  var storedKey = crypto.createHash('sha256').update(clientKey).digest();

	  var clientFirstMessageBare = 'n=*,r=' + session.clientNonce;
	  var serverFirstMessage = 'r=' + sv.nonce + ',s=' + sv.salt + ',i=' + sv.iteration;

	  var clientFinalMessageWithoutProof = 'c=biws,r=' + sv.nonce;

	  var authMessage = clientFirstMessageBare + ',' + serverFirstMessage + ',' + clientFinalMessageWithoutProof;

	  var clientSignature = createHMAC(storedKey, authMessage);
	  var clientProofBytes = xorBuffers(clientKey, clientSignature);
	  var clientProof = clientProofBytes.toString('base64');

	  var serverKey = createHMAC(saltedPassword, 'Server Key');
	  var serverSignatureBytes = createHMAC(serverKey, authMessage);

	  session.message = 'SASLResponse';
	  session.serverSignature = serverSignatureBytes.toString('base64');
	  session.response = clientFinalMessageWithoutProof + ',p=' + clientProof;
	}

	function finalizeSession(session, serverData) {
	  if (session.message !== 'SASLResponse') {
	    throw new Error('SASL: Last message was not SASLResponse')
	  }

	  var serverSignature;

	  String(serverData)
	    .split(',')
	    .forEach(function (part) {
	      switch (part[0]) {
	        case 'v':
	          serverSignature = part.substr(2);
	          break
	      }
	    });

	  if (serverSignature !== session.serverSignature) {
	    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match')
	  }
	}

	function extractVariablesFromFirstServerMessage(data) {
	  var nonce, salt, iteration;

	  String(data)
	    .split(',')
	    .forEach(function (part) {
	      switch (part[0]) {
	        case 'r':
	          nonce = part.substr(2);
	          break
	        case 's':
	          salt = part.substr(2);
	          break
	        case 'i':
	          iteration = parseInt(part.substr(2), 10);
	          break
	      }
	    });

	  if (!nonce) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing')
	  }

	  if (!salt) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing')
	  }

	  if (!iteration) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing')
	  }

	  return {
	    nonce,
	    salt,
	    iteration,
	  }
	}

	function xorBuffers(a, b) {
	  if (!Buffer.isBuffer(a)) a = Buffer.from(a);
	  if (!Buffer.isBuffer(b)) b = Buffer.from(b);
	  var res = [];
	  if (a.length > b.length) {
	    for (var i = 0; i < b.length; i++) {
	      res.push(a[i] ^ b[i]);
	    }
	  } else {
	    for (var j = 0; j < a.length; j++) {
	      res.push(a[j] ^ b[j]);
	    }
	  }
	  return Buffer.from(res)
	}

	function createHMAC(key, msg) {
	  return crypto.createHmac('sha256', key).update(msg).digest()
	}

	function Hi(password, saltBytes, iterations) {
	  var ui1 = createHMAC(password, Buffer.concat([saltBytes, Buffer.from([0, 0, 0, 1])]));
	  var ui = ui1;
	  for (var i = 0; i < iterations - 1; i++) {
	    ui1 = createHMAC(password, ui1);
	    ui = xorBuffers(ui, ui1);
	  }

	  return ui
	}

	var sasl = {
	  startSession,
	  continueSession,
	  finalizeSession,
	};

	var through_1 = createCommonjsModule(function (module, exports) {
	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	exports = module.exports = through;
	through.through = through;

	//create a readable writable stream.

	function through (write, end, opts) {
	  write = write || function (data) { this.queue(data); };
	  end = end || function () { this.queue(null); };

	  var ended = false, destroyed = false, buffer = [], _ended = false;
	  var stream = new stream$3();
	  stream.readable = stream.writable = true;
	  stream.paused = false;

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	  stream.autoDestroy = !(opts && opts.autoDestroy === false);

	  stream.write = function (data) {
	    write.call(this, data);
	    return !stream.paused
	  };

	  function drain() {
	    while(buffer.length && !stream.paused) {
	      var data = buffer.shift();
	      if(null === data)
	        return stream.emit('end')
	      else
	        stream.emit('data', data);
	    }
	  }

	  stream.queue = stream.push = function (data) {
	//    console.error(ended)
	    if(_ended) return stream
	    if(data === null) _ended = true;
	    buffer.push(data);
	    drain();
	    return stream
	  };

	  //this will be registered as the first 'end' listener
	  //must call destroy next tick, to make sure we're after any
	  //stream piped from here.
	  //this is only a problem if end is not emitted synchronously.
	  //a nicer way to do this is to make sure this is the last listener for 'end'

	  stream.on('end', function () {
	    stream.readable = false;
	    if(!stream.writable && stream.autoDestroy)
	      process.nextTick(function () {
	        stream.destroy();
	      });
	  });

	  function _end () {
	    stream.writable = false;
	    end.call(stream);
	    if(!stream.readable && stream.autoDestroy)
	      stream.destroy();
	  }

	  stream.end = function (data) {
	    if(ended) return
	    ended = true;
	    if(arguments.length) stream.write(data);
	    _end(); // will emit or queue
	    return stream
	  };

	  stream.destroy = function () {
	    if(destroyed) return
	    destroyed = true;
	    ended = true;
	    buffer.length = 0;
	    stream.writable = stream.readable = false;
	    stream.emit('close');
	    return stream
	  };

	  stream.pause = function () {
	    if(stream.paused) return
	    stream.paused = true;
	    return stream
	  };

	  stream.resume = function () {
	    if(stream.paused) {
	      stream.paused = false;
	      stream.emit('resume');
	    }
	    drain();
	    //may have become paused again,
	    //as drain emits 'data'.
	    if(!stream.paused)
	      stream.emit('drain');
	    return stream
	  };
	  return stream
	}
	});

	//filter will reemit the data if cb(err,pass) pass is truthy

	// reduce is more tricky
	// maybe we want to group the reductions or emit progress updates occasionally
	// the most basic reduce just emits one 'data' event after it has recieved 'end'



	var Decoder = string_decoder$2.StringDecoder;

	var split_1 = split;

	//TODO pass in a function to map across the lines.

	function split (matcher, mapper, options) {
	  var decoder = new Decoder();
	  var soFar = '';
	  var maxLength = options && options.maxLength;
	  var trailing = options && options.trailing === false ? false : true;
	  if('function' === typeof matcher)
	    mapper = matcher, matcher = null;
	  if (!matcher)
	    matcher = /\r?\n/;

	  function emit(stream, piece) {
	    if(mapper) {
	      try {
	        piece = mapper(piece);
	      }
	      catch (err) {
	        return stream.emit('error', err)
	      }
	      if('undefined' !== typeof piece)
	        stream.queue(piece);
	    }
	    else
	      stream.queue(piece);
	  }

	  function next (stream, buffer) {
	    var pieces = ((soFar != null ? soFar : '') + buffer).split(matcher);
	    soFar = pieces.pop();

	    if (maxLength && soFar.length > maxLength)
	      return stream.emit('error', new Error('maximum buffer reached'))

	    for (var i = 0; i < pieces.length; i++) {
	      var piece = pieces[i];
	      emit(stream, piece);
	    }
	  }

	  return through_1(function (b) {
	    next(this, decoder.write(b));
	  },
	  function () {
	    if(decoder.end)
	      next(this, decoder.end());
	    if(trailing && soFar != null)
	      emit(this, soFar);
	    this.queue(null);
	  })
	}

	var helper = createCommonjsModule(function (module) {

	var Stream = stream$3.Stream
	  , defaultPort = 5432
	  , isWin = (process.platform === 'win32')
	  , warnStream = process.stderr
	;


	var S_IRWXG = 56     //    00070(8)
	  , S_IRWXO = 7      //    00007(8)
	  , S_IFMT  = 61440  // 00170000(8)
	  , S_IFREG = 32768  //  0100000(8)
	;
	function isRegFile(mode) {
	    return ((mode & S_IFMT) == S_IFREG);
	}

	var fieldNames = [ 'host', 'port', 'database', 'user', 'password' ];
	var nrOfFields = fieldNames.length;
	var passKey = fieldNames[ nrOfFields -1 ];


	function warn() {
	    var isWritable = (
	        warnStream instanceof Stream &&
	          true === warnStream.writable
	    );

	    if (isWritable) {
	        var args = Array.prototype.slice.call(arguments).concat("\n");
	        warnStream.write( util$4.format.apply(util$4, args) );
	    }
	}


	Object.defineProperty(module.exports, 'isWin', {
	    get : function() {
	        return isWin;
	    } ,
	    set : function(val) {
	        isWin = val;
	    }
	});


	module.exports.warnTo = function(stream) {
	    var old = warnStream;
	    warnStream = stream;
	    return old;
	};

	module.exports.getFileName = function(env){
	    env = env || process.env;
	    var file = env.PGPASSFILE || (
	        isWin ?
	          path.join( env.APPDATA , 'postgresql', 'pgpass.conf' ) :
	          path.join( env.HOME, '.pgpass' )
	    );
	    return file;
	};

	module.exports.usePgPass = function(stats, fname) {
	    if (Object.prototype.hasOwnProperty.call(process.env, 'PGPASSWORD')) {
	        return false;
	    }

	    if (isWin) {
	        return true;
	    }

	    fname = fname || '<unkn>';

	    if (! isRegFile(stats.mode)) {
	        warn('WARNING: password file "%s" is not a plain file', fname);
	        return false;
	    }

	    if (stats.mode & (S_IRWXG | S_IRWXO)) {
	        /* If password file is insecure, alert the user and ignore it. */
	        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
	        return false;
	    }

	    return true;
	};


	var matcher = module.exports.match = function(connInfo, entry) {
	    return fieldNames.slice(0, -1).reduce(function(prev, field, idx){
	        if (idx == 1) {
	            // the port
	            if ( Number( connInfo[field] || defaultPort ) === Number( entry[field] ) ) {
	                return prev && true;
	            }
	        }
	        return prev && (
	            entry[field] === '*' ||
	              entry[field] === connInfo[field]
	        );
	    }, true);
	};


	module.exports.getPassword = function(connInfo, stream, cb) {
	    var pass;
	    var lineStream = stream.pipe(new split_1());

	    function onLine(line) {
	        var entry = parseLine(line);
	        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
	            pass = entry[passKey];
	            lineStream.end(); // -> calls onEnd(), but pass is set now
	        }
	    }

	    var onEnd = function() {
	        stream.destroy();
	        cb(pass);
	    };

	    var onErr = function(err) {
	        stream.destroy();
	        warn('WARNING: error on reading file: %s', err);
	        cb(undefined);
	    };

	    stream.on('error', onErr);
	    lineStream
	        .on('data', onLine)
	        .on('end', onEnd)
	        .on('error', onErr)
	    ;

	};


	var parseLine = module.exports.parseLine = function(line) {
	    if (line.length < 11 || line.match(/^\s+#/)) {
	        return null;
	    }

	    var curChar = '';
	    var prevChar = '';
	    var fieldIdx = 0;
	    var startIdx = 0;
	    var obj = {};
	    var isLastField = false;
	    var addToObj = function(idx, i0, i1) {
	        var field = line.substring(i0, i1);

	        if (! Object.hasOwnProperty.call(process.env, 'PGPASS_NO_DEESCAPE')) {
	            field = field.replace(/\\([:\\])/g, '$1');
	        }

	        obj[ fieldNames[idx] ] = field;
	    };

	    for (var i = 0 ; i < line.length-1 ; i += 1) {
	        curChar = line.charAt(i+1);
	        prevChar = line.charAt(i);

	        isLastField = (fieldIdx == nrOfFields-1);

	        if (isLastField) {
	            addToObj(fieldIdx, startIdx);
	            break;
	        }

	        if (i >= 0 && curChar == ':' && prevChar !== '\\') {
	            addToObj(fieldIdx, startIdx, i+1);

	            startIdx = i+2;
	            fieldIdx += 1;
	        }
	    }

	    obj = ( Object.keys(obj).length === nrOfFields ) ? obj : null;

	    return obj;
	};


	var isValidEntry = module.exports.isValidEntry = function(entry){
	    var rules = {
	        // host
	        0 : function(x){
	            return x.length > 0;
	        } ,
	        // port
	        1 : function(x){
	            if (x === '*') {
	                return true;
	            }
	            x = Number(x);
	            return (
	                isFinite(x) &&
	                  x > 0 &&
	                  x < 9007199254740992 &&
	                  Math.floor(x) === x
	            );
	        } ,
	        // database
	        2 : function(x){
	            return x.length > 0;
	        } ,
	        // username
	        3 : function(x){
	            return x.length > 0;
	        } ,
	        // password
	        4 : function(x){
	            return x.length > 0;
	        }
	    };

	    for (var idx = 0 ; idx < fieldNames.length ; idx += 1) {
	        var rule = rules[idx];
	        var value = entry[ fieldNames[idx] ] || '';

	        var res = rule(value);
	        if (!res) {
	            return false;
	        }
	    }

	    return true;
	};
	});
	var helper_1 = helper.warnTo;
	var helper_2 = helper.getFileName;
	var helper_3 = helper.usePgPass;
	var helper_4 = helper.match;
	var helper_5 = helper.getPassword;
	var helper_6 = helper.parseLine;
	var helper_7 = helper.isValidEntry;

	var lib = function(connInfo, cb) {
	    var file = helper.getFileName();
	    
	    fs.stat(file, function(err, stat){
	        if (err || !helper.usePgPass(stat, file)) {
	            return cb(undefined);
	        }

	        var st = fs.createReadStream(file);

	        helper.getPassword(connInfo, st, cb);
	    });
	};

	var warnTo = helper.warnTo;
	lib.warnTo = warnTo;

	function TypeOverrides(userTypes) {
	  this._types = userTypes || pgTypes;
	  this.text = {};
	  this.binary = {};
	}

	TypeOverrides.prototype.getOverrides = function (format) {
	  switch (format) {
	    case 'text':
	      return this.text
	    case 'binary':
	      return this.binary
	    default:
	      return {}
	  }
	};

	TypeOverrides.prototype.setTypeParser = function (oid, format, parseFn) {
	  if (typeof format === 'function') {
	    parseFn = format;
	    format = 'text';
	  }
	  this.getOverrides(format)[oid] = parseFn;
	};

	TypeOverrides.prototype.getTypeParser = function (oid, format) {
	  format = format || 'text';
	  return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format)
	};

	var typeOverrides = TypeOverrides;

	//Parse method copied from https://github.com/brianc/node-postgres
	//Copyright (c) 2010-2014 Brian Carlson (brian.m.carlson@gmail.com)
	//MIT License

	//parses a connection string
	function parse$2(str) {
	  //unix socket
	  if (str.charAt(0) === '/') {
	    var config = str.split(' ');
	    return { host: config[0], database: config[1] }
	  }

	  // url parse expects spaces encoded as %20
	  var result = url.parse(
	    / |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str) ? encodeURI(str).replace(/\%25(\d\d)/g, '%$1') : str,
	    true
	  );
	  var config = result.query;
	  for (var k in config) {
	    if (Array.isArray(config[k])) {
	      config[k] = config[k][config[k].length - 1];
	    }
	  }

	  var auth = (result.auth || ':').split(':');
	  config.user = auth[0];
	  config.password = auth.splice(1).join(':');

	  config.port = result.port;
	  if (result.protocol == 'socket:') {
	    config.host = decodeURI(result.pathname);
	    config.database = result.query.db;
	    config.client_encoding = result.query.encoding;
	    return config
	  }
	  if (!config.host) {
	    // Only set the host if there is no equivalent query param.
	    config.host = result.hostname;
	  }

	  // If the host is missing it might be a URL-encoded path to a socket.
	  var pathname = result.pathname;
	  if (!config.host && pathname && /^%2f/i.test(pathname)) {
	    var pathnameSplit = pathname.split('/');
	    config.host = decodeURIComponent(pathnameSplit[0]);
	    pathname = pathnameSplit.splice(1).join('/');
	  }
	  // result.pathname is not always guaranteed to have a '/' prefix (e.g. relative urls)
	  // only strip the slash if it is present.
	  if (pathname && pathname.charAt(0) === '/') {
	    pathname = pathname.slice(1) || null;
	  }
	  config.database = pathname && decodeURI(pathname);

	  if (config.ssl === 'true' || config.ssl === '1') {
	    config.ssl = true;
	  }

	  if (config.ssl === '0') {
	    config.ssl = false;
	  }

	  if (config.sslcert || config.sslkey || config.sslrootcert) {
	    config.ssl = {};
	  }

	  if (config.sslcert) {
	    config.ssl.cert = fs.readFileSync(config.sslcert).toString();
	  }

	  if (config.sslkey) {
	    config.ssl.key = fs.readFileSync(config.sslkey).toString();
	  }

	  if (config.sslrootcert) {
	    config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
	  }

	  return config
	}

	var pgConnectionString = parse$2;

	parse$2.parse = parse$2;

	var parse$3 = pgConnectionString.parse; // parses a connection string

	var val = function (key, config, envVar) {
	  if (envVar === undefined) {
	    envVar = process.env['PG' + key.toUpperCase()];
	  } else if (envVar === false) ; else {
	    envVar = process.env[envVar];
	  }

	  return config[key] || envVar || defaults[key]
	};

	var readSSLConfigFromEnvironment = function () {
	  switch (process.env.PGSSLMODE) {
	    case 'disable':
	      return false
	    case 'prefer':
	    case 'require':
	    case 'verify-ca':
	    case 'verify-full':
	      return true
	    case 'no-verify':
	      return { rejectUnauthorized: false }
	  }
	  return defaults.ssl
	};

	// Convert arg to a string, surround in single quotes, and escape single quotes and backslashes
	var quoteParamValue = function (value) {
	  return "'" + ('' + value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
	};

	var add = function (params, config, paramName) {
	  var value = config[paramName];
	  if (value !== undefined && value !== null) {
	    params.push(paramName + '=' + quoteParamValue(value));
	  }
	};

	class ConnectionParameters {
	  constructor(config) {
	    // if a string is passed, it is a raw connection string so we parse it into a config
	    config = typeof config === 'string' ? parse$3(config) : config || {};

	    // if the config has a connectionString defined, parse IT into the config we use
	    // this will override other default values with what is stored in connectionString
	    if (config.connectionString) {
	      config = Object.assign({}, config, parse$3(config.connectionString));
	    }

	    this.user = val('user', config);
	    this.database = val('database', config);

	    if (this.database === undefined) {
	      this.database = this.user;
	    }

	    this.port = parseInt(val('port', config), 10);
	    this.host = val('host', config);

	    // "hiding" the password so it doesn't show up in stack traces
	    // or if the client is console.logged
	    Object.defineProperty(this, 'password', {
	      configurable: true,
	      enumerable: false,
	      writable: true,
	      value: val('password', config),
	    });

	    this.binary = val('binary', config);
	    this.options = val('options', config);

	    this.ssl = typeof config.ssl === 'undefined' ? readSSLConfigFromEnvironment() : config.ssl;

	    // support passing in ssl=no-verify via connection string
	    if (this.ssl === 'no-verify') {
	      this.ssl = { rejectUnauthorized: false };
	    }

	    this.client_encoding = val('client_encoding', config);
	    this.replication = val('replication', config);
	    // a domain socket begins with '/'
	    this.isDomainSocket = !(this.host || '').indexOf('/');

	    this.application_name = val('application_name', config, 'PGAPPNAME');
	    this.fallback_application_name = val('fallback_application_name', config, false);
	    this.statement_timeout = val('statement_timeout', config, false);
	    this.idle_in_transaction_session_timeout = val('idle_in_transaction_session_timeout', config, false);
	    this.query_timeout = val('query_timeout', config, false);

	    if (config.connectionTimeoutMillis === undefined) {
	      this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
	    } else {
	      this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1000);
	    }

	    if (config.keepAlive === false) {
	      this.keepalives = 0;
	    } else if (config.keepAlive === true) {
	      this.keepalives = 1;
	    }

	    if (typeof config.keepAliveInitialDelayMillis === 'number') {
	      this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1000);
	    }
	  }

	  getLibpqConnectionString(cb) {
	    var params = [];
	    add(params, this, 'user');
	    add(params, this, 'password');
	    add(params, this, 'port');
	    add(params, this, 'application_name');
	    add(params, this, 'fallback_application_name');
	    add(params, this, 'connect_timeout');
	    add(params, this, 'options');

	    var ssl = typeof this.ssl === 'object' ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
	    add(params, ssl, 'sslmode');
	    add(params, ssl, 'sslca');
	    add(params, ssl, 'sslkey');
	    add(params, ssl, 'sslcert');
	    add(params, ssl, 'sslrootcert');

	    if (this.database) {
	      params.push('dbname=' + quoteParamValue(this.database));
	    }
	    if (this.replication) {
	      params.push('replication=' + quoteParamValue(this.replication));
	    }
	    if (this.host) {
	      params.push('host=' + quoteParamValue(this.host));
	    }
	    if (this.isDomainSocket) {
	      return cb(null, params.join(' '))
	    }
	    if (this.client_encoding) {
	      params.push('client_encoding=' + quoteParamValue(this.client_encoding));
	    }
	    dns.lookup(this.host, function (err, address) {
	      if (err) return cb(err, null)
	      params.push('hostaddr=' + quoteParamValue(address));
	      return cb(null, params.join(' '))
	    });
	  }
	}

	var connectionParameters = ConnectionParameters;

	var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;

	// result object returned from query
	// in the 'end' event and also
	// passed as second argument to provided callback
	class Result {
	  constructor(rowMode, types) {
	    this.command = null;
	    this.rowCount = null;
	    this.oid = null;
	    this.rows = [];
	    this.fields = [];
	    this._parsers = undefined;
	    this._types = types;
	    this.RowCtor = null;
	    this.rowAsArray = rowMode === 'array';
	    if (this.rowAsArray) {
	      this.parseRow = this._parseRowAsArray;
	    }
	  }

	  // adds a command complete message
	  addCommandComplete(msg) {
	    var match;
	    if (msg.text) {
	      // pure javascript
	      match = matchRegexp.exec(msg.text);
	    } else {
	      // native bindings
	      match = matchRegexp.exec(msg.command);
	    }
	    if (match) {
	      this.command = match[1];
	      if (match[3]) {
	        // COMMMAND OID ROWS
	        this.oid = parseInt(match[2], 10);
	        this.rowCount = parseInt(match[3], 10);
	      } else if (match[2]) {
	        // COMMAND ROWS
	        this.rowCount = parseInt(match[2], 10);
	      }
	    }
	  }

	  _parseRowAsArray(rowData) {
	    var row = new Array(rowData.length);
	    for (var i = 0, len = rowData.length; i < len; i++) {
	      var rawValue = rowData[i];
	      if (rawValue !== null) {
	        row[i] = this._parsers[i](rawValue);
	      } else {
	        row[i] = null;
	      }
	    }
	    return row
	  }

	  parseRow(rowData) {
	    var row = {};
	    for (var i = 0, len = rowData.length; i < len; i++) {
	      var rawValue = rowData[i];
	      var field = this.fields[i].name;
	      if (rawValue !== null) {
	        row[field] = this._parsers[i](rawValue);
	      } else {
	        row[field] = null;
	      }
	    }
	    return row
	  }

	  addRow(row) {
	    this.rows.push(row);
	  }

	  addFields(fieldDescriptions) {
	    // clears field definitions
	    // multiple query statements in 1 action can result in multiple sets
	    // of rowDescriptions...eg: 'select NOW(); select 1::int;'
	    // you need to reset the fields
	    this.fields = fieldDescriptions;
	    if (this.fields.length) {
	      this._parsers = new Array(fieldDescriptions.length);
	    }
	    for (var i = 0; i < fieldDescriptions.length; i++) {
	      var desc = fieldDescriptions[i];
	      if (this._types) {
	        this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || 'text');
	      } else {
	        this._parsers[i] = pgTypes.getTypeParser(desc.dataTypeID, desc.format || 'text');
	      }
	    }
	  }
	}

	var result = Result;

	const { EventEmitter } = events;




	class Query extends EventEmitter {
	  constructor(config, values, callback) {
	    super();

	    config = utils.normalizeQueryConfig(config, values, callback);

	    this.text = config.text;
	    this.values = config.values;
	    this.rows = config.rows;
	    this.types = config.types;
	    this.name = config.name;
	    this.binary = config.binary;
	    // use unique portal name each time
	    this.portal = config.portal || '';
	    this.callback = config.callback;
	    this._rowMode = config.rowMode;
	    if (process.domain && config.callback) {
	      this.callback = process.domain.bind(config.callback);
	    }
	    this._result = new result(this._rowMode, this.types);

	    // potential for multiple results
	    this._results = this._result;
	    this.isPreparedStatement = false;
	    this._canceledDueToError = false;
	    this._promise = null;
	  }

	  requiresPreparation() {
	    // named queries must always be prepared
	    if (this.name) {
	      return true
	    }
	    // always prepare if there are max number of rows expected per
	    // portal execution
	    if (this.rows) {
	      return true
	    }
	    // don't prepare empty text queries
	    if (!this.text) {
	      return false
	    }
	    // prepare if there are values
	    if (!this.values) {
	      return false
	    }
	    return this.values.length > 0
	  }

	  _checkForMultirow() {
	    // if we already have a result with a command property
	    // then we've already executed one query in a multi-statement simple query
	    // turn our results into an array of results
	    if (this._result.command) {
	      if (!Array.isArray(this._results)) {
	        this._results = [this._result];
	      }
	      this._result = new result(this._rowMode, this.types);
	      this._results.push(this._result);
	    }
	  }

	  // associates row metadata from the supplied
	  // message with this query object
	  // metadata used when parsing row results
	  handleRowDescription(msg) {
	    this._checkForMultirow();
	    this._result.addFields(msg.fields);
	    this._accumulateRows = this.callback || !this.listeners('row').length;
	  }

	  handleDataRow(msg) {
	    let row;

	    if (this._canceledDueToError) {
	      return
	    }

	    try {
	      row = this._result.parseRow(msg.fields);
	    } catch (err) {
	      this._canceledDueToError = err;
	      return
	    }

	    this.emit('row', row, this._result);
	    if (this._accumulateRows) {
	      this._result.addRow(row);
	    }
	  }

	  handleCommandComplete(msg, con) {
	    this._checkForMultirow();
	    this._result.addCommandComplete(msg);
	    // need to sync after each command complete of a prepared statement
	    if (this.isPreparedStatement) {
	      con.sync();
	    }
	  }

	  // if a named prepared statement is created with empty query text
	  // the backend will send an emptyQuery message but *not* a command complete message
	  // execution on the connection will hang until the backend receives a sync message
	  handleEmptyQuery(con) {
	    if (this.isPreparedStatement) {
	      con.sync();
	    }
	  }

	  handleReadyForQuery(con) {
	    if (this._canceledDueToError) {
	      return this.handleError(this._canceledDueToError, con)
	    }
	    if (this.callback) {
	      this.callback(null, this._results);
	    }
	    this.emit('end', this._results);
	  }

	  handleError(err, connection) {
	    // need to sync after error during a prepared statement
	    if (this.isPreparedStatement) {
	      connection.sync();
	    }
	    if (this._canceledDueToError) {
	      err = this._canceledDueToError;
	      this._canceledDueToError = false;
	    }
	    // if callback supplied do not emit error event as uncaught error
	    // events will bubble up to node process
	    if (this.callback) {
	      return this.callback(err)
	    }
	    this.emit('error', err);
	  }

	  submit(connection) {
	    if (typeof this.text !== 'string' && typeof this.name !== 'string') {
	      return new Error('A query must have either text or a name. Supplying neither is unsupported.')
	    }
	    const previous = connection.parsedStatements[this.name];
	    if (this.text && previous && this.text !== previous) {
	      return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`)
	    }
	    if (this.values && !Array.isArray(this.values)) {
	      return new Error('Query values must be an array')
	    }
	    if (this.requiresPreparation()) {
	      this.prepare(connection);
	    } else {
	      connection.query(this.text);
	    }
	    return null
	  }

	  hasBeenParsed(connection) {
	    return this.name && connection.parsedStatements[this.name]
	  }

	  handlePortalSuspended(connection) {
	    this._getRows(connection, this.rows);
	  }

	  _getRows(connection, rows) {
	    connection.execute({
	      portal: this.portal,
	      rows: rows,
	    });
	    connection.flush();
	  }

	  // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
	  prepare(connection) {
	    // prepared statements need sync to be called after each command
	    // complete or when an error is encountered
	    this.isPreparedStatement = true;

	    // TODO refactor this poor encapsulation
	    if (!this.hasBeenParsed(connection)) {
	      connection.parse({
	        text: this.text,
	        name: this.name,
	        types: this.types,
	      });
	    }

	    if (this.values) {
	      try {
	        this.values = this.values.map(utils.prepareValue);
	      } catch (err) {
	        this.handleError(err, connection);
	        return
	      }
	    }

	    connection.bind({
	      portal: this.portal,
	      statement: this.name,
	      values: this.values,
	      binary: this.binary,
	    });

	    connection.describe({
	      type: 'P',
	      name: this.portal || '',
	    });

	    this._getRows(connection, this.rows);
	  }

	  handleCopyInResponse(connection) {
	    connection.sendCopyFail('No source stream defined');
	  }

	  // eslint-disable-next-line no-unused-vars
	  handleCopyData(msg, connection) {
	    // noop
	  }
	}

	var query = Query;

	var bufferWriter = createCommonjsModule(function (module, exports) {
	//binary data writer tuned for encoding binary specific to the postgres binary protocol
	Object.defineProperty(exports, "__esModule", { value: true });
	class Writer {
	    constructor(size = 256) {
	        this.size = size;
	        this.offset = 5;
	        this.headerPosition = 0;
	        this.buffer = Buffer.alloc(size);
	    }
	    ensure(size) {
	        var remaining = this.buffer.length - this.offset;
	        if (remaining < size) {
	            var oldBuffer = this.buffer;
	            // exponential growth factor of around ~ 1.5
	            // https://stackoverflow.com/questions/2269063/buffer-growth-strategy
	            var newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
	            this.buffer = Buffer.alloc(newSize);
	            oldBuffer.copy(this.buffer);
	        }
	    }
	    addInt32(num) {
	        this.ensure(4);
	        this.buffer[this.offset++] = (num >>> 24) & 0xff;
	        this.buffer[this.offset++] = (num >>> 16) & 0xff;
	        this.buffer[this.offset++] = (num >>> 8) & 0xff;
	        this.buffer[this.offset++] = (num >>> 0) & 0xff;
	        return this;
	    }
	    addInt16(num) {
	        this.ensure(2);
	        this.buffer[this.offset++] = (num >>> 8) & 0xff;
	        this.buffer[this.offset++] = (num >>> 0) & 0xff;
	        return this;
	    }
	    addCString(string) {
	        if (!string) {
	            this.ensure(1);
	        }
	        else {
	            var len = Buffer.byteLength(string);
	            this.ensure(len + 1); // +1 for null terminator
	            this.buffer.write(string, this.offset, 'utf-8');
	            this.offset += len;
	        }
	        this.buffer[this.offset++] = 0; // null terminator
	        return this;
	    }
	    addString(string = '') {
	        var len = Buffer.byteLength(string);
	        this.ensure(len);
	        this.buffer.write(string, this.offset);
	        this.offset += len;
	        return this;
	    }
	    add(otherBuffer) {
	        this.ensure(otherBuffer.length);
	        otherBuffer.copy(this.buffer, this.offset);
	        this.offset += otherBuffer.length;
	        return this;
	    }
	    join(code) {
	        if (code) {
	            this.buffer[this.headerPosition] = code;
	            //length is everything in this packet minus the code
	            const length = this.offset - (this.headerPosition + 1);
	            this.buffer.writeInt32BE(length, this.headerPosition + 1);
	        }
	        return this.buffer.slice(code ? 0 : 5, this.offset);
	    }
	    flush(code) {
	        var result = this.join(code);
	        this.offset = 5;
	        this.headerPosition = 0;
	        this.buffer = Buffer.allocUnsafe(this.size);
	        return result;
	    }
	}
	exports.Writer = Writer;

	});

	unwrapExports(bufferWriter);
	var bufferWriter_1 = bufferWriter.Writer;

	var serializer = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	const writer = new bufferWriter.Writer();
	const startup = (opts) => {
	    // protocol version
	    writer.addInt16(3).addInt16(0);
	    for (const key of Object.keys(opts)) {
	        writer.addCString(key).addCString(opts[key]);
	    }
	    writer.addCString('client_encoding').addCString('UTF8');
	    var bodyBuffer = writer.addCString('').flush();
	    // this message is sent without a code
	    var length = bodyBuffer.length + 4;
	    return new bufferWriter.Writer().addInt32(length).add(bodyBuffer).flush();
	};
	const requestSsl = () => {
	    const response = Buffer.allocUnsafe(8);
	    response.writeInt32BE(8, 0);
	    response.writeInt32BE(80877103, 4);
	    return response;
	};
	const password = (password) => {
	    return writer.addCString(password).flush(112 /* startup */);
	};
	const sendSASLInitialResponseMessage = function (mechanism, initialResponse) {
	    // 0x70 = 'p'
	    writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
	    return writer.flush(112 /* startup */);
	};
	const sendSCRAMClientFinalMessage = function (additionalData) {
	    return writer.addString(additionalData).flush(112 /* startup */);
	};
	const query = (text) => {
	    return writer.addCString(text).flush(81 /* query */);
	};
	const emptyArray = [];
	const parse = (query) => {
	    // expect something like this:
	    // { name: 'queryName',
	    //   text: 'select * from blah',
	    //   types: ['int8', 'bool'] }
	    // normalize missing query names to allow for null
	    const name = query.name || '';
	    if (name.length > 63) {
	        /* eslint-disable no-console */
	        console.error('Warning! Postgres only supports 63 characters for query names.');
	        console.error('You supplied %s (%s)', name, name.length);
	        console.error('This can cause conflicts and silent errors executing queries');
	        /* eslint-enable no-console */
	    }
	    const types = query.types || emptyArray;
	    var len = types.length;
	    var buffer = writer
	        .addCString(name) // name of query
	        .addCString(query.text) // actual query text
	        .addInt16(len);
	    for (var i = 0; i < len; i++) {
	        buffer.addInt32(types[i]);
	    }
	    return writer.flush(80 /* parse */);
	};
	const bind = (config = {}) => {
	    // normalize config
	    const portal = config.portal || '';
	    const statement = config.statement || '';
	    const binary = config.binary || false;
	    var values = config.values || emptyArray;
	    var len = values.length;
	    var useBinary = false;
	    // TODO(bmc): all the loops in here aren't nice, we can do better
	    for (var j = 0; j < len; j++) {
	        useBinary = useBinary || values[j] instanceof Buffer;
	    }
	    var buffer = writer.addCString(portal).addCString(statement);
	    if (!useBinary) {
	        buffer.addInt16(0);
	    }
	    else {
	        buffer.addInt16(len);
	        for (j = 0; j < len; j++) {
	            buffer.addInt16(values[j] instanceof Buffer ? 1 : 0);
	        }
	    }
	    buffer.addInt16(len);
	    for (var i = 0; i < len; i++) {
	        var val = values[i];
	        if (val === null || typeof val === 'undefined') {
	            buffer.addInt32(-1);
	        }
	        else if (val instanceof Buffer) {
	            buffer.addInt32(val.length);
	            buffer.add(val);
	        }
	        else {
	            buffer.addInt32(Buffer.byteLength(val));
	            buffer.addString(val);
	        }
	    }
	    if (binary) {
	        buffer.addInt16(1); // format codes to use binary
	        buffer.addInt16(1);
	    }
	    else {
	        buffer.addInt16(0); // format codes to use text
	    }
	    return writer.flush(66 /* bind */);
	};
	const emptyExecute = Buffer.from([69 /* execute */, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
	const execute = (config) => {
	    // this is the happy path for most queries
	    if (!config || (!config.portal && !config.rows)) {
	        return emptyExecute;
	    }
	    const portal = config.portal || '';
	    const rows = config.rows || 0;
	    const portalLength = Buffer.byteLength(portal);
	    const len = 4 + portalLength + 1 + 4;
	    // one extra bit for code
	    const buff = Buffer.allocUnsafe(1 + len);
	    buff[0] = 69 /* execute */;
	    buff.writeInt32BE(len, 1);
	    buff.write(portal, 5, 'utf-8');
	    buff[portalLength + 5] = 0; // null terminate portal cString
	    buff.writeUInt32BE(rows, buff.length - 4);
	    return buff;
	};
	const cancel = (processID, secretKey) => {
	    const buffer = Buffer.allocUnsafe(16);
	    buffer.writeInt32BE(16, 0);
	    buffer.writeInt16BE(1234, 4);
	    buffer.writeInt16BE(5678, 6);
	    buffer.writeInt32BE(processID, 8);
	    buffer.writeInt32BE(secretKey, 12);
	    return buffer;
	};
	const cstringMessage = (code, string) => {
	    const stringLen = Buffer.byteLength(string);
	    const len = 4 + stringLen + 1;
	    // one extra bit for code
	    const buffer = Buffer.allocUnsafe(1 + len);
	    buffer[0] = code;
	    buffer.writeInt32BE(len, 1);
	    buffer.write(string, 5, 'utf-8');
	    buffer[len] = 0; // null terminate cString
	    return buffer;
	};
	const emptyDescribePortal = writer.addCString('P').flush(68 /* describe */);
	const emptyDescribeStatement = writer.addCString('S').flush(68 /* describe */);
	const describe = (msg) => {
	    return msg.name
	        ? cstringMessage(68 /* describe */, `${msg.type}${msg.name || ''}`)
	        : msg.type === 'P'
	            ? emptyDescribePortal
	            : emptyDescribeStatement;
	};
	const close = (msg) => {
	    const text = `${msg.type}${msg.name || ''}`;
	    return cstringMessage(67 /* close */, text);
	};
	const copyData = (chunk) => {
	    return writer.add(chunk).flush(100 /* copyFromChunk */);
	};
	const copyFail = (message) => {
	    return cstringMessage(102 /* copyFail */, message);
	};
	const codeOnlyBuffer = (code) => Buffer.from([code, 0x00, 0x00, 0x00, 0x04]);
	const flushBuffer = codeOnlyBuffer(72 /* flush */);
	const syncBuffer = codeOnlyBuffer(83 /* sync */);
	const endBuffer = codeOnlyBuffer(88 /* end */);
	const copyDoneBuffer = codeOnlyBuffer(99 /* copyDone */);
	const serialize = {
	    startup,
	    password,
	    requestSsl,
	    sendSASLInitialResponseMessage,
	    sendSCRAMClientFinalMessage,
	    query,
	    parse,
	    bind,
	    execute,
	    describe,
	    close,
	    flush: () => flushBuffer,
	    sync: () => syncBuffer,
	    end: () => endBuffer,
	    copyData,
	    copyDone: () => copyDoneBuffer,
	    copyFail,
	    cancel,
	};
	exports.serialize = serialize;

	});

	unwrapExports(serializer);
	var serializer_1 = serializer.serialize;

	var messages = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseComplete = {
	    name: "parseComplete" /* parseComplete */,
	    length: 5,
	};
	exports.bindComplete = {
	    name: "bindComplete" /* bindComplete */,
	    length: 5,
	};
	exports.closeComplete = {
	    name: "closeComplete" /* closeComplete */,
	    length: 5,
	};
	exports.noData = {
	    name: "noData" /* noData */,
	    length: 5,
	};
	exports.portalSuspended = {
	    name: "portalSuspended" /* portalSuspended */,
	    length: 5,
	};
	exports.replicationStart = {
	    name: "replicationStart" /* replicationStart */,
	    length: 4,
	};
	exports.emptyQuery = {
	    name: "emptyQuery" /* emptyQuery */,
	    length: 4,
	};
	exports.copyDone = {
	    name: "copyDone" /* copyDone */,
	    length: 4,
	};
	class DatabaseError extends Error {
	    constructor(message, length, name) {
	        super(message);
	        this.length = length;
	        this.name = name;
	    }
	}
	exports.DatabaseError = DatabaseError;
	class CopyDataMessage {
	    constructor(length, chunk) {
	        this.length = length;
	        this.chunk = chunk;
	        this.name = "copyData" /* copyData */;
	    }
	}
	exports.CopyDataMessage = CopyDataMessage;
	class CopyResponse {
	    constructor(length, name, binary, columnCount) {
	        this.length = length;
	        this.name = name;
	        this.binary = binary;
	        this.columnTypes = new Array(columnCount);
	    }
	}
	exports.CopyResponse = CopyResponse;
	class Field {
	    constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
	        this.name = name;
	        this.tableID = tableID;
	        this.columnID = columnID;
	        this.dataTypeID = dataTypeID;
	        this.dataTypeSize = dataTypeSize;
	        this.dataTypeModifier = dataTypeModifier;
	        this.format = format;
	    }
	}
	exports.Field = Field;
	class RowDescriptionMessage {
	    constructor(length, fieldCount) {
	        this.length = length;
	        this.fieldCount = fieldCount;
	        this.name = "rowDescription" /* rowDescription */;
	        this.fields = new Array(this.fieldCount);
	    }
	}
	exports.RowDescriptionMessage = RowDescriptionMessage;
	class ParameterStatusMessage {
	    constructor(length, parameterName, parameterValue) {
	        this.length = length;
	        this.parameterName = parameterName;
	        this.parameterValue = parameterValue;
	        this.name = "parameterStatus" /* parameterStatus */;
	    }
	}
	exports.ParameterStatusMessage = ParameterStatusMessage;
	class AuthenticationMD5Password {
	    constructor(length, salt) {
	        this.length = length;
	        this.salt = salt;
	        this.name = "authenticationMD5Password" /* authenticationMD5Password */;
	    }
	}
	exports.AuthenticationMD5Password = AuthenticationMD5Password;
	class BackendKeyDataMessage {
	    constructor(length, processID, secretKey) {
	        this.length = length;
	        this.processID = processID;
	        this.secretKey = secretKey;
	        this.name = "backendKeyData" /* backendKeyData */;
	    }
	}
	exports.BackendKeyDataMessage = BackendKeyDataMessage;
	class NotificationResponseMessage {
	    constructor(length, processId, channel, payload) {
	        this.length = length;
	        this.processId = processId;
	        this.channel = channel;
	        this.payload = payload;
	        this.name = "notification" /* notification */;
	    }
	}
	exports.NotificationResponseMessage = NotificationResponseMessage;
	class ReadyForQueryMessage {
	    constructor(length, status) {
	        this.length = length;
	        this.status = status;
	        this.name = "readyForQuery" /* readyForQuery */;
	    }
	}
	exports.ReadyForQueryMessage = ReadyForQueryMessage;
	class CommandCompleteMessage {
	    constructor(length, text) {
	        this.length = length;
	        this.text = text;
	        this.name = "commandComplete" /* commandComplete */;
	    }
	}
	exports.CommandCompleteMessage = CommandCompleteMessage;
	class DataRowMessage {
	    constructor(length, fields) {
	        this.length = length;
	        this.fields = fields;
	        this.name = "dataRow" /* dataRow */;
	        this.fieldCount = fields.length;
	    }
	}
	exports.DataRowMessage = DataRowMessage;
	class NoticeMessage {
	    constructor(length, message) {
	        this.length = length;
	        this.message = message;
	        this.name = "notice" /* notice */;
	    }
	}
	exports.NoticeMessage = NoticeMessage;

	});

	unwrapExports(messages);
	var messages_1 = messages.parseComplete;
	var messages_2 = messages.bindComplete;
	var messages_3 = messages.closeComplete;
	var messages_4 = messages.noData;
	var messages_5 = messages.portalSuspended;
	var messages_6 = messages.replicationStart;
	var messages_7 = messages.emptyQuery;
	var messages_8 = messages.copyDone;
	var messages_9 = messages.DatabaseError;
	var messages_10 = messages.CopyDataMessage;
	var messages_11 = messages.CopyResponse;
	var messages_12 = messages.Field;
	var messages_13 = messages.RowDescriptionMessage;
	var messages_14 = messages.ParameterStatusMessage;
	var messages_15 = messages.AuthenticationMD5Password;
	var messages_16 = messages.BackendKeyDataMessage;
	var messages_17 = messages.NotificationResponseMessage;
	var messages_18 = messages.ReadyForQueryMessage;
	var messages_19 = messages.CommandCompleteMessage;
	var messages_20 = messages.DataRowMessage;
	var messages_21 = messages.NoticeMessage;

	var bufferReader = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const emptyBuffer = Buffer.allocUnsafe(0);
	class BufferReader {
	    constructor(offset = 0) {
	        this.offset = offset;
	        this.buffer = emptyBuffer;
	        // TODO(bmc): support non-utf8 encoding?
	        this.encoding = 'utf-8';
	    }
	    setBuffer(offset, buffer) {
	        this.offset = offset;
	        this.buffer = buffer;
	    }
	    int16() {
	        const result = this.buffer.readInt16BE(this.offset);
	        this.offset += 2;
	        return result;
	    }
	    byte() {
	        const result = this.buffer[this.offset];
	        this.offset++;
	        return result;
	    }
	    int32() {
	        const result = this.buffer.readInt32BE(this.offset);
	        this.offset += 4;
	        return result;
	    }
	    string(length) {
	        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
	        this.offset += length;
	        return result;
	    }
	    cstring() {
	        const start = this.offset;
	        let end = start;
	        while (this.buffer[end++] !== 0) { }
	        this.offset = end;
	        return this.buffer.toString(this.encoding, start, end - 1);
	    }
	    bytes(length) {
	        const result = this.buffer.slice(this.offset, this.offset + length);
	        this.offset += length;
	        return result;
	    }
	}
	exports.BufferReader = BufferReader;

	});

	unwrapExports(bufferReader);
	var bufferReader_1 = bufferReader.BufferReader;

	var parser = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });


	const assert_1 = __importDefault(assert);
	// every message is prefixed with a single bye
	const CODE_LENGTH = 1;
	// every message has an int32 length which includes itself but does
	// NOT include the code in the length
	const LEN_LENGTH = 4;
	const HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
	const emptyBuffer = Buffer.allocUnsafe(0);
	class Parser {
	    constructor(opts) {
	        var _a, _b;
	        this.buffer = emptyBuffer;
	        this.bufferLength = 0;
	        this.bufferOffset = 0;
	        this.reader = new bufferReader.BufferReader();
	        if (((_a = opts) === null || _a === void 0 ? void 0 : _a.mode) === 'binary') {
	            throw new Error('Binary mode not supported yet');
	        }
	        this.mode = ((_b = opts) === null || _b === void 0 ? void 0 : _b.mode) || 'text';
	    }
	    parse(buffer, callback) {
	        this.mergeBuffer(buffer);
	        const bufferFullLength = this.bufferOffset + this.bufferLength;
	        let offset = this.bufferOffset;
	        while (offset + HEADER_LENGTH <= bufferFullLength) {
	            // code is 1 byte long - it identifies the message type
	            const code = this.buffer[offset];
	            // length is 1 Uint32BE - it is the length of the message EXCLUDING the code
	            const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
	            const fullMessageLength = CODE_LENGTH + length;
	            if (fullMessageLength + offset <= bufferFullLength) {
	                const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
	                callback(message);
	                offset += fullMessageLength;
	            }
	            else {
	                break;
	            }
	        }
	        if (offset === bufferFullLength) {
	            // No more use for the buffer
	            this.buffer = emptyBuffer;
	            this.bufferLength = 0;
	            this.bufferOffset = 0;
	        }
	        else {
	            // Adjust the cursors of remainingBuffer
	            this.bufferLength = bufferFullLength - offset;
	            this.bufferOffset = offset;
	        }
	    }
	    mergeBuffer(buffer) {
	        if (this.bufferLength > 0) {
	            const newLength = this.bufferLength + buffer.byteLength;
	            const newFullLength = newLength + this.bufferOffset;
	            if (newFullLength > this.buffer.byteLength) {
	                // We can't concat the new buffer with the remaining one
	                let newBuffer;
	                if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
	                    // We can move the relevant part to the beginning of the buffer instead of allocating a new buffer
	                    newBuffer = this.buffer;
	                }
	                else {
	                    // Allocate a new larger buffer
	                    let newBufferLength = this.buffer.byteLength * 2;
	                    while (newLength >= newBufferLength) {
	                        newBufferLength *= 2;
	                    }
	                    newBuffer = Buffer.allocUnsafe(newBufferLength);
	                }
	                // Move the remaining buffer to the new one
	                this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
	                this.buffer = newBuffer;
	                this.bufferOffset = 0;
	            }
	            // Concat the new buffer with the remaining one
	            buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
	            this.bufferLength = newLength;
	        }
	        else {
	            this.buffer = buffer;
	            this.bufferOffset = 0;
	            this.bufferLength = buffer.byteLength;
	        }
	    }
	    handlePacket(offset, code, length, bytes) {
	        switch (code) {
	            case 50 /* BindComplete */:
	                return messages.bindComplete;
	            case 49 /* ParseComplete */:
	                return messages.parseComplete;
	            case 51 /* CloseComplete */:
	                return messages.closeComplete;
	            case 110 /* NoData */:
	                return messages.noData;
	            case 115 /* PortalSuspended */:
	                return messages.portalSuspended;
	            case 99 /* CopyDone */:
	                return messages.copyDone;
	            case 87 /* ReplicationStart */:
	                return messages.replicationStart;
	            case 73 /* EmptyQuery */:
	                return messages.emptyQuery;
	            case 68 /* DataRow */:
	                return this.parseDataRowMessage(offset, length, bytes);
	            case 67 /* CommandComplete */:
	                return this.parseCommandCompleteMessage(offset, length, bytes);
	            case 90 /* ReadyForQuery */:
	                return this.parseReadyForQueryMessage(offset, length, bytes);
	            case 65 /* NotificationResponse */:
	                return this.parseNotificationMessage(offset, length, bytes);
	            case 82 /* AuthenticationResponse */:
	                return this.parseAuthenticationResponse(offset, length, bytes);
	            case 83 /* ParameterStatus */:
	                return this.parseParameterStatusMessage(offset, length, bytes);
	            case 75 /* BackendKeyData */:
	                return this.parseBackendKeyData(offset, length, bytes);
	            case 69 /* ErrorMessage */:
	                return this.parseErrorMessage(offset, length, bytes, "error" /* error */);
	            case 78 /* NoticeMessage */:
	                return this.parseErrorMessage(offset, length, bytes, "notice" /* notice */);
	            case 84 /* RowDescriptionMessage */:
	                return this.parseRowDescriptionMessage(offset, length, bytes);
	            case 71 /* CopyIn */:
	                return this.parseCopyInMessage(offset, length, bytes);
	            case 72 /* CopyOut */:
	                return this.parseCopyOutMessage(offset, length, bytes);
	            case 100 /* CopyData */:
	                return this.parseCopyData(offset, length, bytes);
	            default:
	                assert_1.default.fail(`unknown message code: ${code.toString(16)}`);
	        }
	    }
	    parseReadyForQueryMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const status = this.reader.string(1);
	        return new messages.ReadyForQueryMessage(length, status);
	    }
	    parseCommandCompleteMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const text = this.reader.cstring();
	        return new messages.CommandCompleteMessage(length, text);
	    }
	    parseCopyData(offset, length, bytes) {
	        const chunk = bytes.slice(offset, offset + (length - 4));
	        return new messages.CopyDataMessage(length, chunk);
	    }
	    parseCopyInMessage(offset, length, bytes) {
	        return this.parseCopyMessage(offset, length, bytes, "copyInResponse" /* copyInResponse */);
	    }
	    parseCopyOutMessage(offset, length, bytes) {
	        return this.parseCopyMessage(offset, length, bytes, "copyOutResponse" /* copyOutResponse */);
	    }
	    parseCopyMessage(offset, length, bytes, messageName) {
	        this.reader.setBuffer(offset, bytes);
	        const isBinary = this.reader.byte() !== 0;
	        const columnCount = this.reader.int16();
	        const message = new messages.CopyResponse(length, messageName, isBinary, columnCount);
	        for (let i = 0; i < columnCount; i++) {
	            message.columnTypes[i] = this.reader.int16();
	        }
	        return message;
	    }
	    parseNotificationMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const processId = this.reader.int32();
	        const channel = this.reader.cstring();
	        const payload = this.reader.cstring();
	        return new messages.NotificationResponseMessage(length, processId, channel, payload);
	    }
	    parseRowDescriptionMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const fieldCount = this.reader.int16();
	        const message = new messages.RowDescriptionMessage(length, fieldCount);
	        for (let i = 0; i < fieldCount; i++) {
	            message.fields[i] = this.parseField();
	        }
	        return message;
	    }
	    parseField() {
	        const name = this.reader.cstring();
	        const tableID = this.reader.int32();
	        const columnID = this.reader.int16();
	        const dataTypeID = this.reader.int32();
	        const dataTypeSize = this.reader.int16();
	        const dataTypeModifier = this.reader.int32();
	        const mode = this.reader.int16() === 0 ? 'text' : 'binary';
	        return new messages.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
	    }
	    parseDataRowMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const fieldCount = this.reader.int16();
	        const fields = new Array(fieldCount);
	        for (let i = 0; i < fieldCount; i++) {
	            const len = this.reader.int32();
	            // a -1 for length means the value of the field is null
	            fields[i] = len === -1 ? null : this.reader.string(len);
	        }
	        return new messages.DataRowMessage(length, fields);
	    }
	    parseParameterStatusMessage(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const name = this.reader.cstring();
	        const value = this.reader.cstring();
	        return new messages.ParameterStatusMessage(length, name, value);
	    }
	    parseBackendKeyData(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const processID = this.reader.int32();
	        const secretKey = this.reader.int32();
	        return new messages.BackendKeyDataMessage(length, processID, secretKey);
	    }
	    parseAuthenticationResponse(offset, length, bytes) {
	        this.reader.setBuffer(offset, bytes);
	        const code = this.reader.int32();
	        // TODO(bmc): maybe better types here
	        const message = {
	            name: "authenticationOk" /* authenticationOk */,
	            length,
	        };
	        switch (code) {
	            case 0: // AuthenticationOk
	                break;
	            case 3: // AuthenticationCleartextPassword
	                if (message.length === 8) {
	                    message.name = "authenticationCleartextPassword" /* authenticationCleartextPassword */;
	                }
	                break;
	            case 5: // AuthenticationMD5Password
	                if (message.length === 12) {
	                    message.name = "authenticationMD5Password" /* authenticationMD5Password */;
	                    const salt = this.reader.bytes(4);
	                    return new messages.AuthenticationMD5Password(length, salt);
	                }
	                break;
	            case 10: // AuthenticationSASL
	                message.name = "authenticationSASL" /* authenticationSASL */;
	                message.mechanisms = [];
	                let mechanism;
	                do {
	                    mechanism = this.reader.cstring();
	                    if (mechanism) {
	                        message.mechanisms.push(mechanism);
	                    }
	                } while (mechanism);
	                break;
	            case 11: // AuthenticationSASLContinue
	                message.name = "authenticationSASLContinue" /* authenticationSASLContinue */;
	                message.data = this.reader.string(length - 8);
	                break;
	            case 12: // AuthenticationSASLFinal
	                message.name = "authenticationSASLFinal" /* authenticationSASLFinal */;
	                message.data = this.reader.string(length - 8);
	                break;
	            default:
	                throw new Error('Unknown authenticationOk message type ' + code);
	        }
	        return message;
	    }
	    parseErrorMessage(offset, length, bytes, name) {
	        this.reader.setBuffer(offset, bytes);
	        const fields = {};
	        let fieldType = this.reader.string(1);
	        while (fieldType !== '\0') {
	            fields[fieldType] = this.reader.cstring();
	            fieldType = this.reader.string(1);
	        }
	        const messageValue = fields.M;
	        const message = name === "notice" /* notice */
	            ? new messages.NoticeMessage(length, messageValue)
	            : new messages.DatabaseError(messageValue, length, name);
	        message.severity = fields.S;
	        message.code = fields.C;
	        message.detail = fields.D;
	        message.hint = fields.H;
	        message.position = fields.P;
	        message.internalPosition = fields.p;
	        message.internalQuery = fields.q;
	        message.where = fields.W;
	        message.schema = fields.s;
	        message.table = fields.t;
	        message.column = fields.c;
	        message.dataType = fields.d;
	        message.constraint = fields.n;
	        message.file = fields.F;
	        message.line = fields.L;
	        message.routine = fields.R;
	        return message;
	    }
	}
	exports.Parser = Parser;

	});

	unwrapExports(parser);
	var parser_1 = parser.Parser;

	var dist = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.serialize = serializer.serialize;

	function parse(stream, callback) {
	    const parser$1 = new parser.Parser();
	    stream.on('data', (buffer) => parser$1.parse(buffer, callback));
	    return new Promise((resolve) => stream.on('end', () => resolve()));
	}
	exports.parse = parse;

	});

	unwrapExports(dist);
	var dist_1 = dist.serialize;
	var dist_2 = dist.parse;

	var EventEmitter$1 = events.EventEmitter;


	const { parse: parse$4, serialize } = dist;

	const flushBuffer = serialize.flush();
	const syncBuffer = serialize.sync();
	const endBuffer = serialize.end();

	// TODO(bmc) support binary mode at some point
	class Connection extends EventEmitter$1 {
	  constructor(config) {
	    super();
	    config = config || {};
	    this.stream = config.stream || new net.Socket();
	    this._keepAlive = config.keepAlive;
	    this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
	    this.lastBuffer = false;
	    this.parsedStatements = {};
	    this.ssl = config.ssl || false;
	    this._ending = false;
	    this._emitMessage = false;
	    var self = this;
	    this.on('newListener', function (eventName) {
	      if (eventName === 'message') {
	        self._emitMessage = true;
	      }
	    });
	  }

	  connect(port, host) {
	    var self = this;

	    this._connecting = true;
	    this.stream.setNoDelay(true);
	    this.stream.connect(port, host);

	    this.stream.once('connect', function () {
	      if (self._keepAlive) {
	        self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
	      }
	      self.emit('connect');
	    });

	    const reportStreamError = function (error) {
	      // errors about disconnections should be ignored during disconnect
	      if (self._ending && (error.code === 'ECONNRESET' || error.code === 'EPIPE')) {
	        return
	      }
	      self.emit('error', error);
	    };
	    this.stream.on('error', reportStreamError);

	    this.stream.on('close', function () {
	      self.emit('end');
	    });

	    if (!this.ssl) {
	      return this.attachListeners(this.stream)
	    }

	    this.stream.once('data', function (buffer) {
	      var responseCode = buffer.toString('utf8');
	      switch (responseCode) {
	        case 'S': // Server supports SSL connections, continue with a secure connection
	          break
	        case 'N': // Server does not support SSL connections
	          self.stream.end();
	          return self.emit('error', new Error('The server does not support SSL connections'))
	        default:
	          // Any other response byte, including 'E' (ErrorResponse) indicating a server error
	          self.stream.end();
	          return self.emit('error', new Error('There was an error establishing an SSL connection'))
	      }
	      var tls$1 = tls;
	      const options = Object.assign(
	        {
	          socket: self.stream,
	        },
	        self.ssl
	      );
	      if (net.isIP(host) === 0) {
	        options.servername = host;
	      }
	      try {
	        self.stream = tls$1.connect(options);
	      } catch (err) {
	        return self.emit('error', err)
	      }
	      self.attachListeners(self.stream);
	      self.stream.on('error', reportStreamError);

	      self.emit('sslconnect');
	    });
	  }

	  attachListeners(stream) {
	    stream.on('end', () => {
	      this.emit('end');
	    });
	    parse$4(stream, (msg) => {
	      var eventName = msg.name === 'error' ? 'errorMessage' : msg.name;
	      if (this._emitMessage) {
	        this.emit('message', msg);
	      }
	      this.emit(eventName, msg);
	    });
	  }

	  requestSsl() {
	    this.stream.write(serialize.requestSsl());
	  }

	  startup(config) {
	    this.stream.write(serialize.startup(config));
	  }

	  cancel(processID, secretKey) {
	    this._send(serialize.cancel(processID, secretKey));
	  }

	  password(password) {
	    this._send(serialize.password(password));
	  }

	  sendSASLInitialResponseMessage(mechanism, initialResponse) {
	    this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
	  }

	  sendSCRAMClientFinalMessage(additionalData) {
	    this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
	  }

	  _send(buffer) {
	    if (!this.stream.writable) {
	      return false
	    }
	    return this.stream.write(buffer)
	  }

	  query(text) {
	    this._send(serialize.query(text));
	  }

	  // send parse message
	  parse(query) {
	    this._send(serialize.parse(query));
	  }

	  // send bind message
	  bind(config) {
	    this._send(serialize.bind(config));
	  }

	  // send execute message
	  execute(config) {
	    this._send(serialize.execute(config));
	  }

	  flush() {
	    if (this.stream.writable) {
	      this.stream.write(flushBuffer);
	    }
	  }

	  sync() {
	    this._ending = true;
	    this._send(flushBuffer);
	    this._send(syncBuffer);
	  }

	  end() {
	    // 0x58 = 'X'
	    this._ending = true;
	    if (!this._connecting || !this.stream.writable) {
	      this.stream.end();
	      return
	    }
	    return this.stream.write(endBuffer, () => {
	      this.stream.end();
	    })
	  }

	  close(msg) {
	    this._send(serialize.close(msg));
	  }

	  describe(msg) {
	    this._send(serialize.describe(msg));
	  }

	  sendCopyFromChunk(chunk) {
	    this._send(serialize.copyData(chunk));
	  }

	  endCopyFrom() {
	    this._send(serialize.copyDone());
	  }

	  sendCopyFail(msg) {
	    this._send(serialize.copyFail(msg));
	  }
	}

	var connection = Connection;

	var EventEmitter$2 = events.EventEmitter;











	class Client extends EventEmitter$2 {
	  constructor(config) {
	    super();

	    this.connectionParameters = new connectionParameters(config);
	    this.user = this.connectionParameters.user;
	    this.database = this.connectionParameters.database;
	    this.port = this.connectionParameters.port;
	    this.host = this.connectionParameters.host;

	    // "hiding" the password so it doesn't show up in stack traces
	    // or if the client is console.logged
	    Object.defineProperty(this, 'password', {
	      configurable: true,
	      enumerable: false,
	      writable: true,
	      value: this.connectionParameters.password,
	    });

	    this.replication = this.connectionParameters.replication;

	    var c = config || {};

	    this._Promise = c.Promise || commonjsGlobal.Promise;
	    this._types = new typeOverrides(c.types);
	    this._ending = false;
	    this._connecting = false;
	    this._connected = false;
	    this._connectionError = false;
	    this._queryable = true;

	    this.connection =
	      c.connection ||
	      new connection({
	        stream: c.stream,
	        ssl: this.connectionParameters.ssl,
	        keepAlive: c.keepAlive || false,
	        keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
	        encoding: this.connectionParameters.client_encoding || 'utf8',
	      });
	    this.queryQueue = [];
	    this.binary = c.binary || defaults.binary;
	    this.processID = null;
	    this.secretKey = null;
	    this.ssl = this.connectionParameters.ssl || false;
	    this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
	  }

	  _errorAllQueries(err) {
	    const enqueueError = (query) => {
	      process.nextTick(() => {
	        query.handleError(err, this.connection);
	      });
	    };

	    if (this.activeQuery) {
	      enqueueError(this.activeQuery);
	      this.activeQuery = null;
	    }

	    this.queryQueue.forEach(enqueueError);
	    this.queryQueue.length = 0;
	  }

	  _connect(callback) {
	    var self = this;
	    var con = this.connection;
	    this._connectionCallback = callback;

	    if (this._connecting || this._connected) {
	      const err = new Error('Client has already been connected. You cannot reuse a client.');
	      process.nextTick(() => {
	        callback(err);
	      });
	      return
	    }
	    this._connecting = true;

	    this.connectionTimeoutHandle;
	    if (this._connectionTimeoutMillis > 0) {
	      this.connectionTimeoutHandle = setTimeout(() => {
	        con._ending = true;
	        con.stream.destroy(new Error('timeout expired'));
	      }, this._connectionTimeoutMillis);
	    }

	    if (this.host && this.host.indexOf('/') === 0) {
	      con.connect(this.host + '/.s.PGSQL.' + this.port);
	    } else {
	      con.connect(this.port, this.host);
	    }

	    // once connection is established send startup message
	    con.on('connect', function () {
	      if (self.ssl) {
	        con.requestSsl();
	      } else {
	        con.startup(self.getStartupConf());
	      }
	    });

	    con.on('sslconnect', function () {
	      con.startup(self.getStartupConf());
	    });

	    this._attachListeners(con);

	    con.once('end', () => {
	      const error = this._ending ? new Error('Connection terminated') : new Error('Connection terminated unexpectedly');

	      clearTimeout(this.connectionTimeoutHandle);
	      this._errorAllQueries(error);

	      if (!this._ending) {
	        // if the connection is ended without us calling .end()
	        // on this client then we have an unexpected disconnection
	        // treat this as an error unless we've already emitted an error
	        // during connection.
	        if (this._connecting && !this._connectionError) {
	          if (this._connectionCallback) {
	            this._connectionCallback(error);
	          } else {
	            this._handleErrorEvent(error);
	          }
	        } else if (!this._connectionError) {
	          this._handleErrorEvent(error);
	        }
	      }

	      process.nextTick(() => {
	        this.emit('end');
	      });
	    });
	  }

	  connect(callback) {
	    if (callback) {
	      this._connect(callback);
	      return
	    }

	    return new this._Promise((resolve, reject) => {
	      this._connect((error) => {
	        if (error) {
	          reject(error);
	        } else {
	          resolve();
	        }
	      });
	    })
	  }

	  _attachListeners(con) {
	    // password request handling
	    con.on('authenticationCleartextPassword', this._handleAuthCleartextPassword.bind(this));
	    // password request handling
	    con.on('authenticationMD5Password', this._handleAuthMD5Password.bind(this));
	    // password request handling (SASL)
	    con.on('authenticationSASL', this._handleAuthSASL.bind(this));
	    con.on('authenticationSASLContinue', this._handleAuthSASLContinue.bind(this));
	    con.on('authenticationSASLFinal', this._handleAuthSASLFinal.bind(this));
	    con.on('backendKeyData', this._handleBackendKeyData.bind(this));
	    con.on('error', this._handleErrorEvent.bind(this));
	    con.on('errorMessage', this._handleErrorMessage.bind(this));
	    con.on('readyForQuery', this._handleReadyForQuery.bind(this));
	    con.on('notice', this._handleNotice.bind(this));
	    con.on('rowDescription', this._handleRowDescription.bind(this));
	    con.on('dataRow', this._handleDataRow.bind(this));
	    con.on('portalSuspended', this._handlePortalSuspended.bind(this));
	    con.on('emptyQuery', this._handleEmptyQuery.bind(this));
	    con.on('commandComplete', this._handleCommandComplete.bind(this));
	    con.on('parseComplete', this._handleParseComplete.bind(this));
	    con.on('copyInResponse', this._handleCopyInResponse.bind(this));
	    con.on('copyData', this._handleCopyData.bind(this));
	    con.on('notification', this._handleNotification.bind(this));
	  }

	  // TODO(bmc): deprecate pgpass "built in" integration since this.password can be a function
	  // it can be supplied by the user if required - this is a breaking change!
	  _checkPgPass(cb) {
	    const con = this.connection;
	    if (typeof this.password === 'function') {
	      this._Promise
	        .resolve()
	        .then(() => this.password())
	        .then((pass) => {
	          if (pass !== undefined) {
	            if (typeof pass !== 'string') {
	              con.emit('error', new TypeError('Password must be a string'));
	              return
	            }
	            this.connectionParameters.password = this.password = pass;
	          } else {
	            this.connectionParameters.password = this.password = null;
	          }
	          cb();
	        })
	        .catch((err) => {
	          con.emit('error', err);
	        });
	    } else if (this.password !== null) {
	      cb();
	    } else {
	      lib(this.connectionParameters, function (pass) {
	        if (undefined !== pass) {
	          this.connectionParameters.password = this.password = pass;
	        }
	        cb();
	      });
	    }
	  }

	  _handleAuthCleartextPassword(msg) {
	    this._checkPgPass(() => {
	      this.connection.password(this.password);
	    });
	  }

	  _handleAuthMD5Password(msg) {
	    this._checkPgPass(() => {
	      const hashedPassword = utils.postgresMd5PasswordHash(this.user, this.password, msg.salt);
	      this.connection.password(hashedPassword);
	    });
	  }

	  _handleAuthSASL(msg) {
	    this._checkPgPass(() => {
	      this.saslSession = sasl.startSession(msg.mechanisms);
	      this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
	    });
	  }

	  _handleAuthSASLContinue(msg) {
	    sasl.continueSession(this.saslSession, this.password, msg.data);
	    this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
	  }

	  _handleAuthSASLFinal(msg) {
	    sasl.finalizeSession(this.saslSession, msg.data);
	    this.saslSession = null;
	  }

	  _handleBackendKeyData(msg) {
	    this.processID = msg.processID;
	    this.secretKey = msg.secretKey;
	  }

	  _handleReadyForQuery(msg) {
	    if (this._connecting) {
	      this._connecting = false;
	      this._connected = true;
	      clearTimeout(this.connectionTimeoutHandle);

	      // process possible callback argument to Client#connect
	      if (this._connectionCallback) {
	        this._connectionCallback(null, this);
	        // remove callback for proper error handling
	        // after the connect event
	        this._connectionCallback = null;
	      }
	      this.emit('connect');
	    }
	    const { activeQuery } = this;
	    this.activeQuery = null;
	    this.readyForQuery = true;
	    if (activeQuery) {
	      activeQuery.handleReadyForQuery(this.connection);
	    }
	    this._pulseQueryQueue();
	  }

	  // if we receieve an error event or error message
	  // during the connection process we handle it here
	  _handleErrorWhileConnecting(err) {
	    if (this._connectionError) {
	      // TODO(bmc): this is swallowing errors - we shouldn't do this
	      return
	    }
	    this._connectionError = true;
	    clearTimeout(this.connectionTimeoutHandle);
	    if (this._connectionCallback) {
	      return this._connectionCallback(err)
	    }
	    this.emit('error', err);
	  }

	  // if we're connected and we receive an error event from the connection
	  // this means the socket is dead - do a hard abort of all queries and emit
	  // the socket error on the client as well
	  _handleErrorEvent(err) {
	    if (this._connecting) {
	      return this._handleErrorWhileConnecting(err)
	    }
	    this._queryable = false;
	    this._errorAllQueries(err);
	    this.emit('error', err);
	  }

	  // handle error messages from the postgres backend
	  _handleErrorMessage(msg) {
	    if (this._connecting) {
	      return this._handleErrorWhileConnecting(msg)
	    }
	    const activeQuery = this.activeQuery;

	    if (!activeQuery) {
	      this._handleErrorEvent(msg);
	      return
	    }

	    this.activeQuery = null;
	    activeQuery.handleError(msg, this.connection);
	  }

	  _handleRowDescription(msg) {
	    // delegate rowDescription to active query
	    this.activeQuery.handleRowDescription(msg);
	  }

	  _handleDataRow(msg) {
	    // delegate dataRow to active query
	    this.activeQuery.handleDataRow(msg);
	  }

	  _handlePortalSuspended(msg) {
	    // delegate portalSuspended to active query
	    this.activeQuery.handlePortalSuspended(this.connection);
	  }

	  _handleEmptyQuery(msg) {
	    // delegate emptyQuery to active query
	    this.activeQuery.handleEmptyQuery(this.connection);
	  }

	  _handleCommandComplete(msg) {
	    // delegate commandComplete to active query
	    this.activeQuery.handleCommandComplete(msg, this.connection);
	  }

	  _handleParseComplete(msg) {
	    // if a prepared statement has a name and properly parses
	    // we track that its already been executed so we don't parse
	    // it again on the same client
	    if (this.activeQuery.name) {
	      this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text;
	    }
	  }

	  _handleCopyInResponse(msg) {
	    this.activeQuery.handleCopyInResponse(this.connection);
	  }

	  _handleCopyData(msg) {
	    this.activeQuery.handleCopyData(msg, this.connection);
	  }

	  _handleNotification(msg) {
	    this.emit('notification', msg);
	  }

	  _handleNotice(msg) {
	    this.emit('notice', msg);
	  }

	  getStartupConf() {
	    var params = this.connectionParameters;

	    var data = {
	      user: params.user,
	      database: params.database,
	    };

	    var appName = params.application_name || params.fallback_application_name;
	    if (appName) {
	      data.application_name = appName;
	    }
	    if (params.replication) {
	      data.replication = '' + params.replication;
	    }
	    if (params.statement_timeout) {
	      data.statement_timeout = String(parseInt(params.statement_timeout, 10));
	    }
	    if (params.idle_in_transaction_session_timeout) {
	      data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
	    }
	    if (params.options) {
	      data.options = params.options;
	    }

	    return data
	  }

	  cancel(client, query) {
	    if (client.activeQuery === query) {
	      var con = this.connection;

	      if (this.host && this.host.indexOf('/') === 0) {
	        con.connect(this.host + '/.s.PGSQL.' + this.port);
	      } else {
	        con.connect(this.port, this.host);
	      }

	      // once connection is established send cancel message
	      con.on('connect', function () {
	        con.cancel(client.processID, client.secretKey);
	      });
	    } else if (client.queryQueue.indexOf(query) !== -1) {
	      client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
	    }
	  }

	  setTypeParser(oid, format, parseFn) {
	    return this._types.setTypeParser(oid, format, parseFn)
	  }

	  getTypeParser(oid, format) {
	    return this._types.getTypeParser(oid, format)
	  }

	  // Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
	  escapeIdentifier(str) {
	    return '"' + str.replace(/"/g, '""') + '"'
	  }

	  // Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
	  escapeLiteral(str) {
	    var hasBackslash = false;
	    var escaped = "'";

	    for (var i = 0; i < str.length; i++) {
	      var c = str[i];
	      if (c === "'") {
	        escaped += c + c;
	      } else if (c === '\\') {
	        escaped += c + c;
	        hasBackslash = true;
	      } else {
	        escaped += c;
	      }
	    }

	    escaped += "'";

	    if (hasBackslash === true) {
	      escaped = ' E' + escaped;
	    }

	    return escaped
	  }

	  _pulseQueryQueue() {
	    if (this.readyForQuery === true) {
	      this.activeQuery = this.queryQueue.shift();
	      if (this.activeQuery) {
	        this.readyForQuery = false;
	        this.hasExecuted = true;

	        const queryError = this.activeQuery.submit(this.connection);
	        if (queryError) {
	          process.nextTick(() => {
	            this.activeQuery.handleError(queryError, this.connection);
	            this.readyForQuery = true;
	            this._pulseQueryQueue();
	          });
	        }
	      } else if (this.hasExecuted) {
	        this.activeQuery = null;
	        this.emit('drain');
	      }
	    }
	  }

	  query(config, values, callback) {
	    // can take in strings, config object or query object
	    var query$1;
	    var result;
	    var readTimeout;
	    var readTimeoutTimer;
	    var queryCallback;

	    if (config === null || config === undefined) {
	      throw new TypeError('Client was passed a null or undefined query')
	    } else if (typeof config.submit === 'function') {
	      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	      result = query$1 = config;
	      if (typeof values === 'function') {
	        query$1.callback = query$1.callback || values;
	      }
	    } else {
	      readTimeout = this.connectionParameters.query_timeout;
	      query$1 = new query(config, values, callback);
	      if (!query$1.callback) {
	        result = new this._Promise((resolve, reject) => {
	          query$1.callback = (err, res) => (err ? reject(err) : resolve(res));
	        });
	      }
	    }

	    if (readTimeout) {
	      queryCallback = query$1.callback;

	      readTimeoutTimer = setTimeout(() => {
	        var error = new Error('Query read timeout');

	        process.nextTick(() => {
	          query$1.handleError(error, this.connection);
	        });

	        queryCallback(error);

	        // we already returned an error,
	        // just do nothing if query completes
	        query$1.callback = () => {};

	        // Remove from queue
	        var index = this.queryQueue.indexOf(query$1);
	        if (index > -1) {
	          this.queryQueue.splice(index, 1);
	        }

	        this._pulseQueryQueue();
	      }, readTimeout);

	      query$1.callback = (err, res) => {
	        clearTimeout(readTimeoutTimer);
	        queryCallback(err, res);
	      };
	    }

	    if (this.binary && !query$1.binary) {
	      query$1.binary = true;
	    }

	    if (query$1._result && !query$1._result._types) {
	      query$1._result._types = this._types;
	    }

	    if (!this._queryable) {
	      process.nextTick(() => {
	        query$1.handleError(new Error('Client has encountered a connection error and is not queryable'), this.connection);
	      });
	      return result
	    }

	    if (this._ending) {
	      process.nextTick(() => {
	        query$1.handleError(new Error('Client was closed and is not queryable'), this.connection);
	      });
	      return result
	    }

	    this.queryQueue.push(query$1);
	    this._pulseQueryQueue();
	    return result
	  }

	  end(cb) {
	    this._ending = true;

	    // if we have never connected, then end is a noop, callback immediately
	    if (!this.connection._connecting) {
	      if (cb) {
	        cb();
	      } else {
	        return this._Promise.resolve()
	      }
	    }

	    if (this.activeQuery || !this._queryable) {
	      // if we have an active query we need to force a disconnect
	      // on the socket - otherwise a hung query could block end forever
	      this.connection.stream.destroy();
	    } else {
	      this.connection.end();
	    }

	    if (cb) {
	      this.connection.once('end', cb);
	    } else {
	      return new this._Promise((resolve) => {
	        this.connection.once('end', resolve);
	      })
	    }
	  }
	}

	// expose a Query constructor
	Client.Query = query;

	var client = Client;

	const EventEmitter$3 = events.EventEmitter;

	const NOOP = function () {};

	const removeWhere = (list, predicate) => {
	  const i = list.findIndex(predicate);

	  return i === -1 ? undefined : list.splice(i, 1)[0]
	};

	class IdleItem {
	  constructor(client, idleListener, timeoutId) {
	    this.client = client;
	    this.idleListener = idleListener;
	    this.timeoutId = timeoutId;
	  }
	}

	class PendingItem {
	  constructor(callback) {
	    this.callback = callback;
	  }
	}

	function throwOnDoubleRelease() {
	  throw new Error('Release called on client which has already been released to the pool.')
	}

	function promisify(Promise, callback) {
	  if (callback) {
	    return { callback: callback, result: undefined }
	  }
	  let rej;
	  let res;
	  const cb = function (err, client) {
	    err ? rej(err) : res(client);
	  };
	  const result = new Promise(function (resolve, reject) {
	    res = resolve;
	    rej = reject;
	  });
	  return { callback: cb, result: result }
	}

	function makeIdleListener(pool, client) {
	  return function idleListener(err) {
	    err.client = client;

	    client.removeListener('error', idleListener);
	    client.on('error', () => {
	      pool.log('additional client error after disconnection due to error', err);
	    });
	    pool._remove(client);
	    // TODO - document that once the pool emits an error
	    // the client has already been closed & purged and is unusable
	    pool.emit('error', err, client);
	  }
	}

	class Pool extends EventEmitter$3 {
	  constructor(options, Client) {
	    super();
	    this.options = Object.assign({}, options);

	    if (options != null && 'password' in options) {
	      // "hiding" the password so it doesn't show up in stack traces
	      // or if the client is console.logged
	      Object.defineProperty(this.options, 'password', {
	        configurable: true,
	        enumerable: false,
	        writable: true,
	        value: options.password,
	      });
	    }

	    this.options.max = this.options.max || this.options.poolSize || 10;
	    this.options.maxUses = this.options.maxUses || Infinity;
	    this.log = this.options.log || function () {};
	    this.Client = this.options.Client || Client || lib$1.Client;
	    this.Promise = this.options.Promise || commonjsGlobal.Promise;

	    if (typeof this.options.idleTimeoutMillis === 'undefined') {
	      this.options.idleTimeoutMillis = 10000;
	    }

	    this._clients = [];
	    this._idle = [];
	    this._pendingQueue = [];
	    this._endCallback = undefined;
	    this.ending = false;
	    this.ended = false;
	  }

	  _isFull() {
	    return this._clients.length >= this.options.max
	  }

	  _pulseQueue() {
	    this.log('pulse queue');
	    if (this.ended) {
	      this.log('pulse queue ended');
	      return
	    }
	    if (this.ending) {
	      this.log('pulse queue on ending');
	      if (this._idle.length) {
	        this._idle.slice().map((item) => {
	          this._remove(item.client);
	        });
	      }
	      if (!this._clients.length) {
	        this.ended = true;
	        this._endCallback();
	      }
	      return
	    }
	    // if we don't have any waiting, do nothing
	    if (!this._pendingQueue.length) {
	      this.log('no queued requests');
	      return
	    }
	    // if we don't have any idle clients and we have no more room do nothing
	    if (!this._idle.length && this._isFull()) {
	      return
	    }
	    const pendingItem = this._pendingQueue.shift();
	    if (this._idle.length) {
	      const idleItem = this._idle.pop();
	      clearTimeout(idleItem.timeoutId);
	      const client = idleItem.client;
	      const idleListener = idleItem.idleListener;

	      return this._acquireClient(client, pendingItem, idleListener, false)
	    }
	    if (!this._isFull()) {
	      return this.newClient(pendingItem)
	    }
	    throw new Error('unexpected condition')
	  }

	  _remove(client) {
	    const removed = removeWhere(this._idle, (item) => item.client === client);

	    if (removed !== undefined) {
	      clearTimeout(removed.timeoutId);
	    }

	    this._clients = this._clients.filter((c) => c !== client);
	    client.end();
	    this.emit('remove', client);
	  }

	  connect(cb) {
	    if (this.ending) {
	      const err = new Error('Cannot use a pool after calling end on the pool');
	      return cb ? cb(err) : this.Promise.reject(err)
	    }

	    const response = promisify(this.Promise, cb);
	    const result = response.result;

	    // if we don't have to connect a new client, don't do so
	    if (this._clients.length >= this.options.max || this._idle.length) {
	      // if we have idle clients schedule a pulse immediately
	      if (this._idle.length) {
	        process.nextTick(() => this._pulseQueue());
	      }

	      if (!this.options.connectionTimeoutMillis) {
	        this._pendingQueue.push(new PendingItem(response.callback));
	        return result
	      }

	      const queueCallback = (err, res, done) => {
	        clearTimeout(tid);
	        response.callback(err, res, done);
	      };

	      const pendingItem = new PendingItem(queueCallback);

	      // set connection timeout on checking out an existing client
	      const tid = setTimeout(() => {
	        // remove the callback from pending waiters because
	        // we're going to call it with a timeout error
	        removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
	        pendingItem.timedOut = true;
	        response.callback(new Error('timeout exceeded when trying to connect'));
	      }, this.options.connectionTimeoutMillis);

	      this._pendingQueue.push(pendingItem);
	      return result
	    }

	    this.newClient(new PendingItem(response.callback));

	    return result
	  }

	  newClient(pendingItem) {
	    const client = new this.Client(this.options);
	    this._clients.push(client);
	    const idleListener = makeIdleListener(this, client);

	    this.log('checking client timeout');

	    // connection timeout logic
	    let tid;
	    let timeoutHit = false;
	    if (this.options.connectionTimeoutMillis) {
	      tid = setTimeout(() => {
	        this.log('ending client due to timeout');
	        timeoutHit = true;
	        // force kill the node driver, and let libpq do its teardown
	        client.connection ? client.connection.stream.destroy() : client.end();
	      }, this.options.connectionTimeoutMillis);
	    }

	    this.log('connecting new client');
	    client.connect((err) => {
	      if (tid) {
	        clearTimeout(tid);
	      }
	      client.on('error', idleListener);
	      if (err) {
	        this.log('client failed to connect', err);
	        // remove the dead client from our list of clients
	        this._clients = this._clients.filter((c) => c !== client);
	        if (timeoutHit) {
	          err.message = 'Connection terminated due to connection timeout';
	        }

	        // this client won’t be released, so move on immediately
	        this._pulseQueue();

	        if (!pendingItem.timedOut) {
	          pendingItem.callback(err, undefined, NOOP);
	        }
	      } else {
	        this.log('new client connected');

	        return this._acquireClient(client, pendingItem, idleListener, true)
	      }
	    });
	  }

	  // acquire a client for a pending work item
	  _acquireClient(client, pendingItem, idleListener, isNew) {
	    if (isNew) {
	      this.emit('connect', client);
	    }

	    this.emit('acquire', client);

	    client.release = this._releaseOnce(client, idleListener);

	    client.removeListener('error', idleListener);

	    if (!pendingItem.timedOut) {
	      if (isNew && this.options.verify) {
	        this.options.verify(client, (err) => {
	          if (err) {
	            client.release(err);
	            return pendingItem.callback(err, undefined, NOOP)
	          }

	          pendingItem.callback(undefined, client, client.release);
	        });
	      } else {
	        pendingItem.callback(undefined, client, client.release);
	      }
	    } else {
	      if (isNew && this.options.verify) {
	        this.options.verify(client, client.release);
	      } else {
	        client.release();
	      }
	    }
	  }

	  // returns a function that wraps _release and throws if called more than once
	  _releaseOnce(client, idleListener) {
	    let released = false;

	    return (err) => {
	      if (released) {
	        throwOnDoubleRelease();
	      }

	      released = true;
	      this._release(client, idleListener, err);
	    }
	  }

	  // release a client back to the poll, include an error
	  // to remove it from the pool
	  _release(client, idleListener, err) {
	    client.on('error', idleListener);

	    client._poolUseCount = (client._poolUseCount || 0) + 1;

	    // TODO(bmc): expose a proper, public interface _queryable and _ending
	    if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
	      if (client._poolUseCount >= this.options.maxUses) {
	        this.log('remove expended client');
	      }
	      this._remove(client);
	      this._pulseQueue();
	      return
	    }

	    // idle timeout
	    let tid;
	    if (this.options.idleTimeoutMillis) {
	      tid = setTimeout(() => {
	        this.log('remove idle client');
	        this._remove(client);
	      }, this.options.idleTimeoutMillis);
	    }

	    this._idle.push(new IdleItem(client, idleListener, tid));
	    this._pulseQueue();
	  }

	  query(text, values, cb) {
	    // guard clause against passing a function as the first parameter
	    if (typeof text === 'function') {
	      const response = promisify(this.Promise, text);
	      setImmediate(function () {
	        return response.callback(new Error('Passing a function as the first parameter to pool.query is not supported'))
	      });
	      return response.result
	    }

	    // allow plain text query without values
	    if (typeof values === 'function') {
	      cb = values;
	      values = undefined;
	    }
	    const response = promisify(this.Promise, cb);
	    cb = response.callback;

	    this.connect((err, client) => {
	      if (err) {
	        return cb(err)
	      }

	      let clientReleased = false;
	      const onError = (err) => {
	        if (clientReleased) {
	          return
	        }
	        clientReleased = true;
	        client.release(err);
	        cb(err);
	      };

	      client.once('error', onError);
	      this.log('dispatching query');
	      client.query(text, values, (err, res) => {
	        this.log('query dispatched');
	        client.removeListener('error', onError);
	        if (clientReleased) {
	          return
	        }
	        clientReleased = true;
	        client.release(err);
	        if (err) {
	          return cb(err)
	        } else {
	          return cb(undefined, res)
	        }
	      });
	    });
	    return response.result
	  }

	  end(cb) {
	    this.log('ending');
	    if (this.ending) {
	      const err = new Error('Called end on pool more than once');
	      return cb ? cb(err) : this.Promise.reject(err)
	    }
	    this.ending = true;
	    const promised = promisify(this.Promise, cb);
	    this._endCallback = promised.callback;
	    this._pulseQueue();
	    return promised.result
	  }

	  get waitingCount() {
	    return this._pendingQueue.length
	  }

	  get idleCount() {
	    return this._idle.length
	  }

	  get totalCount() {
	    return this._clients.length
	  }
	}
	var pgPool = Pool;

	var semver = createCommonjsModule(function (module, exports) {
	// export the class if we are in a Node-like system.
	if ( module.exports === exports)
	  exports = module.exports = SemVer;

	// The debug function is excluded entirely from the minified version.
	/* nomin */ var debug;
	/* nomin */ if (typeof process === 'object' &&
	    /* nomin */ process.env &&
	    /* nomin */ process.env.NODE_DEBUG &&
	    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
	  /* nomin */ debug = function() {
	    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
	    /* nomin */ args.unshift('SEMVER');
	    /* nomin */ console.log.apply(console, args);
	    /* nomin */ };
	/* nomin */ else
	  /* nomin */ debug = function() {};

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	exports.SEMVER_SPEC_VERSION = '2.0.0';

	var MAX_LENGTH = 256;
	var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

	// The actual regexps go on exports.re
	var re = exports.re = [];
	var src = exports.src = [];
	var R = 0;

	// The following Regular Expressions can be used for tokenizing,
	// validating, and parsing SemVer version strings.

	// ## Numeric Identifier
	// A single `0`, or a non-zero digit followed by zero or more digits.

	var NUMERICIDENTIFIER = R++;
	src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
	var NUMERICIDENTIFIERLOOSE = R++;
	src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


	// ## Non-numeric Identifier
	// Zero or more digits, followed by a letter or hyphen, and then zero or
	// more letters, digits, or hyphens.

	var NONNUMERICIDENTIFIER = R++;
	src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


	// ## Main Version
	// Three dot-separated numeric identifiers.

	var MAINVERSION = R++;
	src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
	                   '(' + src[NUMERICIDENTIFIER] + ')';

	var MAINVERSIONLOOSE = R++;
	src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
	                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

	// ## Pre-release Version Identifier
	// A numeric identifier, or a non-numeric identifier.

	var PRERELEASEIDENTIFIER = R++;
	src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
	                            '|' + src[NONNUMERICIDENTIFIER] + ')';

	var PRERELEASEIDENTIFIERLOOSE = R++;
	src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
	                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


	// ## Pre-release Version
	// Hyphen, followed by one or more dot-separated pre-release version
	// identifiers.

	var PRERELEASE = R++;
	src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
	                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

	var PRERELEASELOOSE = R++;
	src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
	                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

	// ## Build Metadata Identifier
	// Any combination of digits, letters, or hyphens.

	var BUILDIDENTIFIER = R++;
	src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

	// ## Build Metadata
	// Plus sign, followed by one or more period-separated build metadata
	// identifiers.

	var BUILD = R++;
	src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
	             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


	// ## Full Version String
	// A main version, followed optionally by a pre-release version and
	// build metadata.

	// Note that the only major, minor, patch, and pre-release sections of
	// the version string are capturing groups.  The build metadata is not a
	// capturing group, because it should not ever be used in version
	// comparison.

	var FULL = R++;
	var FULLPLAIN = 'v?' + src[MAINVERSION] +
	                src[PRERELEASE] + '?' +
	                src[BUILD] + '?';

	src[FULL] = '^' + FULLPLAIN + '$';

	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
	// common in the npm registry.
	var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
	                 src[PRERELEASELOOSE] + '?' +
	                 src[BUILD] + '?';

	var LOOSE = R++;
	src[LOOSE] = '^' + LOOSEPLAIN + '$';

	var GTLT = R++;
	src[GTLT] = '((?:<|>)?=?)';

	// Something like "2.*" or "1.2.x".
	// Note that "x.x" is a valid xRange identifer, meaning "any version"
	// Only the first item is strictly required.
	var XRANGEIDENTIFIERLOOSE = R++;
	src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
	var XRANGEIDENTIFIER = R++;
	src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

	var XRANGEPLAIN = R++;
	src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
	                   '(?:' + src[PRERELEASE] + ')?' +
	                   src[BUILD] + '?' +
	                   ')?)?';

	var XRANGEPLAINLOOSE = R++;
	src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
	                        '(?:' + src[PRERELEASELOOSE] + ')?' +
	                        src[BUILD] + '?' +
	                        ')?)?';

	var XRANGE = R++;
	src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
	var XRANGELOOSE = R++;
	src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

	// Tilde ranges.
	// Meaning is "reasonably at or greater than"
	var LONETILDE = R++;
	src[LONETILDE] = '(?:~>?)';

	var TILDETRIM = R++;
	src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
	re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
	var tildeTrimReplace = '$1~';

	var TILDE = R++;
	src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
	var TILDELOOSE = R++;
	src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

	// Caret ranges.
	// Meaning is "at least and backwards compatible with"
	var LONECARET = R++;
	src[LONECARET] = '(?:\\^)';

	var CARETTRIM = R++;
	src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
	re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
	var caretTrimReplace = '$1^';

	var CARET = R++;
	src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
	var CARETLOOSE = R++;
	src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

	// A simple gt/lt/eq thing, or just "" to indicate "any version"
	var COMPARATORLOOSE = R++;
	src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
	var COMPARATOR = R++;
	src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


	// An expression to strip any whitespace between the gtlt and the thing
	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
	var COMPARATORTRIM = R++;
	src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
	                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

	// this one has to use the /g flag
	re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
	var comparatorTrimReplace = '$1$2$3';


	// Something like `1.2.3 - 1.2.4`
	// Note that these all use the loose form, because they'll be
	// checked against either the strict or loose comparator form
	// later.
	var HYPHENRANGE = R++;
	src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
	                   '\\s+-\\s+' +
	                   '(' + src[XRANGEPLAIN] + ')' +
	                   '\\s*$';

	var HYPHENRANGELOOSE = R++;
	src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s+-\\s+' +
	                        '(' + src[XRANGEPLAINLOOSE] + ')' +
	                        '\\s*$';

	// Star ranges basically just allow anything at all.
	var STAR = R++;
	src[STAR] = '(<|>)?=?\\s*\\*';

	// Compile to actual regexp objects.
	// All are flag-free, unless they were created above with a flag.
	for (var i = 0; i < R; i++) {
	  debug(i, src[i]);
	  if (!re[i])
	    re[i] = new RegExp(src[i]);
	}

	exports.parse = parse;
	function parse(version, loose) {
	  if (version.length > MAX_LENGTH)
	    return null;

	  var r = loose ? re[LOOSE] : re[FULL];
	  if (!r.test(version))
	    return null;

	  try {
	    return new SemVer(version, loose);
	  } catch (er) {
	    return null;
	  }
	}

	exports.valid = valid;
	function valid(version, loose) {
	  var v = parse(version, loose);
	  return v ? v.version : null;
	}


	exports.clean = clean;
	function clean(version, loose) {
	  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
	  return s ? s.version : null;
	}

	exports.SemVer = SemVer;

	function SemVer(version, loose) {
	  if (version instanceof SemVer) {
	    if (version.loose === loose)
	      return version;
	    else
	      version = version.version;
	  } else if (typeof version !== 'string') {
	    throw new TypeError('Invalid Version: ' + version);
	  }

	  if (version.length > MAX_LENGTH)
	    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

	  if (!(this instanceof SemVer))
	    return new SemVer(version, loose);

	  debug('SemVer', version, loose);
	  this.loose = loose;
	  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

	  if (!m)
	    throw new TypeError('Invalid Version: ' + version);

	  this.raw = version;

	  // these are actually numbers
	  this.major = +m[1];
	  this.minor = +m[2];
	  this.patch = +m[3];

	  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
	    throw new TypeError('Invalid major version')

	  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
	    throw new TypeError('Invalid minor version')

	  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
	    throw new TypeError('Invalid patch version')

	  // numberify any prerelease numeric ids
	  if (!m[4])
	    this.prerelease = [];
	  else
	    this.prerelease = m[4].split('.').map(function(id) {
	      return (/^[0-9]+$/.test(id)) ? +id : id;
	    });

	  this.build = m[5] ? m[5].split('.') : [];
	  this.format();
	}

	SemVer.prototype.format = function() {
	  this.version = this.major + '.' + this.minor + '.' + this.patch;
	  if (this.prerelease.length)
	    this.version += '-' + this.prerelease.join('.');
	  return this.version;
	};

	SemVer.prototype.inspect = function() {
	  return '<SemVer "' + this + '">';
	};

	SemVer.prototype.toString = function() {
	  return this.version;
	};

	SemVer.prototype.compare = function(other) {
	  debug('SemVer.compare', this.version, this.loose, other);
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return this.compareMain(other) || this.comparePre(other);
	};

	SemVer.prototype.compareMain = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  return compareIdentifiers(this.major, other.major) ||
	         compareIdentifiers(this.minor, other.minor) ||
	         compareIdentifiers(this.patch, other.patch);
	};

	SemVer.prototype.comparePre = function(other) {
	  if (!(other instanceof SemVer))
	    other = new SemVer(other, this.loose);

	  // NOT having a prerelease is > having one
	  if (this.prerelease.length && !other.prerelease.length)
	    return -1;
	  else if (!this.prerelease.length && other.prerelease.length)
	    return 1;
	  else if (!this.prerelease.length && !other.prerelease.length)
	    return 0;

	  var i = 0;
	  do {
	    var a = this.prerelease[i];
	    var b = other.prerelease[i];
	    debug('prerelease compare', i, a, b);
	    if (a === undefined && b === undefined)
	      return 0;
	    else if (b === undefined)
	      return 1;
	    else if (a === undefined)
	      return -1;
	    else if (a === b)
	      continue;
	    else
	      return compareIdentifiers(a, b);
	  } while (++i);
	};

	// preminor will bump the version up to the next minor release, and immediately
	// down to pre-release. premajor and prepatch work the same way.
	SemVer.prototype.inc = function(release, identifier) {
	  switch (release) {
	    case 'premajor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor = 0;
	      this.major++;
	      this.inc('pre', identifier);
	      break;
	    case 'preminor':
	      this.prerelease.length = 0;
	      this.patch = 0;
	      this.minor++;
	      this.inc('pre', identifier);
	      break;
	    case 'prepatch':
	      // If this is already a prerelease, it will bump to the next version
	      // drop any prereleases that might already exist, since they are not
	      // relevant at this point.
	      this.prerelease.length = 0;
	      this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;
	    // If the input is a non-prerelease version, this acts the same as
	    // prepatch.
	    case 'prerelease':
	      if (this.prerelease.length === 0)
	        this.inc('patch', identifier);
	      this.inc('pre', identifier);
	      break;

	    case 'major':
	      // If this is a pre-major version, bump up to the same major version.
	      // Otherwise increment major.
	      // 1.0.0-5 bumps to 1.0.0
	      // 1.1.0 bumps to 2.0.0
	      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
	        this.major++;
	      this.minor = 0;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'minor':
	      // If this is a pre-minor version, bump up to the same minor version.
	      // Otherwise increment minor.
	      // 1.2.0-5 bumps to 1.2.0
	      // 1.2.1 bumps to 1.3.0
	      if (this.patch !== 0 || this.prerelease.length === 0)
	        this.minor++;
	      this.patch = 0;
	      this.prerelease = [];
	      break;
	    case 'patch':
	      // If this is not a pre-release version, it will increment the patch.
	      // If it is a pre-release it will bump up to the same patch version.
	      // 1.2.0-5 patches to 1.2.0
	      // 1.2.0 patches to 1.2.1
	      if (this.prerelease.length === 0)
	        this.patch++;
	      this.prerelease = [];
	      break;
	    // This probably shouldn't be used publicly.
	    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
	    case 'pre':
	      if (this.prerelease.length === 0)
	        this.prerelease = [0];
	      else {
	        var i = this.prerelease.length;
	        while (--i >= 0) {
	          if (typeof this.prerelease[i] === 'number') {
	            this.prerelease[i]++;
	            i = -2;
	          }
	        }
	        if (i === -1) // didn't increment anything
	          this.prerelease.push(0);
	      }
	      if (identifier) {
	        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	        if (this.prerelease[0] === identifier) {
	          if (isNaN(this.prerelease[1]))
	            this.prerelease = [identifier, 0];
	        } else
	          this.prerelease = [identifier, 0];
	      }
	      break;

	    default:
	      throw new Error('invalid increment argument: ' + release);
	  }
	  this.format();
	  return this;
	};

	exports.inc = inc;
	function inc(version, release, loose, identifier) {
	  if (typeof(loose) === 'string') {
	    identifier = loose;
	    loose = undefined;
	  }

	  try {
	    return new SemVer(version, loose).inc(release, identifier).version;
	  } catch (er) {
	    return null;
	  }
	}

	exports.diff = diff;
	function diff(version1, version2) {
	  if (eq(version1, version2)) {
	    return null;
	  } else {
	    var v1 = parse(version1);
	    var v2 = parse(version2);
	    if (v1.prerelease.length || v2.prerelease.length) {
	      for (var key in v1) {
	        if (key === 'major' || key === 'minor' || key === 'patch') {
	          if (v1[key] !== v2[key]) {
	            return 'pre'+key;
	          }
	        }
	      }
	      return 'prerelease';
	    }
	    for (var key in v1) {
	      if (key === 'major' || key === 'minor' || key === 'patch') {
	        if (v1[key] !== v2[key]) {
	          return key;
	        }
	      }
	    }
	  }
	}

	exports.compareIdentifiers = compareIdentifiers;

	var numeric = /^[0-9]+$/;
	function compareIdentifiers(a, b) {
	  var anum = numeric.test(a);
	  var bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return (anum && !bnum) ? -1 :
	         (bnum && !anum) ? 1 :
	         a < b ? -1 :
	         a > b ? 1 :
	         0;
	}

	exports.rcompareIdentifiers = rcompareIdentifiers;
	function rcompareIdentifiers(a, b) {
	  return compareIdentifiers(b, a);
	}

	exports.major = major;
	function major(a, loose) {
	  return new SemVer(a, loose).major;
	}

	exports.minor = minor;
	function minor(a, loose) {
	  return new SemVer(a, loose).minor;
	}

	exports.patch = patch;
	function patch(a, loose) {
	  return new SemVer(a, loose).patch;
	}

	exports.compare = compare;
	function compare(a, b, loose) {
	  return new SemVer(a, loose).compare(b);
	}

	exports.compareLoose = compareLoose;
	function compareLoose(a, b) {
	  return compare(a, b, true);
	}

	exports.rcompare = rcompare;
	function rcompare(a, b, loose) {
	  return compare(b, a, loose);
	}

	exports.sort = sort;
	function sort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.compare(a, b, loose);
	  });
	}

	exports.rsort = rsort;
	function rsort(list, loose) {
	  return list.sort(function(a, b) {
	    return exports.rcompare(a, b, loose);
	  });
	}

	exports.gt = gt;
	function gt(a, b, loose) {
	  return compare(a, b, loose) > 0;
	}

	exports.lt = lt;
	function lt(a, b, loose) {
	  return compare(a, b, loose) < 0;
	}

	exports.eq = eq;
	function eq(a, b, loose) {
	  return compare(a, b, loose) === 0;
	}

	exports.neq = neq;
	function neq(a, b, loose) {
	  return compare(a, b, loose) !== 0;
	}

	exports.gte = gte;
	function gte(a, b, loose) {
	  return compare(a, b, loose) >= 0;
	}

	exports.lte = lte;
	function lte(a, b, loose) {
	  return compare(a, b, loose) <= 0;
	}

	exports.cmp = cmp;
	function cmp(a, op, b, loose) {
	  var ret;
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a === b;
	      break;
	    case '!==':
	      if (typeof a === 'object') a = a.version;
	      if (typeof b === 'object') b = b.version;
	      ret = a !== b;
	      break;
	    case '': case '=': case '==': ret = eq(a, b, loose); break;
	    case '!=': ret = neq(a, b, loose); break;
	    case '>': ret = gt(a, b, loose); break;
	    case '>=': ret = gte(a, b, loose); break;
	    case '<': ret = lt(a, b, loose); break;
	    case '<=': ret = lte(a, b, loose); break;
	    default: throw new TypeError('Invalid operator: ' + op);
	  }
	  return ret;
	}

	exports.Comparator = Comparator;
	function Comparator(comp, loose) {
	  if (comp instanceof Comparator) {
	    if (comp.loose === loose)
	      return comp;
	    else
	      comp = comp.value;
	  }

	  if (!(this instanceof Comparator))
	    return new Comparator(comp, loose);

	  debug('comparator', comp, loose);
	  this.loose = loose;
	  this.parse(comp);

	  if (this.semver === ANY)
	    this.value = '';
	  else
	    this.value = this.operator + this.semver.version;

	  debug('comp', this);
	}

	var ANY = {};
	Comparator.prototype.parse = function(comp) {
	  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var m = comp.match(r);

	  if (!m)
	    throw new TypeError('Invalid comparator: ' + comp);

	  this.operator = m[1];
	  if (this.operator === '=')
	    this.operator = '';

	  // if it literally is just '>' or '' then allow anything.
	  if (!m[2])
	    this.semver = ANY;
	  else
	    this.semver = new SemVer(m[2], this.loose);
	};

	Comparator.prototype.inspect = function() {
	  return '<SemVer Comparator "' + this + '">';
	};

	Comparator.prototype.toString = function() {
	  return this.value;
	};

	Comparator.prototype.test = function(version) {
	  debug('Comparator.test', version, this.loose);

	  if (this.semver === ANY)
	    return true;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  return cmp(version, this.operator, this.semver, this.loose);
	};


	exports.Range = Range;
	function Range(range, loose) {
	  if ((range instanceof Range) && range.loose === loose)
	    return range;

	  if (!(this instanceof Range))
	    return new Range(range, loose);

	  this.loose = loose;

	  // First, split based on boolean or ||
	  this.raw = range;
	  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
	    return this.parseRange(range.trim());
	  }, this).filter(function(c) {
	    // throw out any that are not relevant for whatever reason
	    return c.length;
	  });

	  if (!this.set.length) {
	    throw new TypeError('Invalid SemVer Range: ' + range);
	  }

	  this.format();
	}

	Range.prototype.inspect = function() {
	  return '<SemVer Range "' + this.range + '">';
	};

	Range.prototype.format = function() {
	  this.range = this.set.map(function(comps) {
	    return comps.join(' ').trim();
	  }).join('||').trim();
	  return this.range;
	};

	Range.prototype.toString = function() {
	  return this.range;
	};

	Range.prototype.parseRange = function(range) {
	  var loose = this.loose;
	  range = range.trim();
	  debug('range', range, loose);
	  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
	  range = range.replace(hr, hyphenReplace);
	  debug('hyphen replace', range);
	  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
	  debug('comparator trim', range, re[COMPARATORTRIM]);

	  // `~ 1.2.3` => `~1.2.3`
	  range = range.replace(re[TILDETRIM], tildeTrimReplace);

	  // `^ 1.2.3` => `^1.2.3`
	  range = range.replace(re[CARETTRIM], caretTrimReplace);

	  // normalize spaces
	  range = range.split(/\s+/).join(' ');

	  // At this point, the range is completely trimmed and
	  // ready to be split into comparators.

	  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
	  var set = range.split(' ').map(function(comp) {
	    return parseComparator(comp, loose);
	  }).join(' ').split(/\s+/);
	  if (this.loose) {
	    // in loose mode, throw out any that are not valid comparators
	    set = set.filter(function(comp) {
	      return !!comp.match(compRe);
	    });
	  }
	  set = set.map(function(comp) {
	    return new Comparator(comp, loose);
	  });

	  return set;
	};

	// Mostly just for testing and legacy API reasons
	exports.toComparators = toComparators;
	function toComparators(range, loose) {
	  return new Range(range, loose).set.map(function(comp) {
	    return comp.map(function(c) {
	      return c.value;
	    }).join(' ').trim().split(' ');
	  });
	}

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	function parseComparator(comp, loose) {
	  debug('comp', comp);
	  comp = replaceCarets(comp, loose);
	  debug('caret', comp);
	  comp = replaceTildes(comp, loose);
	  debug('tildes', comp);
	  comp = replaceXRanges(comp, loose);
	  debug('xrange', comp);
	  comp = replaceStars(comp, loose);
	  debug('stars', comp);
	  return comp;
	}

	function isX(id) {
	  return !id || id.toLowerCase() === 'x' || id === '*';
	}

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
	function replaceTildes(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceTilde(comp, loose);
	  }).join(' ');
	}

	function replaceTilde(comp, loose) {
	  var r = loose ? re[TILDELOOSE] : re[TILDE];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    debug('tilde', comp, _, M, m, p, pr);
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p))
	      // ~1.2 == >=1.2.0- <1.3.0-
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    else if (pr) {
	      debug('replaceTilde pr', pr);
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      ret = '>=' + M + '.' + m + '.' + p + pr +
	            ' <' + M + '.' + (+m + 1) + '.0';
	    } else
	      // ~1.2.3 == >=1.2.3 <1.3.0
	      ret = '>=' + M + '.' + m + '.' + p +
	            ' <' + M + '.' + (+m + 1) + '.0';

	    debug('tilde return', ret);
	    return ret;
	  });
	}

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
	// ^1.2.3 --> >=1.2.3 <2.0.0
	// ^1.2.0 --> >=1.2.0 <2.0.0
	function replaceCarets(comp, loose) {
	  return comp.trim().split(/\s+/).map(function(comp) {
	    return replaceCaret(comp, loose);
	  }).join(' ');
	}

	function replaceCaret(comp, loose) {
	  debug('caret', comp, loose);
	  var r = loose ? re[CARETLOOSE] : re[CARET];
	  return comp.replace(r, function(_, M, m, p, pr) {
	    debug('caret', comp, _, M, m, p, pr);
	    var ret;

	    if (isX(M))
	      ret = '';
	    else if (isX(m))
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    else if (isX(p)) {
	      if (M === '0')
	        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	      else
	        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
	    } else if (pr) {
	      debug('replaceCaret pr', pr);
	      if (pr.charAt(0) !== '-')
	        pr = '-' + pr;
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p + pr +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p + pr +
	              ' <' + (+M + 1) + '.0.0';
	    } else {
	      debug('no pr');
	      if (M === '0') {
	        if (m === '0')
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + m + '.' + (+p + 1);
	        else
	          ret = '>=' + M + '.' + m + '.' + p +
	                ' <' + M + '.' + (+m + 1) + '.0';
	      } else
	        ret = '>=' + M + '.' + m + '.' + p +
	              ' <' + (+M + 1) + '.0.0';
	    }

	    debug('caret return', ret);
	    return ret;
	  });
	}

	function replaceXRanges(comp, loose) {
	  debug('replaceXRanges', comp, loose);
	  return comp.split(/\s+/).map(function(comp) {
	    return replaceXRange(comp, loose);
	  }).join(' ');
	}

	function replaceXRange(comp, loose) {
	  comp = comp.trim();
	  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
	  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
	    debug('xRange', comp, ret, gtlt, M, m, p, pr);
	    var xM = isX(M);
	    var xm = xM || isX(m);
	    var xp = xm || isX(p);
	    var anyX = xp;

	    if (gtlt === '=' && anyX)
	      gtlt = '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // replace X with 0
	      if (xm)
	        m = 0;
	      if (xp)
	        p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        // >1.2.3 => >= 1.2.4
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else if (xp) {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<';
	        if (xm)
	          M = +M + 1;
	        else
	          m = +m + 1;
	      }

	      ret = gtlt + M + '.' + m + '.' + p;
	    } else if (xm) {
	      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
	    } else if (xp) {
	      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
	    }

	    debug('xRange return', ret);

	    return ret;
	  });
	}

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	function replaceStars(comp, loose) {
	  debug('replaceStars', comp, loose);
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp.trim().replace(re[STAR], '');
	}

	// This function is passed to string.replace(re[HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0
	function hyphenReplace($0,
	                       from, fM, fm, fp, fpr, fb,
	                       to, tM, tm, tp, tpr, tb) {

	  if (isX(fM))
	    from = '';
	  else if (isX(fm))
	    from = '>=' + fM + '.0.0';
	  else if (isX(fp))
	    from = '>=' + fM + '.' + fm + '.0';
	  else
	    from = '>=' + from;

	  if (isX(tM))
	    to = '';
	  else if (isX(tm))
	    to = '<' + (+tM + 1) + '.0.0';
	  else if (isX(tp))
	    to = '<' + tM + '.' + (+tm + 1) + '.0';
	  else if (tpr)
	    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
	  else
	    to = '<=' + to;

	  return (from + ' ' + to).trim();
	}


	// if ANY of the sets match ALL of its comparators, then pass
	Range.prototype.test = function(version) {
	  if (!version)
	    return false;

	  if (typeof version === 'string')
	    version = new SemVer(version, this.loose);

	  for (var i = 0; i < this.set.length; i++) {
	    if (testSet(this.set[i], version))
	      return true;
	  }
	  return false;
	};

	function testSet(set, version) {
	  for (var i = 0; i < set.length; i++) {
	    if (!set[i].test(version))
	      return false;
	  }

	  if (version.prerelease.length) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (var i = 0; i < set.length; i++) {
	      debug(set[i].semver);
	      if (set[i].semver === ANY)
	        return true;

	      if (set[i].semver.prerelease.length > 0) {
	        var allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch)
	          return true;
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false;
	  }

	  return true;
	}

	exports.satisfies = satisfies;
	function satisfies(version, range, loose) {
	  try {
	    range = new Range(range, loose);
	  } catch (er) {
	    return false;
	  }
	  return range.test(version);
	}

	exports.maxSatisfying = maxSatisfying;
	function maxSatisfying(versions, range, loose) {
	  return versions.filter(function(version) {
	    return satisfies(version, range, loose);
	  }).sort(function(a, b) {
	    return rcompare(a, b, loose);
	  })[0] || null;
	}

	exports.validRange = validRange;
	function validRange(range, loose) {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range(range, loose).range || '*';
	  } catch (er) {
	    return null;
	  }
	}

	// Determine if version is less than all the versions possible in the range
	exports.ltr = ltr;
	function ltr(version, range, loose) {
	  return outside(version, range, '<', loose);
	}

	// Determine if version is greater than all the versions possible in the range.
	exports.gtr = gtr;
	function gtr(version, range, loose) {
	  return outside(version, range, '>', loose);
	}

	exports.outside = outside;
	function outside(version, range, hilo, loose) {
	  version = new SemVer(version, loose);
	  range = new Range(range, loose);

	  var gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt;
	      ltefn = lte;
	      ltfn = lt;
	      comp = '>';
	      ecomp = '>=';
	      break;
	    case '<':
	      gtfn = lt;
	      ltefn = gte;
	      ltfn = gt;
	      comp = '<';
	      ecomp = '<=';
	      break;
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"');
	  }

	  // If it satisifes the range it is not outside
	  if (satisfies(version, range, loose)) {
	    return false;
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (var i = 0; i < range.set.length; ++i) {
	    var comparators = range.set[i];

	    var high = null;
	    var low = null;

	    comparators.forEach(function(comparator) {
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, loose)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, loose)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false;
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false;
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false;
	    }
	  }
	  return true;
	}
	});
	var semver_1 = semver.SEMVER_SPEC_VERSION;
	var semver_2 = semver.re;
	var semver_3 = semver.src;
	var semver_4 = semver.parse;
	var semver_5 = semver.valid;
	var semver_6 = semver.clean;
	var semver_7 = semver.SemVer;
	var semver_8 = semver.inc;
	var semver_9 = semver.diff;
	var semver_10 = semver.compareIdentifiers;
	var semver_11 = semver.rcompareIdentifiers;
	var semver_12 = semver.major;
	var semver_13 = semver.minor;
	var semver_14 = semver.patch;
	var semver_15 = semver.compare;
	var semver_16 = semver.compareLoose;
	var semver_17 = semver.rcompare;
	var semver_18 = semver.sort;
	var semver_19 = semver.rsort;
	var semver_20 = semver.gt;
	var semver_21 = semver.lt;
	var semver_22 = semver.eq;
	var semver_23 = semver.neq;
	var semver_24 = semver.gte;
	var semver_25 = semver.lte;
	var semver_26 = semver.cmp;
	var semver_27 = semver.Comparator;
	var semver_28 = semver.Range;
	var semver_29 = semver.toComparators;
	var semver_30 = semver.satisfies;
	var semver_31 = semver.maxSatisfying;
	var semver_32 = semver.validRange;
	var semver_33 = semver.ltr;
	var semver_34 = semver.gtr;
	var semver_35 = semver.outside;

	var _from = "pg@^8.3.2";
	var _id = "pg@8.3.2";
	var _inBundle = false;
	var _integrity = "sha512-hOoRCTriXS+VWwyXHchRjWb9yv3Koq8irlwwXniqhdgK0AbfWvEnybGS2HIUE+UdCSTuYAM4WGPujFpPg9Vcaw==";
	var _location = "/pg";
	var _phantomChildren = {
	};
	var _requested = {
		type: "range",
		registry: true,
		raw: "pg@^8.3.2",
		name: "pg",
		escapedName: "pg",
		rawSpec: "^8.3.2",
		saveSpec: null,
		fetchSpec: "^8.3.2"
	};
	var _requiredBy = [
		"/"
	];
	var _resolved = "https://registry.npmjs.org/pg/-/pg-8.3.2.tgz";
	var _shasum = "52766e41302f5b878fe1efa10d4cdd486f6dff50";
	var _spec = "pg@^8.3.2";
	var _where = "/media/dimkk/apps21/mine/opportunity/pg-worker2";
	var author = {
		name: "Brian Carlson",
		email: "brian.m.carlson@gmail.com"
	};
	var bugs = {
		url: "https://github.com/brianc/node-postgres/issues"
	};
	var bundleDependencies = false;
	var dependencies = {
		"buffer-writer": "2.0.0",
		"packet-reader": "1.0.0",
		"pg-connection-string": "^2.3.0",
		"pg-pool": "^3.2.1",
		"pg-protocol": "^1.2.5",
		"pg-types": "^2.1.0",
		pgpass: "1.x",
		semver: "4.3.2"
	};
	var deprecated = false;
	var description = "PostgreSQL client - pure javascript & libpq with the same API";
	var devDependencies = {
		async: "0.9.0",
		bluebird: "3.5.2",
		co: "4.6.0",
		"pg-copy-streams": "0.3.0"
	};
	var engines = {
		node: ">= 8.0.0"
	};
	var files = [
		"lib",
		"SPONSORS.md"
	];
	var gitHead = "acfbafac82641ef909d9d6235d46d38378c67864";
	var homepage = "https://github.com/brianc/node-postgres";
	var keywords = [
		"database",
		"libpq",
		"pg",
		"postgre",
		"postgres",
		"postgresql",
		"rdbms"
	];
	var license = "MIT";
	var main = "./lib";
	var minNativeVersion = "2.0.0";
	var name = "pg";
	var repository = {
		type: "git",
		url: "git://github.com/brianc/node-postgres.git"
	};
	var scripts = {
		test: "make test-all"
	};
	var version = "8.3.2";
	var _package = {
		_from: _from,
		_id: _id,
		_inBundle: _inBundle,
		_integrity: _integrity,
		_location: _location,
		_phantomChildren: _phantomChildren,
		_requested: _requested,
		_requiredBy: _requiredBy,
		_resolved: _resolved,
		_shasum: _shasum,
		_spec: _spec,
		_where: _where,
		author: author,
		bugs: bugs,
		bundleDependencies: bundleDependencies,
		dependencies: dependencies,
		deprecated: deprecated,
		description: description,
		devDependencies: devDependencies,
		engines: engines,
		files: files,
		gitHead: gitHead,
		homepage: homepage,
		keywords: keywords,
		license: license,
		main: main,
		minNativeVersion: minNativeVersion,
		name: name,
		repository: repository,
		scripts: scripts,
		version: version
	};

	var _package$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		_from: _from,
		_id: _id,
		_inBundle: _inBundle,
		_integrity: _integrity,
		_location: _location,
		_phantomChildren: _phantomChildren,
		_requested: _requested,
		_requiredBy: _requiredBy,
		_resolved: _resolved,
		_shasum: _shasum,
		_spec: _spec,
		_where: _where,
		author: author,
		bugs: bugs,
		bundleDependencies: bundleDependencies,
		dependencies: dependencies,
		deprecated: deprecated,
		description: description,
		devDependencies: devDependencies,
		engines: engines,
		files: files,
		gitHead: gitHead,
		homepage: homepage,
		keywords: keywords,
		license: license,
		main: main,
		minNativeVersion: minNativeVersion,
		name: name,
		repository: repository,
		scripts: scripts,
		version: version,
		'default': _package
	});

	var query$1 = createCommonjsModule(function (module) {

	var EventEmitter = events.EventEmitter;



	var NativeQuery = (module.exports = function (config, values, callback) {
	  EventEmitter.call(this);
	  config = utils.normalizeQueryConfig(config, values, callback);
	  this.text = config.text;
	  this.values = config.values;
	  this.name = config.name;
	  this.callback = config.callback;
	  this.state = 'new';
	  this._arrayMode = config.rowMode === 'array';

	  // if the 'row' event is listened for
	  // then emit them as they come in
	  // without setting singleRowMode to true
	  // this has almost no meaning because libpq
	  // reads all rows into memory befor returning any
	  this._emitRowEvents = false;
	  this.on(
	    'newListener',
	    function (event) {
	      if (event === 'row') this._emitRowEvents = true;
	    }.bind(this)
	  );
	});

	util$4.inherits(NativeQuery, EventEmitter);

	var errorFieldMap = {
	  /* eslint-disable quote-props */
	  sqlState: 'code',
	  statementPosition: 'position',
	  messagePrimary: 'message',
	  context: 'where',
	  schemaName: 'schema',
	  tableName: 'table',
	  columnName: 'column',
	  dataTypeName: 'dataType',
	  constraintName: 'constraint',
	  sourceFile: 'file',
	  sourceLine: 'line',
	  sourceFunction: 'routine',
	};

	NativeQuery.prototype.handleError = function (err) {
	  // copy pq error fields into the error object
	  var fields = this.native.pq.resultErrorFields();
	  if (fields) {
	    for (var key in fields) {
	      var normalizedFieldName = errorFieldMap[key] || key;
	      err[normalizedFieldName] = fields[key];
	    }
	  }
	  if (this.callback) {
	    this.callback(err);
	  } else {
	    this.emit('error', err);
	  }
	  this.state = 'error';
	};

	NativeQuery.prototype.then = function (onSuccess, onFailure) {
	  return this._getPromise().then(onSuccess, onFailure)
	};

	NativeQuery.prototype.catch = function (callback) {
	  return this._getPromise().catch(callback)
	};

	NativeQuery.prototype._getPromise = function () {
	  if (this._promise) return this._promise
	  this._promise = new Promise(
	    function (resolve, reject) {
	      this._once('end', resolve);
	      this._once('error', reject);
	    }.bind(this)
	  );
	  return this._promise
	};

	NativeQuery.prototype.submit = function (client) {
	  this.state = 'running';
	  var self = this;
	  this.native = client.native;
	  client.native.arrayMode = this._arrayMode;

	  var after = function (err, rows, results) {
	    client.native.arrayMode = false;
	    setImmediate(function () {
	      self.emit('_done');
	    });

	    // handle possible query error
	    if (err) {
	      return self.handleError(err)
	    }

	    // emit row events for each row in the result
	    if (self._emitRowEvents) {
	      if (results.length > 1) {
	        rows.forEach((rowOfRows, i) => {
	          rowOfRows.forEach((row) => {
	            self.emit('row', row, results[i]);
	          });
	        });
	      } else {
	        rows.forEach(function (row) {
	          self.emit('row', row, results);
	        });
	      }
	    }

	    // handle successful result
	    self.state = 'end';
	    self.emit('end', results);
	    if (self.callback) {
	      self.callback(null, results);
	    }
	  };

	  if (process.domain) {
	    after = process.domain.bind(after);
	  }

	  // named query
	  if (this.name) {
	    if (this.name.length > 63) {
	      /* eslint-disable no-console */
	      console.error('Warning! Postgres only supports 63 characters for query names.');
	      console.error('You supplied %s (%s)', this.name, this.name.length);
	      console.error('This can cause conflicts and silent errors executing queries');
	      /* eslint-enable no-console */
	    }
	    var values = (this.values || []).map(utils.prepareValue);

	    // check if the client has already executed this named query
	    // if so...just execute it again - skip the planning phase
	    if (client.namedQueries[this.name]) {
	      if (this.text && client.namedQueries[this.name] !== this.text) {
	        const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
	        return after(err)
	      }
	      return client.native.execute(this.name, values, after)
	    }
	    // plan the named query the first time, then execute it
	    return client.native.prepare(this.name, this.text, values.length, function (err) {
	      if (err) return after(err)
	      client.namedQueries[self.name] = self.text;
	      return self.native.execute(self.name, values, after)
	    })
	  } else if (this.values) {
	    if (!Array.isArray(this.values)) {
	      const err = new Error('Query values must be an array');
	      return after(err)
	    }
	    var vals = this.values.map(utils.prepareValue);
	    client.native.query(this.text, vals, after);
	  } else {
	    client.native.query(this.text, after);
	  }
	};
	});

	var pkg = getCjsExportFromNamespace(_package$1);

	var client$1 = createCommonjsModule(function (module) {

	// eslint-disable-next-line





	var EventEmitter = events.EventEmitter;



	var msg = 'Version >= ' + pkg.minNativeVersion + ' of pg-native required.';
	assert(semver.gte(pgNative.version, pkg.minNativeVersion), msg);



	var Client = (module.exports = function (config) {
	  EventEmitter.call(this);
	  config = config || {};

	  this._Promise = config.Promise || commonjsGlobal.Promise;
	  this._types = new typeOverrides(config.types);

	  this.native = new pgNative({
	    types: this._types,
	  });

	  this._queryQueue = [];
	  this._ending = false;
	  this._connecting = false;
	  this._connected = false;
	  this._queryable = true;

	  // keep these on the object for legacy reasons
	  // for the time being. TODO: deprecate all this jazz
	  var cp = (this.connectionParameters = new connectionParameters(config));
	  this.user = cp.user;

	  // "hiding" the password so it doesn't show up in stack traces
	  // or if the client is console.logged
	  Object.defineProperty(this, 'password', {
	    configurable: true,
	    enumerable: false,
	    writable: true,
	    value: cp.password,
	  });
	  this.database = cp.database;
	  this.host = cp.host;
	  this.port = cp.port;

	  // a hash to hold named queries
	  this.namedQueries = {};
	});

	Client.Query = query$1;

	util$4.inherits(Client, EventEmitter);

	Client.prototype._errorAllQueries = function (err) {
	  const enqueueError = (query) => {
	    process.nextTick(() => {
	      query.native = this.native;
	      query.handleError(err);
	    });
	  };

	  if (this._hasActiveQuery()) {
	    enqueueError(this._activeQuery);
	    this._activeQuery = null;
	  }

	  this._queryQueue.forEach(enqueueError);
	  this._queryQueue.length = 0;
	};

	// connect to the backend
	// pass an optional callback to be called once connected
	// or with an error if there was a connection error
	Client.prototype._connect = function (cb) {
	  var self = this;

	  if (this._connecting) {
	    process.nextTick(() => cb(new Error('Client has already been connected. You cannot reuse a client.')));
	    return
	  }

	  this._connecting = true;

	  this.connectionParameters.getLibpqConnectionString(function (err, conString) {
	    if (err) return cb(err)
	    self.native.connect(conString, function (err) {
	      if (err) {
	        self.native.end();
	        return cb(err)
	      }

	      // set internal states to connected
	      self._connected = true;

	      // handle connection errors from the native layer
	      self.native.on('error', function (err) {
	        self._queryable = false;
	        self._errorAllQueries(err);
	        self.emit('error', err);
	      });

	      self.native.on('notification', function (msg) {
	        self.emit('notification', {
	          channel: msg.relname,
	          payload: msg.extra,
	        });
	      });

	      // signal we are connected now
	      self.emit('connect');
	      self._pulseQueryQueue(true);

	      cb();
	    });
	  });
	};

	Client.prototype.connect = function (callback) {
	  if (callback) {
	    this._connect(callback);
	    return
	  }

	  return new this._Promise((resolve, reject) => {
	    this._connect((error) => {
	      if (error) {
	        reject(error);
	      } else {
	        resolve();
	      }
	    });
	  })
	};

	// send a query to the server
	// this method is highly overloaded to take
	// 1) string query, optional array of parameters, optional function callback
	// 2) object query with {
	//    string query
	//    optional array values,
	//    optional function callback instead of as a separate parameter
	//    optional string name to name & cache the query plan
	//    optional string rowMode = 'array' for an array of results
	//  }
	Client.prototype.query = function (config, values, callback) {
	  var query;
	  var result;
	  var readTimeout;
	  var readTimeoutTimer;
	  var queryCallback;

	  if (config === null || config === undefined) {
	    throw new TypeError('Client was passed a null or undefined query')
	  } else if (typeof config.submit === 'function') {
	    readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	    result = query = config;
	    // accept query(new Query(...), (err, res) => { }) style
	    if (typeof values === 'function') {
	      config.callback = values;
	    }
	  } else {
	    readTimeout = this.connectionParameters.query_timeout;
	    query = new query$1(config, values, callback);
	    if (!query.callback) {
	      let resolveOut, rejectOut;
	      result = new this._Promise((resolve, reject) => {
	        resolveOut = resolve;
	        rejectOut = reject;
	      });
	      query.callback = (err, res) => (err ? rejectOut(err) : resolveOut(res));
	    }
	  }

	  if (readTimeout) {
	    queryCallback = query.callback;

	    readTimeoutTimer = setTimeout(() => {
	      var error = new Error('Query read timeout');

	      process.nextTick(() => {
	        query.handleError(error, this.connection);
	      });

	      queryCallback(error);

	      // we already returned an error,
	      // just do nothing if query completes
	      query.callback = () => {};

	      // Remove from queue
	      var index = this._queryQueue.indexOf(query);
	      if (index > -1) {
	        this._queryQueue.splice(index, 1);
	      }

	      this._pulseQueryQueue();
	    }, readTimeout);

	    query.callback = (err, res) => {
	      clearTimeout(readTimeoutTimer);
	      queryCallback(err, res);
	    };
	  }

	  if (!this._queryable) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client has encountered a connection error and is not queryable'));
	    });
	    return result
	  }

	  if (this._ending) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client was closed and is not queryable'));
	    });
	    return result
	  }

	  this._queryQueue.push(query);
	  this._pulseQueryQueue();
	  return result
	};

	// disconnect from the backend server
	Client.prototype.end = function (cb) {
	  var self = this;

	  this._ending = true;

	  if (!this._connected) {
	    this.once('connect', this.end.bind(this, cb));
	  }
	  var result;
	  if (!cb) {
	    result = new this._Promise(function (resolve, reject) {
	      cb = (err) => (err ? reject(err) : resolve());
	    });
	  }
	  this.native.end(function () {
	    self._errorAllQueries(new Error('Connection terminated'));

	    process.nextTick(() => {
	      self.emit('end');
	      if (cb) cb();
	    });
	  });
	  return result
	};

	Client.prototype._hasActiveQuery = function () {
	  return this._activeQuery && this._activeQuery.state !== 'error' && this._activeQuery.state !== 'end'
	};

	Client.prototype._pulseQueryQueue = function (initialConnection) {
	  if (!this._connected) {
	    return
	  }
	  if (this._hasActiveQuery()) {
	    return
	  }
	  var query = this._queryQueue.shift();
	  if (!query) {
	    if (!initialConnection) {
	      this.emit('drain');
	    }
	    return
	  }
	  this._activeQuery = query;
	  query.submit(this);
	  var self = this;
	  query.once('_done', function () {
	    self._pulseQueryQueue();
	  });
	};

	// attempt to cancel an in-progress query
	Client.prototype.cancel = function (query) {
	  if (this._activeQuery === query) {
	    this.native.cancel(function () {});
	  } else if (this._queryQueue.indexOf(query) !== -1) {
	    this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
	  }
	};

	Client.prototype.setTypeParser = function (oid, format, parseFn) {
	  return this._types.setTypeParser(oid, format, parseFn)
	};

	Client.prototype.getTypeParser = function (oid, format) {
	  return this._types.getTypeParser(oid, format)
	};
	});

	var native_1 = client$1;

	var lib$1 = createCommonjsModule(function (module) {






	const poolFactory = (Client) => {
	  return class BoundPool extends pgPool {
	    constructor(options) {
	      super(options, Client);
	    }
	  }
	};

	var PG = function (clientConstructor) {
	  this.defaults = defaults;
	  this.Client = clientConstructor;
	  this.Query = this.Client.Query;
	  this.Pool = poolFactory(this.Client);
	  this._pools = [];
	  this.Connection = connection;
	  this.types = pgTypes;
	};

	if (typeof process.env.NODE_PG_FORCE_NATIVE !== 'undefined') {
	  module.exports = new PG(native_1);
	} else {
	  module.exports = new PG(client);

	  // lazy require native module...the native module may not have installed
	  Object.defineProperty(module.exports, 'native', {
	    configurable: true,
	    enumerable: false,
	    get() {
	      var native = null;
	      try {
	        native = new PG(native_1);
	      } catch (err) {
	        if (err.code !== 'MODULE_NOT_FOUND') {
	          throw err
	        }
	        /* eslint-disable no-console */
	        console.error(err.message);
	        /* eslint-enable no-console */
	      }

	      // overwrite module.exports.native so that getter is never called again
	      Object.defineProperty(module.exports, 'native', {
	        value: native,
	      });

	      return native
	    },
	  });
	}
	});

	var PGClient = function PGClient(opts) {
	  var this$1 = this;

	  this._opts = {
	    pgClientConfig: {
	      user: 'postgres',
	      database: 'crunchbase',
	      password: 'postgres',
	      connectionTimeoutMillis: 300,
	      idleTimeoutMillis: 3000
	    }
	  };

	  this.getClient = function () {
	    return this$1._client;
	  };

	  Object.assign(this._opts, opts, {});
	  this._client = new lib$1.Pool(this._opts.pgClientConfig);
	};

	/*
	 * Displays a helpful message and the source of
	 * the format when it is invalid.
	 */
	class InvalidFormatError extends Error {
	  constructor(formatFn) {
	    super(`Format functions must be synchronous taking a two arguments: (info, opts)
Found: ${formatFn.toString().split('\n')[0]}\n`);

	    Error.captureStackTrace(this, InvalidFormatError);
	  }
	}

	/*
	 * function format (formatFn)
	 * Returns a create function for the `formatFn`.
	 */
	var format = formatFn => {
	  if (formatFn.length > 2) {
	    throw new InvalidFormatError(formatFn);
	  }

	  /*
	   * function Format (options)
	   * Base prototype which calls a `_format`
	   * function and pushes the result.
	   */
	  function Format(options = {}) {
	    this.options = options;
	  }

	  Format.prototype.transform = formatFn;

	  //
	  // Create a function which returns new instances of
	  // FormatWrap for simple syntax like:
	  //
	  // require('winston').formats.json();
	  //
	  function createFormatWrap(opts) {
	    return new Format(opts);
	  }

	  //
	  // Expose the FormatWrap through the create function
	  // for testability.
	  //
	  createFormatWrap.Format = Format;
	  return createFormatWrap;
	};

	var styles_1 = createCommonjsModule(function (module) {
	/*
	The MIT License (MIT)

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var styles = {};
	module['exports'] = styles;

	var codes = {
	  reset: [0, 0],

	  bold: [1, 22],
	  dim: [2, 22],
	  italic: [3, 23],
	  underline: [4, 24],
	  inverse: [7, 27],
	  hidden: [8, 28],
	  strikethrough: [9, 29],

	  black: [30, 39],
	  red: [31, 39],
	  green: [32, 39],
	  yellow: [33, 39],
	  blue: [34, 39],
	  magenta: [35, 39],
	  cyan: [36, 39],
	  white: [37, 39],
	  gray: [90, 39],
	  grey: [90, 39],

	  brightRed: [91, 39],
	  brightGreen: [92, 39],
	  brightYellow: [93, 39],
	  brightBlue: [94, 39],
	  brightMagenta: [95, 39],
	  brightCyan: [96, 39],
	  brightWhite: [97, 39],

	  bgBlack: [40, 49],
	  bgRed: [41, 49],
	  bgGreen: [42, 49],
	  bgYellow: [43, 49],
	  bgBlue: [44, 49],
	  bgMagenta: [45, 49],
	  bgCyan: [46, 49],
	  bgWhite: [47, 49],
	  bgGray: [100, 49],
	  bgGrey: [100, 49],

	  bgBrightRed: [101, 49],
	  bgBrightGreen: [102, 49],
	  bgBrightYellow: [103, 49],
	  bgBrightBlue: [104, 49],
	  bgBrightMagenta: [105, 49],
	  bgBrightCyan: [106, 49],
	  bgBrightWhite: [107, 49],

	  // legacy styles for colors pre v1.0.0
	  blackBG: [40, 49],
	  redBG: [41, 49],
	  greenBG: [42, 49],
	  yellowBG: [43, 49],
	  blueBG: [44, 49],
	  magentaBG: [45, 49],
	  cyanBG: [46, 49],
	  whiteBG: [47, 49],

	};

	Object.keys(codes).forEach(function(key) {
	  var val = codes[key];
	  var style = styles[key] = [];
	  style.open = '\u001b[' + val[0] + 'm';
	  style.close = '\u001b[' + val[1] + 'm';
	});
	});

	/*
	MIT License

	Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	*/

	var hasFlag = function(flag, argv) {
	  argv = argv || process.argv;

	  var terminatorPos = argv.indexOf('--');
	  var prefix = /^-{1,2}/.test(flag) ? '' : '--';
	  var pos = argv.indexOf(prefix + flag);

	  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
	};

	var env = process.env;

	var forceColor = void 0;
	if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
	  forceColor = false;
	} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')
	           || hasFlag('color=always')) {
	  forceColor = true;
	}
	if ('FORCE_COLOR' in env) {
	  forceColor = env.FORCE_COLOR.length === 0
	    || parseInt(env.FORCE_COLOR, 10) !== 0;
	}

	function translateLevel(level) {
	  if (level === 0) {
	    return false;
	  }

	  return {
	    level: level,
	    hasBasic: true,
	    has256: level >= 2,
	    has16m: level >= 3,
	  };
	}

	function supportsColor(stream) {
	  if (forceColor === false) {
	    return 0;
	  }

	  if (hasFlag('color=16m') || hasFlag('color=full')
	      || hasFlag('color=truecolor')) {
	    return 3;
	  }

	  if (hasFlag('color=256')) {
	    return 2;
	  }

	  if (stream && !stream.isTTY && forceColor !== true) {
	    return 0;
	  }

	  var min = forceColor ? 1 : 0;

	  if (process.platform === 'win32') {
	    // Node.js 7.5.0 is the first version of Node.js to include a patch to
	    // libuv that enables 256 color output on Windows. Anything earlier and it
	    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
	    // release, and Node.js 7 is not. Windows 10 build 10586 is the first
	    // Windows release that supports 256 colors. Windows 10 build 14931 is the
	    // first release that supports 16m/TrueColor.
	    var osRelease = os.release().split('.');
	    if (Number(process.versions.node.split('.')[0]) >= 8
	        && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
	      return Number(osRelease[2]) >= 14931 ? 3 : 2;
	    }

	    return 1;
	  }

	  if ('CI' in env) {
	    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function(sign) {
	      return sign in env;
	    }) || env.CI_NAME === 'codeship') {
	      return 1;
	    }

	    return min;
	  }

	  if ('TEAMCITY_VERSION' in env) {
	    return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
	    );
	  }

	  if ('TERM_PROGRAM' in env) {
	    var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

	    switch (env.TERM_PROGRAM) {
	      case 'iTerm.app':
	        return version >= 3 ? 3 : 2;
	      case 'Hyper':
	        return 3;
	      case 'Apple_Terminal':
	        return 2;
	      // No default
	    }
	  }

	  if (/-256(color)?$/i.test(env.TERM)) {
	    return 2;
	  }

	  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
	    return 1;
	  }

	  if ('COLORTERM' in env) {
	    return 1;
	  }

	  if (env.TERM === 'dumb') {
	    return min;
	  }

	  return min;
	}

	function getSupportLevel(stream) {
	  var level = supportsColor(stream);
	  return translateLevel(level);
	}

	var supportsColors = {
	  supportsColor: getSupportLevel,
	  stdout: getSupportLevel(process.stdout),
	  stderr: getSupportLevel(process.stderr),
	};

	var trap = createCommonjsModule(function (module) {
	module['exports'] = function runTheTrap(text, options) {
	  var result = '';
	  text = text || 'Run the trap, drop the bass';
	  text = text.split('');
	  var trap = {
	    a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
	    b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
	    c: ['\u00a9', '\u023b', '\u03fe'],
	    d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
	    e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc',
	      '\u0a6c'],
	    f: ['\u04fa'],
	    g: ['\u0262'],
	    h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
	    i: ['\u0f0f'],
	    j: ['\u0134'],
	    k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
	    l: ['\u0139'],
	    m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
	    n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
	    o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd',
	      '\u06dd', '\u0e4f'],
	    p: ['\u01f7', '\u048e'],
	    q: ['\u09cd'],
	    r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
	    s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
	    t: ['\u0141', '\u0166', '\u0373'],
	    u: ['\u01b1', '\u054d'],
	    v: ['\u05d8'],
	    w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
	    x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
	    y: ['\u00a5', '\u04b0', '\u04cb'],
	    z: ['\u01b5', '\u0240'],
	  };
	  text.forEach(function(c) {
	    c = c.toLowerCase();
	    var chars = trap[c] || [' '];
	    var rand = Math.floor(Math.random() * chars.length);
	    if (typeof trap[c] !== 'undefined') {
	      result += trap[c][rand];
	    } else {
	      result += c;
	    }
	  });
	  return result;
	};
	});

	var zalgo = createCommonjsModule(function (module) {
	// please no
	module['exports'] = function zalgo(text, options) {
	  text = text || '   he is here   ';
	  var soul = {
	    'up': [
	      '̍', '̎', '̄', '̅',
	      '̿', '̑', '̆', '̐',
	      '͒', '͗', '͑', '̇',
	      '̈', '̊', '͂', '̓',
	      '̈', '͊', '͋', '͌',
	      '̃', '̂', '̌', '͐',
	      '̀', '́', '̋', '̏',
	      '̒', '̓', '̔', '̽',
	      '̉', 'ͣ', 'ͤ', 'ͥ',
	      'ͦ', 'ͧ', 'ͨ', 'ͩ',
	      'ͪ', 'ͫ', 'ͬ', 'ͭ',
	      'ͮ', 'ͯ', '̾', '͛',
	      '͆', '̚',
	    ],
	    'down': [
	      '̖', '̗', '̘', '̙',
	      '̜', '̝', '̞', '̟',
	      '̠', '̤', '̥', '̦',
	      '̩', '̪', '̫', '̬',
	      '̭', '̮', '̯', '̰',
	      '̱', '̲', '̳', '̹',
	      '̺', '̻', '̼', 'ͅ',
	      '͇', '͈', '͉', '͍',
	      '͎', '͓', '͔', '͕',
	      '͖', '͙', '͚', '̣',
	    ],
	    'mid': [
	      '̕', '̛', '̀', '́',
	      '͘', '̡', '̢', '̧',
	      '̨', '̴', '̵', '̶',
	      '͜', '͝', '͞',
	      '͟', '͠', '͢', '̸',
	      '̷', '͡', ' ҉',
	    ],
	  };
	  var all = [].concat(soul.up, soul.down, soul.mid);

	  function randomNumber(range) {
	    var r = Math.floor(Math.random() * range);
	    return r;
	  }

	  function isChar(character) {
	    var bool = false;
	    all.filter(function(i) {
	      bool = (i === character);
	    });
	    return bool;
	  }


	  function heComes(text, options) {
	    var result = '';
	    var counts;
	    var l;
	    options = options || {};
	    options['up'] =
	      typeof options['up'] !== 'undefined' ? options['up'] : true;
	    options['mid'] =
	      typeof options['mid'] !== 'undefined' ? options['mid'] : true;
	    options['down'] =
	      typeof options['down'] !== 'undefined' ? options['down'] : true;
	    options['size'] =
	      typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';
	    text = text.split('');
	    for (l in text) {
	      if (isChar(l)) {
	        continue;
	      }
	      result = result + text[l];
	      counts = {'up': 0, 'down': 0, 'mid': 0};
	      switch (options.size) {
	        case 'mini':
	          counts.up = randomNumber(8);
	          counts.mid = randomNumber(2);
	          counts.down = randomNumber(8);
	          break;
	        case 'maxi':
	          counts.up = randomNumber(16) + 3;
	          counts.mid = randomNumber(4) + 1;
	          counts.down = randomNumber(64) + 3;
	          break;
	        default:
	          counts.up = randomNumber(8) + 1;
	          counts.mid = randomNumber(6) / 2;
	          counts.down = randomNumber(8) + 1;
	          break;
	      }

	      var arr = ['up', 'mid', 'down'];
	      for (var d in arr) {
	        var index = arr[d];
	        for (var i = 0; i <= counts[index]; i++) {
	          if (options[index]) {
	            result = result + soul[index][randomNumber(soul[index].length)];
	          }
	        }
	      }
	    }
	    return result;
	  }
	  // don't summon him
	  return heComes(text, options);
	};
	});

	var america = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  return function(letter, i, exploded) {
	    if (letter === ' ') return letter;
	    switch (i%3) {
	      case 0: return colors.red(letter);
	      case 1: return colors.white(letter);
	      case 2: return colors.blue(letter);
	    }
	  };
	};
	});

	var zebra = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  return function(letter, i, exploded) {
	    return i % 2 === 0 ? letter : colors.inverse(letter);
	  };
	};
	});

	var rainbow = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  // RoY G BiV
	  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
	  return function(letter, i, exploded) {
	    if (letter === ' ') {
	      return letter;
	    } else {
	      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
	    }
	  };
	};
	});

	var random = createCommonjsModule(function (module) {
	module['exports'] = function(colors) {
	  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
	    'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
	    'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta'];
	  return function(letter, i, exploded) {
	    return letter === ' ' ? letter :
	      colors[
	          available[Math.round(Math.random() * (available.length - 2))]
	      ](letter);
	  };
	};
	});

	var colors_1 = createCommonjsModule(function (module) {
	/*

	The MIT License (MIT)

	Original Library
	  - Copyright (c) Marak Squires

	Additional functionality
	 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

	*/

	var colors = {};
	module['exports'] = colors;

	colors.themes = {};


	var ansiStyles = colors.styles = styles_1;
	var defineProps = Object.defineProperties;
	var newLineRegex = new RegExp(/[\r\n]+/g);

	colors.supportsColor = supportsColors.supportsColor;

	if (typeof colors.enabled === 'undefined') {
	  colors.enabled = colors.supportsColor() !== false;
	}

	colors.enable = function() {
	  colors.enabled = true;
	};

	colors.disable = function() {
	  colors.enabled = false;
	};

	colors.stripColors = colors.strip = function(str) {
	  return ('' + str).replace(/\x1B\[\d+m/g, '');
	};

	// eslint-disable-next-line no-unused-vars
	var stylize = colors.stylize = function stylize(str, style) {
	  if (!colors.enabled) {
	    return str+'';
	  }

	  var styleMap = ansiStyles[style];

	  // Stylize should work for non-ANSI styles, too
	  if(!styleMap && style in colors){
	    // Style maps like trap operate as functions on strings;
	    // they don't have properties like open or close.
	    return colors[style](str);
	  }

	  return styleMap.open + str + styleMap.close;
	};

	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	var escapeStringRegexp = function(str) {
	  if (typeof str !== 'string') {
	    throw new TypeError('Expected a string');
	  }
	  return str.replace(matchOperatorsRe, '\\$&');
	};

	function build(_styles) {
	  var builder = function builder() {
	    return applyStyle.apply(builder, arguments);
	  };
	  builder._styles = _styles;
	  // __proto__ is used because we must return a function, but there is
	  // no way to create a function with a different prototype.
	  builder.__proto__ = proto;
	  return builder;
	}

	var styles = (function() {
	  var ret = {};
	  ansiStyles.grey = ansiStyles.gray;
	  Object.keys(ansiStyles).forEach(function(key) {
	    ansiStyles[key].closeRe =
	      new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	    ret[key] = {
	      get: function() {
	        return build(this._styles.concat(key));
	      },
	    };
	  });
	  return ret;
	})();

	var proto = defineProps(function colors() {}, styles);

	function applyStyle() {
	  var args = Array.prototype.slice.call(arguments);

	  var str = args.map(function(arg) {
	    // Use weak equality check so we can colorize null/undefined in safe mode
	    if (arg != null && arg.constructor === String) {
	      return arg;
	    } else {
	      return util$4.inspect(arg);
	    }
	  }).join(' ');

	  if (!colors.enabled || !str) {
	    return str;
	  }

	  var newLinesPresent = str.indexOf('\n') != -1;

	  var nestedStyles = this._styles;

	  var i = nestedStyles.length;
	  while (i--) {
	    var code = ansiStyles[nestedStyles[i]];
	    str = code.open + str.replace(code.closeRe, code.open) + code.close;
	    if (newLinesPresent) {
	      str = str.replace(newLineRegex, function(match) {
	        return code.close + match + code.open;
	      });
	    }
	  }

	  return str;
	}

	colors.setTheme = function(theme) {
	  if (typeof theme === 'string') {
	    console.log('colors.setTheme now only accepts an object, not a string.  ' +
	      'If you are trying to set a theme from a file, it is now your (the ' +
	      'caller\'s) responsibility to require the file.  The old syntax ' +
	      'looked like colors.setTheme(__dirname + ' +
	      '\'/../themes/generic-logging.js\'); The new syntax looks like '+
	      'colors.setTheme(require(__dirname + ' +
	      '\'/../themes/generic-logging.js\'));');
	    return;
	  }
	  for (var style in theme) {
	    (function(style) {
	      colors[style] = function(str) {
	        if (typeof theme[style] === 'object') {
	          var out = str;
	          for (var i in theme[style]) {
	            out = colors[theme[style][i]](out);
	          }
	          return out;
	        }
	        return colors[theme[style]](str);
	      };
	    })(style);
	  }
	};

	function init() {
	  var ret = {};
	  Object.keys(styles).forEach(function(name) {
	    ret[name] = {
	      get: function() {
	        return build([name]);
	      },
	    };
	  });
	  return ret;
	}

	var sequencer = function sequencer(map, str) {
	  var exploded = str.split('');
	  exploded = exploded.map(map);
	  return exploded.join('');
	};

	// custom formatter methods
	colors.trap = trap;
	colors.zalgo = zalgo;

	// maps
	colors.maps = {};
	colors.maps.america = america(colors);
	colors.maps.zebra = zebra(colors);
	colors.maps.rainbow = rainbow(colors);
	colors.maps.random = random(colors);

	for (var map in colors.maps) {
	  (function(map) {
	    colors[map] = function(str) {
	      return sequencer(colors.maps[map], str);
	    };
	  })(map);
	}

	defineProps(colors, init());
	});

	var safe = createCommonjsModule(function (module) {
	//
	// Remark: Requiring this file will use the "safe" colors API,
	// which will not touch String.prototype.
	//
	//   var colors = require('colors/safe');
	//   colors.red("foo")
	//
	//

	module['exports'] = colors_1;
	});

	/**
	 * cli.js: Config that conform to commonly used CLI logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 */

	/**
	 * Default levels for the CLI configuration.
	 * @type {Object}
	 */
	var levels = {
	  error: 0,
	  warn: 1,
	  help: 2,
	  data: 3,
	  info: 4,
	  debug: 5,
	  prompt: 6,
	  verbose: 7,
	  input: 8,
	  silly: 9
	};

	/**
	 * Default colors for the CLI configuration.
	 * @type {Object}
	 */
	var colors = {
	  error: 'red',
	  warn: 'yellow',
	  help: 'cyan',
	  data: 'grey',
	  info: 'green',
	  debug: 'blue',
	  prompt: 'grey',
	  verbose: 'cyan',
	  input: 'grey',
	  silly: 'magenta'
	};

	var cli = {
		levels: levels,
		colors: colors
	};

	/**
	 * npm.js: Config that conform to npm logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 */

	/**
	 * Default levels for the npm configuration.
	 * @type {Object}
	 */
	var levels$1 = {
	  error: 0,
	  warn: 1,
	  info: 2,
	  http: 3,
	  verbose: 4,
	  debug: 5,
	  silly: 6
	};

	/**
	 * Default levels for the npm configuration.
	 * @type {Object}
	 */
	var colors$1 = {
	  error: 'red',
	  warn: 'yellow',
	  info: 'green',
	  http: 'green',
	  verbose: 'cyan',
	  debug: 'blue',
	  silly: 'magenta'
	};

	var npm = {
		levels: levels$1,
		colors: colors$1
	};

	/**
	 * syslog.js: Config that conform to syslog logging levels.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 */

	/**
	 * Default levels for the syslog configuration.
	 * @type {Object}
	 */
	var levels$2 = {
	  emerg: 0,
	  alert: 1,
	  crit: 2,
	  error: 3,
	  warning: 4,
	  notice: 5,
	  info: 6,
	  debug: 7
	};

	/**
	 * Default levels for the syslog configuration.
	 * @type {Object}
	 */
	var colors$2 = {
	  emerg: 'red',
	  alert: 'yellow',
	  crit: 'red',
	  error: 'red',
	  warning: 'red',
	  notice: 'yellow',
	  info: 'green',
	  debug: 'blue'
	};

	var syslog = {
		levels: levels$2,
		colors: colors$2
	};

	var config = createCommonjsModule(function (module, exports) {

	/**
	 * Export config set for the CLI.
	 * @type {Object}
	 */
	Object.defineProperty(exports, 'cli', {
	  value: cli
	});

	/**
	 * Export config set for npm.
	 * @type {Object}
	 */
	Object.defineProperty(exports, 'npm', {
	  value: npm
	});

	/**
	 * Export config set for the syslog.
	 * @type {Object}
	 */
	Object.defineProperty(exports, 'syslog', {
	  value: syslog
	});
	});

	var tripleBeam = createCommonjsModule(function (module, exports) {

	/**
	 * A shareable symbol constant that can be used
	 * as a non-enumerable / semi-hidden level identifier
	 * to allow the readable level property to be mutable for
	 * operations like colorization
	 *
	 * @type {Symbol}
	 */
	Object.defineProperty(exports, 'LEVEL', {
	  value: Symbol.for('level')
	});

	/**
	 * A shareable symbol constant that can be used
	 * as a non-enumerable / semi-hidden message identifier
	 * to allow the final message property to not have
	 * side effects on another.
	 *
	 * @type {Symbol}
	 */
	Object.defineProperty(exports, 'MESSAGE', {
	  value: Symbol.for('message')
	});

	/**
	 * A shareable symbol constant that can be used
	 * as a non-enumerable / semi-hidden message identifier
	 * to allow the extracted splat property be hidden
	 *
	 * @type {Symbol}
	 */
	Object.defineProperty(exports, 'SPLAT', {
	  value: Symbol.for('splat')
	});

	/**
	 * A shareable object constant  that can be used
	 * as a standard configuration for winston@3.
	 *
	 * @type {Object}
	 */
	Object.defineProperty(exports, 'configs', {
	  value: config
	});
	});

	var colorize = createCommonjsModule(function (module) {


	const { LEVEL, MESSAGE } = tripleBeam;

	//
	// Fix colors not appearing in non-tty environments
	//
	safe.enabled = true;

	/**
	 * @property {RegExp} hasSpace
	 * Simple regex to check for presence of spaces.
	 */
	const hasSpace = /\s+/;

	/*
	 * Colorizer format. Wraps the `level` and/or `message` properties
	 * of the `info` objects with ANSI color codes based on a few options.
	 */
	class Colorizer {
	  constructor(opts = {}) {
	    if (opts.colors) {
	      this.addColors(opts.colors);
	    }

	    this.options = opts;
	  }

	  /*
	   * Adds the colors Object to the set of allColors
	   * known by the Colorizer
	   *
	   * @param {Object} colors Set of color mappings to add.
	   */
	  static addColors(clrs) {
	    const nextColors = Object.keys(clrs).reduce((acc, level) => {
	      acc[level] = hasSpace.test(clrs[level])
	        ? clrs[level].split(hasSpace)
	        : clrs[level];

	      return acc;
	    }, {});

	    Colorizer.allColors = Object.assign({}, Colorizer.allColors || {}, nextColors);
	    return Colorizer.allColors;
	  }

	  /*
	   * Adds the colors Object to the set of allColors
	   * known by the Colorizer
	   *
	   * @param {Object} colors Set of color mappings to add.
	   */
	  addColors(clrs) {
	    return Colorizer.addColors(clrs);
	  }

	  /*
	   * function colorize (lookup, level, message)
	   * Performs multi-step colorization using colors/safe
	   */
	  colorize(lookup, level, message) {
	    if (typeof message === 'undefined') {
	      message = level;
	    }

	    //
	    // If the color for the level is just a string
	    // then attempt to colorize the message with it.
	    //
	    if (!Array.isArray(Colorizer.allColors[lookup])) {
	      return safe[Colorizer.allColors[lookup]](message);
	    }

	    //
	    // If it is an Array then iterate over that Array, applying
	    // the colors function for each item.
	    //
	    for (let i = 0, len = Colorizer.allColors[lookup].length; i < len; i++) {
	      message = safe[Colorizer.allColors[lookup][i]](message);
	    }

	    return message;
	  }

	  /*
	   * function transform (info, opts)
	   * Attempts to colorize the { level, message } of the given
	   * `logform` info object.
	   */
	  transform(info, opts) {
	    if (opts.all && typeof info[MESSAGE] === 'string') {
	      info[MESSAGE] = this.colorize(info[LEVEL], info.level, info[MESSAGE]);
	    }

	    if (opts.level || opts.all || !opts.message) {
	      info.level = this.colorize(info[LEVEL], info.level);
	    }

	    if (opts.all || opts.message) {
	      info.message = this.colorize(info[LEVEL], info.level, info.message);
	    }

	    return info;
	  }
	}

	/*
	 * function colorize (info)
	 * Returns a new instance of the colorize Format that applies
	 * level colors to `info` objects. This was previously exposed
	 * as { colorize: true } to transports in `winston < 3.0.0`.
	 */
	module.exports = opts => new Colorizer(opts);

	//
	// Attach the Colorizer for registration purposes
	//
	module.exports.Colorizer
	  = module.exports.Format
	  = Colorizer;
	});
	var colorize_1 = colorize.Colorizer;
	var colorize_2 = colorize.Format;

	const { Colorizer } = colorize;

	/*
	 * Simple method to register colors with a simpler require
	 * path within the module.
	 */
	var levels$3 = config => {
	  Colorizer.addColors(config.colors || config);
	  return config;
	};

	var logform = createCommonjsModule(function (module, exports) {

	/*
	 * @api public
	 * @property {function} format
	 * Both the construction method and set of exposed
	 * formats.
	 */
	const format$1 = exports.format = format;

	/*
	 * @api public
	 * @method {function} levels
	 * Registers the specified levels with logform.
	 */
	exports.levels = levels$3;

	/*
	 * @api private
	 * method {function} exposeFormat
	 * Exposes a sub-format on the main format object
	 * as a lazy-loaded getter.
	 */
	function exposeFormat(name, path) {
	  path = path || name;
	  Object.defineProperty(format$1, name, {
	    get() {
	      return require(`./${path}.js`);
	    },
	    configurable: true
	  });
	}

	//
	// Setup all transports as lazy-loaded getters.
	//
	exposeFormat('align');
	exposeFormat('errors');
	exposeFormat('cli');
	exposeFormat('combine');
	exposeFormat('colorize');
	exposeFormat('json');
	exposeFormat('label');
	exposeFormat('logstash');
	exposeFormat('metadata');
	exposeFormat('ms');
	exposeFormat('padLevels', 'pad-levels');
	exposeFormat('prettyPrint', 'pretty-print');
	exposeFormat('printf');
	exposeFormat('simple');
	exposeFormat('splat');
	exposeFormat('timestamp');
	exposeFormat('uncolorize');
	});
	var logform_1 = logform.format;
	var logform_2 = logform.levels;

	var common = createCommonjsModule(function (module, exports) {

	const { format } = util$4;

	/**
	 * Set of simple deprecation notices and a way to expose them for a set of
	 * properties.
	 * @type {Object}
	 * @private
	 */
	exports.warn = {
	  deprecated(prop) {
	    return () => {
	      throw new Error(format('{ %s } was removed in winston@3.0.0.', prop));
	    };
	  },
	  useFormat(prop) {
	    return () => {
	      throw new Error([
	        format('{ %s } was removed in winston@3.0.0.', prop),
	        'Use a custom winston.format = winston.format(function) instead.'
	      ].join('\n'));
	    };
	  },
	  forFunctions(obj, type, props) {
	    props.forEach(prop => {
	      obj[prop] = exports.warn[type](prop);
	    });
	  },
	  moved(obj, movedTo, prop) {
	    function movedNotice() {
	      return () => {
	        throw new Error([
	          format('winston.%s was moved in winston@3.0.0.', prop),
	          format('Use a winston.%s instead.', movedTo)
	        ].join('\n'));
	      };
	    }

	    Object.defineProperty(obj, prop, {
	      get: movedNotice,
	      set: movedNotice
	    });
	  },
	  forProperties(obj, type, props) {
	    props.forEach(prop => {
	      const notice = exports.warn[type](prop);
	      Object.defineProperty(obj, prop, {
	        get: notice,
	        set: notice
	      });
	    });
	  }
	};
	});
	var common_1 = common.warn;

	var _from$1 = "winston@^3.3.3";
	var _id$1 = "winston@3.3.3";
	var _inBundle$1 = false;
	var _integrity$1 = "sha512-oEXTISQnC8VlSAKf1KYSSd7J6IWuRPQqDdo8eoRNaYKLvwSb5+79Z3Yi1lrl6KDpU6/VWaxpakDAtb1oQ4n9aw==";
	var _location$1 = "/winston";
	var _phantomChildren$1 = {
	};
	var _requested$1 = {
		type: "range",
		registry: true,
		raw: "winston@^3.3.3",
		name: "winston",
		escapedName: "winston",
		rawSpec: "^3.3.3",
		saveSpec: null,
		fetchSpec: "^3.3.3"
	};
	var _requiredBy$1 = [
		"/"
	];
	var _resolved$1 = "https://registry.npmjs.org/winston/-/winston-3.3.3.tgz";
	var _shasum$1 = "ae6172042cafb29786afa3d09c8ff833ab7c9170";
	var _spec$1 = "winston@^3.3.3";
	var _where$1 = "/media/dimkk/apps21/mine/opportunity/pg-worker2";
	var author$1 = {
		name: "Charlie Robbins",
		email: "charlie.robbins@gmail.com"
	};
	var browser = "./dist/winston";
	var bugs$1 = {
		url: "https://github.com/winstonjs/winston/issues"
	};
	var bundleDependencies$1 = false;
	var dependencies$1 = {
		"@dabh/diagnostics": "^2.0.2",
		async: "^3.1.0",
		"is-stream": "^2.0.0",
		logform: "^2.2.0",
		"one-time": "^1.0.0",
		"readable-stream": "^3.4.0",
		"stack-trace": "0.0.x",
		"triple-beam": "^1.3.0",
		"winston-transport": "^4.4.0"
	};
	var deprecated$1 = false;
	var description$1 = "A logger for just about everything.";
	var devDependencies$1 = {
		"@babel/cli": "^7.10.3",
		"@babel/core": "^7.10.3",
		"@babel/preset-env": "^7.10.3",
		"@types/node": "^14.0.13",
		"abstract-winston-transport": "^0.5.1",
		assume: "^2.2.0",
		colors: "^1.4.0",
		"cross-spawn-async": "^2.2.5",
		"eslint-config-populist": "^4.2.0",
		hock: "^1.4.1",
		mocha: "^8.0.1",
		nyc: "^15.1.0",
		rimraf: "^3.0.2",
		split2: "^3.1.1",
		"std-mocks": "^1.0.1",
		through2: "^3.0.1",
		"winston-compat": "^0.1.5"
	};
	var engines$1 = {
		node: ">= 6.4.0"
	};
	var homepage$1 = "https://github.com/winstonjs/winston#readme";
	var keywords$1 = [
		"winston",
		"logger",
		"logging",
		"logs",
		"sysadmin",
		"bunyan",
		"pino",
		"loglevel",
		"tools",
		"json",
		"stream"
	];
	var license$1 = "MIT";
	var main$1 = "./lib/winston";
	var maintainers = [
		{
			name: "Jarrett Cruger",
			email: "jcrugzz@gmail.com"
		},
		{
			name: "Chris Alderson",
			email: "chrisalderson@protonmail.com"
		},
		{
			name: "David Hyde",
			email: "dabh@stanford.edu"
		}
	];
	var name$1 = "winston";
	var repository$1 = {
		type: "git",
		url: "git+https://github.com/winstonjs/winston.git"
	};
	var scripts$1 = {
		build: "rimraf dist && babel lib -d dist",
		lint: "populist lib/*.js lib/winston/*.js lib/winston/**/*.js",
		prepublishOnly: "npm run build",
		pretest: "npm run lint",
		test: "nyc --reporter=text --reporter lcov npm run test:mocha",
		"test:mocha": "mocha test/*.test.js test/**/*.test.js --exit"
	};
	var types = "./index.d.ts";
	var version$1 = "3.3.3";
	var _package$2 = {
		_from: _from$1,
		_id: _id$1,
		_inBundle: _inBundle$1,
		_integrity: _integrity$1,
		_location: _location$1,
		_phantomChildren: _phantomChildren$1,
		_requested: _requested$1,
		_requiredBy: _requiredBy$1,
		_resolved: _resolved$1,
		_shasum: _shasum$1,
		_spec: _spec$1,
		_where: _where$1,
		author: author$1,
		browser: browser,
		bugs: bugs$1,
		bundleDependencies: bundleDependencies$1,
		dependencies: dependencies$1,
		deprecated: deprecated$1,
		description: description$1,
		devDependencies: devDependencies$1,
		engines: engines$1,
		homepage: homepage$1,
		keywords: keywords$1,
		license: license$1,
		main: main$1,
		maintainers: maintainers,
		name: name$1,
		repository: repository$1,
		scripts: scripts$1,
		types: types,
		version: version$1
	};

	var _package$3 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		_from: _from$1,
		_id: _id$1,
		_inBundle: _inBundle$1,
		_integrity: _integrity$1,
		_location: _location$1,
		_phantomChildren: _phantomChildren$1,
		_requested: _requested$1,
		_requiredBy: _requiredBy$1,
		_resolved: _resolved$1,
		_shasum: _shasum$1,
		_spec: _spec$1,
		_where: _where$1,
		author: author$1,
		browser: browser,
		bugs: bugs$1,
		bundleDependencies: bundleDependencies$1,
		dependencies: dependencies$1,
		deprecated: deprecated$1,
		description: description$1,
		devDependencies: devDependencies$1,
		engines: engines$1,
		homepage: homepage$1,
		keywords: keywords$1,
		license: license$1,
		main: main$1,
		maintainers: maintainers,
		name: name$1,
		repository: repository$1,
		scripts: scripts$1,
		types: types,
		version: version$1,
		'default': _package$2
	});

	var processNextickArgs = createCommonjsModule(function (module) {

	if (typeof process === 'undefined' ||
	    !process.version ||
	    process.version.indexOf('v0.') === 0 ||
	    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
	  module.exports = { nextTick: nextTick };
	} else {
	  module.exports = process;
	}

	function nextTick(fn, arg1, arg2, arg3) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('"callback" argument must be a function');
	  }
	  var len = arguments.length;
	  var args, i;
	  switch (len) {
	  case 0:
	  case 1:
	    return process.nextTick(fn);
	  case 2:
	    return process.nextTick(function afterTickOne() {
	      fn.call(null, arg1);
	    });
	  case 3:
	    return process.nextTick(function afterTickTwo() {
	      fn.call(null, arg1, arg2);
	    });
	  case 4:
	    return process.nextTick(function afterTickThree() {
	      fn.call(null, arg1, arg2, arg3);
	    });
	  default:
	    args = new Array(len - 1);
	    i = 0;
	    while (i < args.length) {
	      args[i++] = arguments[i];
	    }
	    return process.nextTick(function afterTick() {
	      fn.apply(null, args);
	    });
	  }
	}
	});
	var processNextickArgs_1 = processNextickArgs.nextTick;

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	var isArray_1 = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	var isBoolean_1 = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	var isNull_1 = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	var isNullOrUndefined_1 = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	var isNumber_1 = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	var isString_1 = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	var isSymbol_1 = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	var isUndefined_1 = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	var isRegExp_1 = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	var isObject_1 = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	var isDate_1 = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	var isError_1 = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	var isFunction_1 = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	var isPrimitive_1 = isPrimitive;

	var isBuffer = Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	var util = {
		isArray: isArray_1,
		isBoolean: isBoolean_1,
		isNull: isNull_1,
		isNullOrUndefined: isNullOrUndefined_1,
		isNumber: isNumber_1,
		isString: isString_1,
		isSymbol: isSymbol_1,
		isUndefined: isUndefined_1,
		isRegExp: isRegExp_1,
		isObject: isObject_1,
		isDate: isDate_1,
		isError: isError_1,
		isFunction: isFunction_1,
		isPrimitive: isPrimitive_1,
		isBuffer: isBuffer
	};

	var inherits_browser = createCommonjsModule(function (module) {
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	});

	var inherits = createCommonjsModule(function (module) {
	try {
	  var util = util$4;
	  /* istanbul ignore next */
	  if (typeof util.inherits !== 'function') throw '';
	  module.exports = util.inherits;
	} catch (e) {
	  /* istanbul ignore next */
	  module.exports = inherits_browser;
	}
	});

	/**
	 * For Node.js, simply re-export the core `util.deprecate` function.
	 */

	var node = util$4.deprecate;

	var stream = stream$3;

	var safeBuffer = createCommonjsModule(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */

	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	};
	});
	var safeBuffer_1 = safeBuffer.Buffer;

	/*<replacement>*/


	/*</replacement>*/

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
	      processNextickArgs.nextTick(emitErrorNT, this, err);
	    }
	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      processNextickArgs.nextTick(emitErrorNT, _this, err);
	      if (_this._writableState) {
	        _this._writableState.errorEmitted = true;
	      }
	    } else if (cb) {
	      cb(err);
	    }
	  });

	  return this;
	}

	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}

	var destroy_1 = {
	  destroy: destroy,
	  undestroy: undestroy
	};

	var toString = {}.toString;

	var isarray = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};

	var BufferList = createCommonjsModule(function (module) {

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Buffer = safeBuffer.Buffer;


	function copyBuffer(src, target, offset) {
	  src.copy(target, offset);
	}

	module.exports = function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);

	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }

	  BufferList.prototype.push = function push(v) {
	    var entry = { data: v, next: null };
	    if (this.length > 0) this.tail.next = entry;else this.head = entry;
	    this.tail = entry;
	    ++this.length;
	  };

	  BufferList.prototype.unshift = function unshift(v) {
	    var entry = { data: v, next: this.head };
	    if (this.length === 0) this.tail = entry;
	    this.head = entry;
	    ++this.length;
	  };

	  BufferList.prototype.shift = function shift() {
	    if (this.length === 0) return;
	    var ret = this.head.data;
	    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	    --this.length;
	    return ret;
	  };

	  BufferList.prototype.clear = function clear() {
	    this.head = this.tail = null;
	    this.length = 0;
	  };

	  BufferList.prototype.join = function join(s) {
	    if (this.length === 0) return '';
	    var p = this.head;
	    var ret = '' + p.data;
	    while (p = p.next) {
	      ret += s + p.data;
	    }return ret;
	  };

	  BufferList.prototype.concat = function concat(n) {
	    if (this.length === 0) return Buffer.alloc(0);
	    if (this.length === 1) return this.head.data;
	    var ret = Buffer.allocUnsafe(n >>> 0);
	    var p = this.head;
	    var i = 0;
	    while (p) {
	      copyBuffer(p.data, ret, i);
	      i += p.data.length;
	      p = p.next;
	    }
	    return ret;
	  };

	  return BufferList;
	}();

	if (util$4 && util$4.inspect && util$4.inspect.custom) {
	  module.exports.prototype[util$4.inspect.custom] = function () {
	    var obj = util$4.inspect({ length: this.length });
	    return this.constructor.name + ' ' + obj;
	  };
	}
	});

	/*<replacement>*/

	var Buffer$1 = safeBuffer.Buffer;
	/*</replacement>*/

	var isEncoding = Buffer$1.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer$1.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	var StringDecoder_1 = StringDecoder;
	function StringDecoder(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer$1.allocUnsafe(nb);
	}

	StringDecoder.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte. If an invalid byte is detected, -2 is returned.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return byte >> 6 === 0x02 ? -1 : -2;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd';
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd';
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd';
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character is added when ending on a partial
	// character.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd';
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}

	var string_decoder = {
		StringDecoder: StringDecoder_1
	};

	/*<replacement>*/


	/*</replacement>*/

	var _stream_readable = Readable;

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	/*<replacement>*/
	var EE = events.EventEmitter;

	var EElistenerCount = function (emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$2 = safeBuffer.Buffer;
	var OurUint8Array = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer$2.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer$2.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*</replacement>*/

	/*<replacement>*/
	var util$1 = Object.create(util);
	util$1.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/

	var debug = void 0;
	if (util$4 && util$4.debuglog) {
	  debug = util$4.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/



	var StringDecoder$1;

	util$1.inherits(Readable, stream);

	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isarray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}

	function ReadableState(options, stream) {
	  Duplex = Duplex || _stream_duplex;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var readableHwm = options.readableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder$1) StringDecoder$1 = string_decoder.StringDecoder;
	    this.decoder = new StringDecoder$1(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  Duplex = Duplex || _stream_duplex;

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  stream.call(this);
	}

	Object.defineProperty(Readable.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});

	Readable.prototype.destroy = destroy_1.destroy;
	Readable.prototype._undestroy = destroy_1.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  this.push(null);
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer$2.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  return readableAddChunk(this, chunk, null, true, false);
	};

	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
	    if (er) {
	      stream.emit('error', er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer$2.prototype) {
	        chunk = _uint8ArrayToBuffer(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
	      } else if (state.ended) {
	        stream.emit('error', new Error('stream.push() after EOF'));
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
	        } else {
	          addChunk(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	    }
	  }

	  return needMoreData(state);
	}

	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    stream.emit('data', chunk);
	    stream.read(0);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}

	function chunkInvalid(state, chunk) {
	  var er;
	  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  if (!StringDecoder$1) StringDecoder$1 = string_decoder.StringDecoder;
	  this._readableState.decoder = new StringDecoder$1(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) processNextickArgs.nextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    processNextickArgs.nextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('_read() is not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) processNextickArgs.nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = { hasUnpiped: false };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, unpipeInfo);
	    }return this;
	  }

	  // try to find the right one.
	  var index = indexOf(state.pipes, dest);
	  if (index === -1) return this;

	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this, unpipeInfo);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        processNextickArgs.nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    processNextickArgs.nextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var _this = this;

	  var state = this._readableState;
	  var paused = false;

	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }

	    _this.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return this;
	};

	Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._readableState.highWaterMark;
	  }
	});

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer$2.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    processNextickArgs.nextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	/*<replacement>*/


	/*</replacement>*/

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	};
	/*</replacement>*/

	var _stream_duplex = Duplex$1;

	/*<replacement>*/
	var util$2 = Object.create(util);
	util$2.inherits = inherits;
	/*</replacement>*/




	util$2.inherits(Duplex$1, _stream_readable);

	{
	  // avoid scope creep, the keys array can then be collected
	  var keys = objectKeys(_stream_writable.prototype);
	  for (var v = 0; v < keys.length; v++) {
	    var method = keys[v];
	    if (!Duplex$1.prototype[method]) Duplex$1.prototype[method] = _stream_writable.prototype[method];
	  }
	}

	function Duplex$1(options) {
	  if (!(this instanceof Duplex$1)) return new Duplex$1(options);

	  _stream_readable.call(this, options);
	  _stream_writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	Object.defineProperty(Duplex$1.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._writableState.highWaterMark;
	  }
	});

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  processNextickArgs.nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	Object.defineProperty(Duplex$1.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	Duplex$1.prototype._destroy = function (err, cb) {
	  this.push(null);
	  this.end();

	  processNextickArgs.nextTick(cb, err);
	};

	/*<replacement>*/


	/*</replacement>*/

	var _stream_writable = Writable;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextickArgs.nextTick;
	/*</replacement>*/

	/*<replacement>*/
	var Duplex$2;
	/*</replacement>*/

	Writable.WritableState = WritableState;

	/*<replacement>*/
	var util$3 = Object.create(util);
	util$3.inherits = inherits;
	/*</replacement>*/

	/*<replacement>*/
	var internalUtil = {
	  deprecate: node
	};
	/*</replacement>*/

	/*<replacement>*/

	/*</replacement>*/

	/*<replacement>*/

	var Buffer$3 = safeBuffer.Buffer;
	var OurUint8Array$1 = commonjsGlobal.Uint8Array || function () {};
	function _uint8ArrayToBuffer$1(chunk) {
	  return Buffer$3.from(chunk);
	}
	function _isUint8Array$1(obj) {
	  return Buffer$3.isBuffer(obj) || obj instanceof OurUint8Array$1;
	}

	/*</replacement>*/



	util$3.inherits(Writable, stream);

	function nop() {}

	function WritableState(options, stream) {
	  Duplex$2 = Duplex$2 || _stream_duplex;

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex$2;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var writableHwm = options.writableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState.prototype, 'buffer', {
	      get: internalUtil.deprecate(function () {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable, Symbol.hasInstance, {
	    value: function (object) {
	      if (realHasInstance.call(this, object)) return true;
	      if (this !== Writable) return false;

	      return object && object._writableState instanceof WritableState;
	    }
	  });
	} else {
	  realHasInstance = function (object) {
	    return object instanceof this;
	  };
	}

	function Writable(options) {
	  Duplex$2 = Duplex$2 || _stream_duplex;

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex$2)) {
	    return new Writable(options);
	  }

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;

	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  processNextickArgs.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;

	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    processNextickArgs.nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array$1(chunk);

	  if (isBuf && !Buffer$3.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer$1(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer$3.from(chunk, encoding);
	  }
	  return chunk;
	}

	Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._writableState.highWaterMark;
	  }
	});

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    processNextickArgs.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    processNextickArgs.nextTick(finishMaybe, stream, state);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe(stream, state);
	  }
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	      asyncWrite(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer.allBuffers = allBuffers;

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('_write() is not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      stream.emit('error', err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe(stream, state);
	  });
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function') {
	      state.pendingcb++;
	      state.finalCalled = true;
	      processNextickArgs.nextTick(callFinal, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) processNextickArgs.nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }
	  if (state.corkedRequestsFree) {
	    state.corkedRequestsFree.next = corkReq;
	  } else {
	    state.corkedRequestsFree = corkReq;
	  }
	}

	Object.defineProperty(Writable.prototype, 'destroyed', {
	  get: function () {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});

	Writable.prototype.destroy = destroy_1.destroy;
	Writable.prototype._undestroy = destroy_1.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  this.end();
	  cb(err);
	};

	var writable = createCommonjsModule(function (module) {
	if (process.env.READABLE_STREAM === 'disable') {
	  module.exports = stream$3 && stream$3.Writable || _stream_writable;
	} else {
	  module.exports = _stream_writable;
	}
	});

	var legacy = createCommonjsModule(function (module) {


	const { LEVEL } = tripleBeam;


	/**
	 * Constructor function for the LegacyTransportStream. This is an internal
	 * wrapper `winston >= 3` uses to wrap older transports implementing
	 * log(level, message, meta).
	 * @param {Object} options - Options for this TransportStream instance.
	 * @param {Transpot} options.transport - winston@2 or older Transport to wrap.
	 */

	const LegacyTransportStream = module.exports = function LegacyTransportStream(options = {}) {
	  winstonTransport.call(this, options);
	  if (!options.transport || typeof options.transport.log !== 'function') {
	    throw new Error('Invalid transport, must be an object with a log method.');
	  }

	  this.transport = options.transport;
	  this.level = this.level || options.transport.level;
	  this.handleExceptions = this.handleExceptions || options.transport.handleExceptions;

	  // Display our deprecation notice.
	  this._deprecated();

	  // Properly bubble up errors from the transport to the
	  // LegacyTransportStream instance, but only once no matter how many times
	  // this transport is shared.
	  function transportError(err) {
	    this.emit('error', err, this.transport);
	  }

	  if (!this.transport.__winstonError) {
	    this.transport.__winstonError = transportError.bind(this);
	    this.transport.on('error', this.transport.__winstonError);
	  }
	};

	/*
	 * Inherit from TransportStream using Node.js built-ins
	 */
	util$4.inherits(LegacyTransportStream, winstonTransport);

	/**
	 * Writes the info object to our transport instance.
	 * @param {mixed} info - TODO: add param description.
	 * @param {mixed} enc - TODO: add param description.
	 * @param {function} callback - TODO: add param description.
	 * @returns {undefined}
	 * @private
	 */
	LegacyTransportStream.prototype._write = function _write(info, enc, callback) {
	  if (this.silent || (info.exception === true && !this.handleExceptions)) {
	    return callback(null);
	  }

	  // Remark: This has to be handled in the base transport now because we
	  // cannot conditionally write to our pipe targets as stream.
	  if (!this.level || this.levels[this.level] >= this.levels[info[LEVEL]]) {
	    this.transport.log(info[LEVEL], info.message, info, this._nop);
	  }

	  callback(null);
	};

	/**
	 * Writes the batch of info objects (i.e. "object chunks") to our transport
	 * instance after performing any necessary filtering.
	 * @param {mixed} chunks - TODO: add params description.
	 * @param {function} callback - TODO: add params description.
	 * @returns {mixed} - TODO: add returns description.
	 * @private
	 */
	LegacyTransportStream.prototype._writev = function _writev(chunks, callback) {
	  for (let i = 0; i < chunks.length; i++) {
	    if (this._accept(chunks[i])) {
	      this.transport.log(
	        chunks[i].chunk[LEVEL],
	        chunks[i].chunk.message,
	        chunks[i].chunk,
	        this._nop
	      );
	      chunks[i].callback();
	    }
	  }

	  return callback(null);
	};

	/**
	 * Displays a deprecation notice. Defined as a function so it can be
	 * overriden in tests.
	 * @returns {undefined}
	 */
	LegacyTransportStream.prototype._deprecated = function _deprecated() {
	  // eslint-disable-next-line no-console
	  console.error([
	    `${this.transport.name} is a legacy winston transport. Consider upgrading: `,
	    '- Upgrade docs: https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md'
	  ].join('\n'));
	};

	/**
	 * Clean up error handling state on the legacy transport associated
	 * with this instance.
	 * @returns {undefined}
	 */
	LegacyTransportStream.prototype.close = function close() {
	  if (this.transport.close) {
	    this.transport.close();
	  }

	  if (this.transport.__winstonError) {
	    this.transport.removeListener('error', this.transport.__winstonError);
	    this.transport.__winstonError = null;
	  }
	};
	});

	var winstonTransport = createCommonjsModule(function (module) {



	const { LEVEL } = tripleBeam;

	/**
	 * Constructor function for the TransportStream. This is the base prototype
	 * that all `winston >= 3` transports should inherit from.
	 * @param {Object} options - Options for this TransportStream instance
	 * @param {String} options.level - Highest level according to RFC5424.
	 * @param {Boolean} options.handleExceptions - If true, info with
	 * { exception: true } will be written.
	 * @param {Function} options.log - Custom log function for simple Transport
	 * creation
	 * @param {Function} options.close - Called on "unpipe" from parent.
	 */
	const TransportStream = module.exports = function TransportStream(options = {}) {
	  writable.call(this, { objectMode: true, highWaterMark: options.highWaterMark });

	  this.format = options.format;
	  this.level = options.level;
	  this.handleExceptions = options.handleExceptions;
	  this.handleRejections = options.handleRejections;
	  this.silent = options.silent;

	  if (options.log) this.log = options.log;
	  if (options.logv) this.logv = options.logv;
	  if (options.close) this.close = options.close;

	  // Get the levels from the source we are piped from.
	  this.once('pipe', logger => {
	    // Remark (indexzero): this bookkeeping can only support multiple
	    // Logger parents with the same `levels`. This comes into play in
	    // the `winston.Container` code in which `container.add` takes
	    // a fully realized set of options with pre-constructed TransportStreams.
	    this.levels = logger.levels;
	    this.parent = logger;
	  });

	  // If and/or when the transport is removed from this instance
	  this.once('unpipe', src => {
	    // Remark (indexzero): this bookkeeping can only support multiple
	    // Logger parents with the same `levels`. This comes into play in
	    // the `winston.Container` code in which `container.add` takes
	    // a fully realized set of options with pre-constructed TransportStreams.
	    if (src === this.parent) {
	      this.parent = null;
	      if (this.close) {
	        this.close();
	      }
	    }
	  });
	};

	/*
	 * Inherit from Writeable using Node.js built-ins
	 */
	util$4.inherits(TransportStream, writable);

	/**
	 * Writes the info object to our transport instance.
	 * @param {mixed} info - TODO: add param description.
	 * @param {mixed} enc - TODO: add param description.
	 * @param {function} callback - TODO: add param description.
	 * @returns {undefined}
	 * @private
	 */
	TransportStream.prototype._write = function _write(info, enc, callback) {
	  if (this.silent || (info.exception === true && !this.handleExceptions)) {
	    return callback(null);
	  }

	  // Remark: This has to be handled in the base transport now because we
	  // cannot conditionally write to our pipe targets as stream. We always
	  // prefer any explicit level set on the Transport itself falling back to
	  // any level set on the parent.
	  const level = this.level || (this.parent && this.parent.level);

	  if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
	    if (info && !this.format) {
	      return this.log(info, callback);
	    }

	    let errState;
	    let transformed;

	    // We trap(and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      transformed = this.format.transform(Object.assign({}, info), this.format.options);
	    } catch (err) {
	      errState = err;
	    }

	    if (errState || !transformed) {
	      // eslint-disable-next-line callback-return
	      callback();
	      if (errState) throw errState;
	      return;
	    }

	    return this.log(transformed, callback);
	  }

	  return callback(null);
	};

	/**
	 * Writes the batch of info objects (i.e. "object chunks") to our transport
	 * instance after performing any necessary filtering.
	 * @param {mixed} chunks - TODO: add params description.
	 * @param {function} callback - TODO: add params description.
	 * @returns {mixed} - TODO: add returns description.
	 * @private
	 */
	TransportStream.prototype._writev = function _writev(chunks, callback) {
	  if (this.logv) {
	    const infos = chunks.filter(this._accept, this);
	    if (!infos.length) {
	      return callback(null);
	    }

	    // Remark (indexzero): from a performance perspective if Transport
	    // implementers do choose to implement logv should we make it their
	    // responsibility to invoke their format?
	    return this.logv(infos, callback);
	  }

	  for (let i = 0; i < chunks.length; i++) {
	    if (!this._accept(chunks[i])) continue;

	    if (chunks[i].chunk && !this.format) {
	      this.log(chunks[i].chunk, chunks[i].callback);
	      continue;
	    }

	    let errState;
	    let transformed;

	    // We trap(and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      transformed = this.format.transform(
	        Object.assign({}, chunks[i].chunk),
	        this.format.options
	      );
	    } catch (err) {
	      errState = err;
	    }

	    if (errState || !transformed) {
	      // eslint-disable-next-line callback-return
	      chunks[i].callback();
	      if (errState) {
	        // eslint-disable-next-line callback-return
	        callback(null);
	        throw errState;
	      }
	    } else {
	      this.log(transformed, chunks[i].callback);
	    }
	  }

	  return callback(null);
	};

	/**
	 * Predicate function that returns true if the specfied `info` on the
	 * WriteReq, `write`, should be passed down into the derived
	 * TransportStream's I/O via `.log(info, callback)`.
	 * @param {WriteReq} write - winston@3 Node.js WriteReq for the `info` object
	 * representing the log message.
	 * @returns {Boolean} - Value indicating if the `write` should be accepted &
	 * logged.
	 */
	TransportStream.prototype._accept = function _accept(write) {
	  const info = write.chunk;
	  if (this.silent) {
	    return false;
	  }

	  // We always prefer any explicit level set on the Transport itself
	  // falling back to any level set on the parent.
	  const level = this.level || (this.parent && this.parent.level);

	  // Immediately check the average case: log level filtering.
	  if (
	    info.exception === true ||
	    !level ||
	    this.levels[level] >= this.levels[info[LEVEL]]
	  ) {
	    // Ensure the info object is valid based on `{ exception }`:
	    // 1. { handleExceptions: true }: all `info` objects are valid
	    // 2. { exception: false }: accepted by all transports.
	    if (this.handleExceptions || info.exception !== true) {
	      return true;
	    }
	  }

	  return false;
	};

	/**
	 * _nop is short for "No operation"
	 * @returns {Boolean} Intentionally false.
	 */
	TransportStream.prototype._nop = function _nop() {
	  // eslint-disable-next-line no-undefined
	  return void undefined;
	};


	// Expose legacy stream
	module.exports.LegacyTransportStream = legacy;
	});
	var winstonTransport_1 = winstonTransport.LegacyTransportStream;

	const { LEVEL, MESSAGE } = tripleBeam;


	/**
	 * Transport for outputting to the console.
	 * @type {Console}
	 * @extends {TransportStream}
	 */
	var console_1 = class Console extends winstonTransport {
	  /**
	   * Constructor function for the Console transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    // Expose the name of this Transport on the prototype
	    this.name = options.name || 'console';
	    this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
	    this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
	    this.eol = options.eol || os.EOL;

	    this.setMaxListeners(30);
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    setImmediate(() => this.emit('logged', info));

	    // Remark: what if there is no raw...?
	    if (this.stderrLevels[info[LEVEL]]) {
	      if (console._stderr) {
	        // Node.js maps `process.stderr` to `console._stderr`.
	        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
	      } else {
	        // console.error adds a newline
	        console.error(info[MESSAGE]);
	      }

	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    } else if (this.consoleWarnLevels[info[LEVEL]]) {
	      if (console._stderr) {
	        // Node.js maps `process.stderr` to `console._stderr`.
	        // in Node.js console.warn is an alias for console.error
	        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
	      } else {
	        // console.warn adds a newline
	        console.warn(info[MESSAGE]);
	      }

	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    }

	    if (console._stdout) {
	      // Node.js maps `process.stdout` to `console._stdout`.
	      console._stdout.write(`${info[MESSAGE]}${this.eol}`);
	    } else {
	      // console.log adds a newline.
	      console.log(info[MESSAGE]);
	    }

	    if (callback) {
	      callback(); // eslint-disable-line callback-return
	    }
	  }

	  /**
	   * Returns a Set-like object with strArray's elements as keys (each with the
	   * value true).
	   * @param {Array} strArray - Array of Set-elements as strings.
	   * @param {?string} [errMsg] - Custom error message thrown on invalid input.
	   * @returns {Object} - TODO: add return description.
	   * @private
	   */
	  _stringArrayToSet(strArray, errMsg) {
	    if (!strArray)
	      return {};

	    errMsg = errMsg || 'Cannot make set from type other than Array of string elements';

	    if (!Array.isArray(strArray)) {
	      throw new Error(errMsg);
	    }

	    return strArray.reduce((set, el) =>  {
	      if (typeof el !== 'string') {
	        throw new Error(errMsg);
	      }
	      set[el] = true;

	      return set;
	    }, {});
	  }
	};

	var isArrayLike_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = isArrayLike;
	function isArrayLike(value) {
	    return value && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
	}
	module.exports = exports['default'];
	});

	unwrapExports(isArrayLike_1);

	var initialParams = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (fn) {
	    return function (...args /*, callback*/) {
	        var callback = args.pop();
	        return fn.call(this, args, callback);
	    };
	};

	module.exports = exports["default"];
	});

	unwrapExports(initialParams);

	var setImmediate_1 = createCommonjsModule(function (module, exports) {
	/* istanbul ignore file */

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fallback = fallback;
	exports.wrap = wrap;
	var hasSetImmediate = exports.hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
	var hasNextTick = exports.hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

	function fallback(fn) {
	    setTimeout(fn, 0);
	}

	function wrap(defer) {
	    return (fn, ...args) => defer(() => fn(...args));
	}

	var _defer;

	if (hasSetImmediate) {
	    _defer = setImmediate;
	} else if (hasNextTick) {
	    _defer = process.nextTick;
	} else {
	    _defer = fallback;
	}

	exports.default = wrap(_defer);
	});

	unwrapExports(setImmediate_1);
	var setImmediate_2 = setImmediate_1.fallback;
	var setImmediate_3 = setImmediate_1.wrap;
	var setImmediate_4 = setImmediate_1.hasSetImmediate;
	var setImmediate_5 = setImmediate_1.hasNextTick;

	var asyncify_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = asyncify;



	var _initialParams2 = _interopRequireDefault(initialParams);



	var _setImmediate2 = _interopRequireDefault(setImmediate_1);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Take a sync function and make it async, passing its return value to a
	 * callback. This is useful for plugging sync functions into a waterfall,
	 * series, or other async functions. Any arguments passed to the generated
	 * function will be passed to the wrapped function (except for the final
	 * callback argument). Errors thrown will be passed to the callback.
	 *
	 * If the function passed to `asyncify` returns a Promise, that promises's
	 * resolved/rejected state will be used to call the callback, rather than simply
	 * the synchronous return value.
	 *
	 * This also means you can asyncify ES2017 `async` functions.
	 *
	 * @name asyncify
	 * @static
	 * @memberOf module:Utils
	 * @method
	 * @alias wrapSync
	 * @category Util
	 * @param {Function} func - The synchronous function, or Promise-returning
	 * function to convert to an {@link AsyncFunction}.
	 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
	 * invoked with `(args..., callback)`.
	 * @example
	 *
	 * // passing a regular synchronous function
	 * async.waterfall([
	 *     async.apply(fs.readFile, filename, "utf8"),
	 *     async.asyncify(JSON.parse),
	 *     function (data, next) {
	 *         // data is the result of parsing the text.
	 *         // If there was a parsing error, it would have been caught.
	 *     }
	 * ], callback);
	 *
	 * // passing a function returning a promise
	 * async.waterfall([
	 *     async.apply(fs.readFile, filename, "utf8"),
	 *     async.asyncify(function (contents) {
	 *         return db.model.create(contents);
	 *     }),
	 *     function (model, next) {
	 *         // `model` is the instantiated model object.
	 *         // If there was an error, this function would be skipped.
	 *     }
	 * ], callback);
	 *
	 * // es2017 example, though `asyncify` is not needed if your JS environment
	 * // supports async functions out of the box
	 * var q = async.queue(async.asyncify(async function(file) {
	 *     var intermediateStep = await processFile(file);
	 *     return await somePromise(intermediateStep)
	 * }));
	 *
	 * q.push(files);
	 */
	function asyncify(func) {
	    if ((0, wrapAsync_1.isAsync)(func)) {
	        return function (...args /*, callback*/) {
	            const callback = args.pop();
	            const promise = func.apply(this, args);
	            return handlePromise(promise, callback);
	        };
	    }

	    return (0, _initialParams2.default)(function (args, callback) {
	        var result;
	        try {
	            result = func.apply(this, args);
	        } catch (e) {
	            return callback(e);
	        }
	        // if result is Promise object
	        if (result && typeof result.then === 'function') {
	            return handlePromise(result, callback);
	        } else {
	            callback(null, result);
	        }
	    });
	}

	function handlePromise(promise, callback) {
	    return promise.then(value => {
	        invokeCallback(callback, null, value);
	    }, err => {
	        invokeCallback(callback, err && err.message ? err : new Error(err));
	    });
	}

	function invokeCallback(callback, error, value) {
	    try {
	        callback(error, value);
	    } catch (err) {
	        (0, _setImmediate2.default)(e => {
	            throw e;
	        }, err);
	    }
	}
	module.exports = exports['default'];
	});

	unwrapExports(asyncify_1);

	var wrapAsync_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.isAsyncIterable = exports.isAsyncGenerator = exports.isAsync = undefined;



	var _asyncify2 = _interopRequireDefault(asyncify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function isAsync(fn) {
	    return fn[Symbol.toStringTag] === 'AsyncFunction';
	}

	function isAsyncGenerator(fn) {
	    return fn[Symbol.toStringTag] === 'AsyncGenerator';
	}

	function isAsyncIterable(obj) {
	    return typeof obj[Symbol.asyncIterator] === 'function';
	}

	function wrapAsync(asyncFn) {
	    if (typeof asyncFn !== 'function') throw new Error('expected a function');
	    return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
	}

	exports.default = wrapAsync;
	exports.isAsync = isAsync;
	exports.isAsyncGenerator = isAsyncGenerator;
	exports.isAsyncIterable = isAsyncIterable;
	});

	unwrapExports(wrapAsync_1);
	var wrapAsync_2 = wrapAsync_1.isAsyncIterable;
	var wrapAsync_3 = wrapAsync_1.isAsyncGenerator;
	var wrapAsync_4 = wrapAsync_1.isAsync;

	var awaitify_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = awaitify;
	// conditionally promisify a function.
	// only return a promise if a callback is omitted
	function awaitify(asyncFn, arity = asyncFn.length) {
	    if (!arity) throw new Error('arity is undefined');
	    function awaitable(...args) {
	        if (typeof args[arity - 1] === 'function') {
	            return asyncFn.apply(this, args);
	        }

	        return new Promise((resolve, reject) => {
	            args[arity - 1] = (err, ...cbArgs) => {
	                if (err) return reject(err);
	                resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
	            };
	            asyncFn.apply(this, args);
	        });
	    }

	    return awaitable;
	}
	module.exports = exports['default'];
	});

	unwrapExports(awaitify_1);

	var parallel = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});



	var _isArrayLike2 = _interopRequireDefault(isArrayLike_1);



	var _wrapAsync2 = _interopRequireDefault(wrapAsync_1);



	var _awaitify2 = _interopRequireDefault(awaitify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = (0, _awaitify2.default)((eachfn, tasks, callback) => {
	    var results = (0, _isArrayLike2.default)(tasks) ? [] : {};

	    eachfn(tasks, (task, key, taskCb) => {
	        (0, _wrapAsync2.default)(task)((err, ...result) => {
	            if (result.length < 2) {
	                [result] = result;
	            }
	            results[key] = result;
	            taskCb(err);
	        });
	    }, err => callback(err, results));
	}, 3);
	module.exports = exports['default'];
	});

	unwrapExports(parallel);

	var once_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = once;
	function once(fn) {
	    function wrapper(...args) {
	        if (fn === null) return;
	        var callFn = fn;
	        fn = null;
	        callFn.apply(this, args);
	    }
	    Object.assign(wrapper, fn);
	    return wrapper;
	}
	module.exports = exports["default"];
	});

	unwrapExports(once_1);

	var getIterator = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports.default = function (coll) {
	    return coll[Symbol.iterator] && coll[Symbol.iterator]();
	};

	module.exports = exports["default"];
	});

	unwrapExports(getIterator);

	var iterator = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createIterator;



	var _isArrayLike2 = _interopRequireDefault(isArrayLike_1);



	var _getIterator2 = _interopRequireDefault(getIterator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createArrayIterator(coll) {
	    var i = -1;
	    var len = coll.length;
	    return function next() {
	        return ++i < len ? { value: coll[i], key: i } : null;
	    };
	}

	function createES2015Iterator(iterator) {
	    var i = -1;
	    return function next() {
	        var item = iterator.next();
	        if (item.done) return null;
	        i++;
	        return { value: item.value, key: i };
	    };
	}

	function createObjectIterator(obj) {
	    var okeys = obj ? Object.keys(obj) : [];
	    var i = -1;
	    var len = okeys.length;
	    return function next() {
	        var key = okeys[++i];
	        return i < len ? { value: obj[key], key } : null;
	    };
	}

	function createIterator(coll) {
	    if ((0, _isArrayLike2.default)(coll)) {
	        return createArrayIterator(coll);
	    }

	    var iterator = (0, _getIterator2.default)(coll);
	    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
	}
	module.exports = exports['default'];
	});

	unwrapExports(iterator);

	var onlyOnce_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = onlyOnce;
	function onlyOnce(fn) {
	    return function (...args) {
	        if (fn === null) throw new Error("Callback was already called.");
	        var callFn = fn;
	        fn = null;
	        callFn.apply(this, args);
	    };
	}
	module.exports = exports["default"];
	});

	unwrapExports(onlyOnce_1);

	var breakLoop_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// A temporary value used to identify if the loop should be broken.
	// See #1064, #1293
	const breakLoop = {};
	exports.default = breakLoop;
	module.exports = exports["default"];
	});

	unwrapExports(breakLoop_1);

	var asyncEachOfLimit_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = asyncEachOfLimit;



	var _breakLoop2 = _interopRequireDefault(breakLoop_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// for async generators
	function asyncEachOfLimit(generator, limit, iteratee, callback) {
	    let done = false;
	    let canceled = false;
	    let awaiting = false;
	    let running = 0;
	    let idx = 0;

	    function replenish() {
	        //console.log('replenish')
	        if (running >= limit || awaiting || done) return;
	        //console.log('replenish awaiting')
	        awaiting = true;
	        generator.next().then(({ value, done: iterDone }) => {
	            //console.log('got value', value)
	            if (canceled || done) return;
	            awaiting = false;
	            if (iterDone) {
	                done = true;
	                if (running <= 0) {
	                    //console.log('done nextCb')
	                    callback(null);
	                }
	                return;
	            }
	            running++;
	            iteratee(value, idx, iterateeCallback);
	            idx++;
	            replenish();
	        }).catch(handleError);
	    }

	    function iterateeCallback(err, result) {
	        //console.log('iterateeCallback')
	        running -= 1;
	        if (canceled) return;
	        if (err) return handleError(err);

	        if (err === false) {
	            done = true;
	            canceled = true;
	            return;
	        }

	        if (result === _breakLoop2.default || done && running <= 0) {
	            done = true;
	            //console.log('done iterCb')
	            return callback(null);
	        }
	        replenish();
	    }

	    function handleError(err) {
	        if (canceled) return;
	        awaiting = false;
	        done = true;
	        callback(err);
	    }

	    replenish();
	}
	module.exports = exports['default'];
	});

	unwrapExports(asyncEachOfLimit_1);

	var eachOfLimit = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});



	var _once2 = _interopRequireDefault(once_1);



	var _iterator2 = _interopRequireDefault(iterator);



	var _onlyOnce2 = _interopRequireDefault(onlyOnce_1);





	var _asyncEachOfLimit2 = _interopRequireDefault(asyncEachOfLimit_1);



	var _breakLoop2 = _interopRequireDefault(breakLoop_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = limit => {
	    return (obj, iteratee, callback) => {
	        callback = (0, _once2.default)(callback);
	        if (limit <= 0) {
	            throw new RangeError('concurrency limit cannot be less than 1');
	        }
	        if (!obj) {
	            return callback(null);
	        }
	        if ((0, wrapAsync_1.isAsyncGenerator)(obj)) {
	            return (0, _asyncEachOfLimit2.default)(obj, limit, iteratee, callback);
	        }
	        if ((0, wrapAsync_1.isAsyncIterable)(obj)) {
	            return (0, _asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](), limit, iteratee, callback);
	        }
	        var nextElem = (0, _iterator2.default)(obj);
	        var done = false;
	        var canceled = false;
	        var running = 0;
	        var looping = false;

	        function iterateeCallback(err, value) {
	            if (canceled) return;
	            running -= 1;
	            if (err) {
	                done = true;
	                callback(err);
	            } else if (err === false) {
	                done = true;
	                canceled = true;
	            } else if (value === _breakLoop2.default || done && running <= 0) {
	                done = true;
	                return callback(null);
	            } else if (!looping) {
	                replenish();
	            }
	        }

	        function replenish() {
	            looping = true;
	            while (running < limit && !done) {
	                var elem = nextElem();
	                if (elem === null) {
	                    done = true;
	                    if (running <= 0) {
	                        callback(null);
	                    }
	                    return;
	                }
	                running += 1;
	                iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
	            }
	            looping = false;
	        }

	        replenish();
	    };
	};

	module.exports = exports['default'];
	});

	unwrapExports(eachOfLimit);

	var eachOfLimit_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});



	var _eachOfLimit3 = _interopRequireDefault(eachOfLimit);



	var _wrapAsync2 = _interopRequireDefault(wrapAsync_1);



	var _awaitify2 = _interopRequireDefault(awaitify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
	 * time.
	 *
	 * @name eachOfLimit
	 * @static
	 * @memberOf module:Collections
	 * @method
	 * @see [async.eachOf]{@link module:Collections.eachOf}
	 * @alias forEachOfLimit
	 * @category Collection
	 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
	 * @param {number} limit - The maximum number of async operations at a time.
	 * @param {AsyncFunction} iteratee - An async function to apply to each
	 * item in `coll`. The `key` is the item's key, or index in the case of an
	 * array.
	 * Invoked with (item, key, callback).
	 * @param {Function} [callback] - A callback which is called when all
	 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
	 * @returns {Promise} a promise, if a callback is omitted
	 */
	function eachOfLimit$1(coll, limit, iteratee, callback) {
	  return (0, _eachOfLimit3.default)(limit)(coll, (0, _wrapAsync2.default)(iteratee), callback);
	}

	exports.default = (0, _awaitify2.default)(eachOfLimit$1, 4);
	module.exports = exports['default'];
	});

	unwrapExports(eachOfLimit_1);

	var eachOfSeries_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});



	var _eachOfLimit2 = _interopRequireDefault(eachOfLimit_1);



	var _awaitify2 = _interopRequireDefault(awaitify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
	 *
	 * @name eachOfSeries
	 * @static
	 * @memberOf module:Collections
	 * @method
	 * @see [async.eachOf]{@link module:Collections.eachOf}
	 * @alias forEachOfSeries
	 * @category Collection
	 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
	 * @param {AsyncFunction} iteratee - An async function to apply to each item in
	 * `coll`.
	 * Invoked with (item, key, callback).
	 * @param {Function} [callback] - A callback which is called when all `iteratee`
	 * functions have finished, or an error occurs. Invoked with (err).
	 * @returns {Promise} a promise, if a callback is omitted
	 */
	function eachOfSeries(coll, iteratee, callback) {
	  return (0, _eachOfLimit2.default)(coll, 1, iteratee, callback);
	}
	exports.default = (0, _awaitify2.default)(eachOfSeries, 3);
	module.exports = exports['default'];
	});

	unwrapExports(eachOfSeries_1);

	var series_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = series;



	var _parallel3 = _interopRequireDefault(parallel);



	var _eachOfSeries2 = _interopRequireDefault(eachOfSeries_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Run the functions in the `tasks` collection in series, each one running once
	 * the previous function has completed. If any functions in the series pass an
	 * error to its callback, no more functions are run, and `callback` is
	 * immediately called with the value of the error. Otherwise, `callback`
	 * receives an array of results when `tasks` have completed.
	 *
	 * It is also possible to use an object instead of an array. Each property will
	 * be run as a function, and the results will be passed to the final `callback`
	 * as an object instead of an array. This can be a more readable way of handling
	 *  results from {@link async.series}.
	 *
	 * **Note** that while many implementations preserve the order of object
	 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
	 * explicitly states that
	 *
	 * > The mechanics and order of enumerating the properties is not specified.
	 *
	 * So if you rely on the order in which your series of functions are executed,
	 * and want this to work on all platforms, consider using an array.
	 *
	 * @name series
	 * @static
	 * @memberOf module:ControlFlow
	 * @method
	 * @category Control Flow
	 * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing
	 * [async functions]{@link AsyncFunction} to run in series.
	 * Each function can complete with any number of optional `result` values.
	 * @param {Function} [callback] - An optional callback to run once all the
	 * functions have completed. This function gets a results array (or object)
	 * containing all the result arguments passed to the `task` callbacks. Invoked
	 * with (err, result).
	 * @return {Promise} a promise, if no callback is passed
	 * @example
	 * async.series([
	 *     function(callback) {
	 *         // do some stuff ...
	 *         callback(null, 'one');
	 *     },
	 *     function(callback) {
	 *         // do some more stuff ...
	 *         callback(null, 'two');
	 *     }
	 * ],
	 * // optional callback
	 * function(err, results) {
	 *     // results is now equal to ['one', 'two']
	 * });
	 *
	 * async.series({
	 *     one: function(callback) {
	 *         setTimeout(function() {
	 *             callback(null, 1);
	 *         }, 200);
	 *     },
	 *     two: function(callback){
	 *         setTimeout(function() {
	 *             callback(null, 2);
	 *         }, 100);
	 *     }
	 * }, function(err, results) {
	 *     // results is now equal to: {one: 1, two: 2}
	 * });
	 */
	function series(tasks, callback) {
	  return (0, _parallel3.default)(_eachOfSeries2.default, tasks, callback);
	}
	module.exports = exports['default'];
	});

	unwrapExports(series_1);

	var stream$1 = stream$3;

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	var Buffer$4 = buffer.Buffer;

	var inspect = util$4.inspect;

	var custom = inspect && inspect.custom || 'inspect';

	function copyBuffer(src, target, offset) {
	  Buffer$4.prototype.copy.call(src, target, offset);
	}

	var buffer_list =
	/*#__PURE__*/
	function () {
	  function BufferList() {
	    _classCallCheck(this, BufferList);

	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }

	  _createClass(BufferList, [{
	    key: "push",
	    value: function push(v) {
	      var entry = {
	        data: v,
	        next: null
	      };
	      if (this.length > 0) this.tail.next = entry;else this.head = entry;
	      this.tail = entry;
	      ++this.length;
	    }
	  }, {
	    key: "unshift",
	    value: function unshift(v) {
	      var entry = {
	        data: v,
	        next: this.head
	      };
	      if (this.length === 0) this.tail = entry;
	      this.head = entry;
	      ++this.length;
	    }
	  }, {
	    key: "shift",
	    value: function shift() {
	      if (this.length === 0) return;
	      var ret = this.head.data;
	      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	      --this.length;
	      return ret;
	    }
	  }, {
	    key: "clear",
	    value: function clear() {
	      this.head = this.tail = null;
	      this.length = 0;
	    }
	  }, {
	    key: "join",
	    value: function join(s) {
	      if (this.length === 0) return '';
	      var p = this.head;
	      var ret = '' + p.data;

	      while (p = p.next) {
	        ret += s + p.data;
	      }

	      return ret;
	    }
	  }, {
	    key: "concat",
	    value: function concat(n) {
	      if (this.length === 0) return Buffer$4.alloc(0);
	      var ret = Buffer$4.allocUnsafe(n >>> 0);
	      var p = this.head;
	      var i = 0;

	      while (p) {
	        copyBuffer(p.data, ret, i);
	        i += p.data.length;
	        p = p.next;
	      }

	      return ret;
	    } // Consumes a specified amount of bytes or characters from the buffered data.

	  }, {
	    key: "consume",
	    value: function consume(n, hasStrings) {
	      var ret;

	      if (n < this.head.data.length) {
	        // `slice` is the same for buffers and strings.
	        ret = this.head.data.slice(0, n);
	        this.head.data = this.head.data.slice(n);
	      } else if (n === this.head.data.length) {
	        // First chunk is a perfect match.
	        ret = this.shift();
	      } else {
	        // Result spans more than one buffer.
	        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
	      }

	      return ret;
	    }
	  }, {
	    key: "first",
	    value: function first() {
	      return this.head.data;
	    } // Consumes a specified amount of characters from the buffered data.

	  }, {
	    key: "_getString",
	    value: function _getString(n) {
	      var p = this.head;
	      var c = 1;
	      var ret = p.data;
	      n -= ret.length;

	      while (p = p.next) {
	        var str = p.data;
	        var nb = n > str.length ? str.length : n;
	        if (nb === str.length) ret += str;else ret += str.slice(0, n);
	        n -= nb;

	        if (n === 0) {
	          if (nb === str.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = str.slice(nb);
	          }

	          break;
	        }

	        ++c;
	      }

	      this.length -= c;
	      return ret;
	    } // Consumes a specified amount of bytes from the buffered data.

	  }, {
	    key: "_getBuffer",
	    value: function _getBuffer(n) {
	      var ret = Buffer$4.allocUnsafe(n);
	      var p = this.head;
	      var c = 1;
	      p.data.copy(ret);
	      n -= p.data.length;

	      while (p = p.next) {
	        var buf = p.data;
	        var nb = n > buf.length ? buf.length : n;
	        buf.copy(ret, ret.length - n, 0, nb);
	        n -= nb;

	        if (n === 0) {
	          if (nb === buf.length) {
	            ++c;
	            if (p.next) this.head = p.next;else this.head = this.tail = null;
	          } else {
	            this.head = p;
	            p.data = buf.slice(nb);
	          }

	          break;
	        }

	        ++c;
	      }

	      this.length -= c;
	      return ret;
	    } // Make sure the linked list only shows the minimal necessary information.

	  }, {
	    key: custom,
	    value: function value(_, options) {
	      return inspect(this, _objectSpread({}, options, {
	        // Only inspect one level.
	        depth: 0,
	        // It should not recurse.
	        customInspect: false
	      }));
	    }
	  }]);

	  return BufferList;
	}();

	function destroy$1(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      if (!this._writableState) {
	        process.nextTick(emitErrorNT$1, this, err);
	      } else if (!this._writableState.errorEmitted) {
	        this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorNT$1, this, err);
	      }
	    }

	    return this;
	  } // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks


	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  } // if this is a duplex stream mark the writable part as destroyed as well


	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      if (!_this._writableState) {
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else if (!_this._writableState.errorEmitted) {
	        _this._writableState.errorEmitted = true;
	        process.nextTick(emitErrorAndCloseNT, _this, err);
	      } else {
	        process.nextTick(emitCloseNT, _this);
	      }
	    } else if (cb) {
	      process.nextTick(emitCloseNT, _this);
	      cb(err);
	    } else {
	      process.nextTick(emitCloseNT, _this);
	    }
	  });

	  return this;
	}

	function emitErrorAndCloseNT(self, err) {
	  emitErrorNT$1(self, err);
	  emitCloseNT(self);
	}

	function emitCloseNT(self) {
	  if (self._writableState && !self._writableState.emitClose) return;
	  if (self._readableState && !self._readableState.emitClose) return;
	  self.emit('close');
	}

	function undestroy$1() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finalCalled = false;
	    this._writableState.prefinished = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT$1(self, err) {
	  self.emit('error', err);
	}

	function errorOrDestroy(stream, err) {
	  // We have tests that rely on errors being emitted
	  // in the same tick, so changing this is semver major.
	  // For now when you opt-in to autoDestroy we allow
	  // the error to be emitted nextTick. In a future
	  // semver major update we should change the default to this.
	  var rState = stream._readableState;
	  var wState = stream._writableState;
	  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
	}

	var destroy_1$1 = {
	  destroy: destroy$1,
	  undestroy: undestroy$1,
	  errorOrDestroy: errorOrDestroy
	};

	const codes = {};

	function createErrorType(code, message, Base) {
	  if (!Base) {
	    Base = Error;
	  }

	  function getMessage (arg1, arg2, arg3) {
	    if (typeof message === 'string') {
	      return message
	    } else {
	      return message(arg1, arg2, arg3)
	    }
	  }

	  class NodeError extends Base {
	    constructor (arg1, arg2, arg3) {
	      super(getMessage(arg1, arg2, arg3));
	    }
	  }

	  NodeError.prototype.name = Base.name;
	  NodeError.prototype.code = code;

	  codes[code] = NodeError;
	}

	// https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js
	function oneOf(expected, thing) {
	  if (Array.isArray(expected)) {
	    const len = expected.length;
	    expected = expected.map((i) => String(i));
	    if (len > 2) {
	      return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` +
	             expected[len - 1];
	    } else if (len === 2) {
	      return `one of ${thing} ${expected[0]} or ${expected[1]}`;
	    } else {
	      return `of ${thing} ${expected[0]}`;
	    }
	  } else {
	    return `of ${thing} ${String(expected)}`;
	  }
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
	function startsWith(str, search, pos) {
		return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
	function endsWith(str, search, this_len) {
		if (this_len === undefined || this_len > str.length) {
			this_len = str.length;
		}
		return str.substring(this_len - search.length, this_len) === search;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	function includes(str, search, start) {
	  if (typeof start !== 'number') {
	    start = 0;
	  }

	  if (start + search.length > str.length) {
	    return false;
	  } else {
	    return str.indexOf(search, start) !== -1;
	  }
	}

	createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
	  return 'The value "' + value + '" is invalid for option "' + name + '"'
	}, TypeError);
	createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
	  // determiner: 'must be' or 'must not be'
	  let determiner;
	  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
	    determiner = 'must not be';
	    expected = expected.replace(/^not /, '');
	  } else {
	    determiner = 'must be';
	  }

	  let msg;
	  if (endsWith(name, ' argument')) {
	    // For cases like 'first argument'
	    msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
	  } else {
	    const type = includes(name, '.') ? 'property' : 'argument';
	    msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
	  }

	  msg += `. Received type ${typeof actual}`;
	  return msg;
	}, TypeError);
	createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
	createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
	  return 'The ' + name + ' method is not implemented'
	});
	createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
	createErrorType('ERR_STREAM_DESTROYED', function (name) {
	  return 'Cannot call ' + name + ' after a stream was destroyed';
	});
	createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
	createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
	createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
	createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
	createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
	  return 'Unknown encoding: ' + arg
	}, TypeError);
	createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');

	var codes_1 = codes;

	var errors = {
		codes: codes_1
	};

	var ERR_INVALID_OPT_VALUE = errors.codes.ERR_INVALID_OPT_VALUE;

	function highWaterMarkFrom(options, isDuplex, duplexKey) {
	  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
	}

	function getHighWaterMark(state, options, duplexKey, isDuplex) {
	  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

	  if (hwm != null) {
	    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
	      var name = isDuplex ? duplexKey : 'highWaterMark';
	      throw new ERR_INVALID_OPT_VALUE(name, hwm);
	    }

	    return Math.floor(hwm);
	  } // Default value


	  return state.objectMode ? 16 : 16 * 1024;
	}

	var state = {
	  getHighWaterMark: getHighWaterMark
	};

	var _stream_writable$1 = Writable$1;
	// there will be only 2 of these for each stream


	function CorkedRequest$1(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;

	  this.finish = function () {
	    onCorkedFinish$1(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/


	var Duplex$3;
	/*</replacement>*/

	Writable$1.WritableState = WritableState$1;
	/*<replacement>*/

	var internalUtil$1 = {
	  deprecate: node
	};
	/*</replacement>*/

	/*<replacement>*/


	/*</replacement>*/


	var Buffer$5 = buffer.Buffer;

	var OurUint8Array$2 = commonjsGlobal.Uint8Array || function () {};

	function _uint8ArrayToBuffer$2(chunk) {
	  return Buffer$5.from(chunk);
	}

	function _isUint8Array$2(obj) {
	  return Buffer$5.isBuffer(obj) || obj instanceof OurUint8Array$2;
	}



	var getHighWaterMark$1 = state.getHighWaterMark;

	var _require$codes = errors.codes,
	    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
	    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
	    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
	    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
	    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
	    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
	    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
	    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

	var errorOrDestroy$1 = destroy_1$1.errorOrDestroy;

	inherits(Writable$1, stream$1);

	function nop$1() {}

	function WritableState$1(options, stream, isDuplex) {
	  Duplex$3 = Duplex$3 || _stream_duplex$1;
	  options = options || {}; // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream,
	  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex$3; // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.

	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()

	  this.highWaterMark = getHighWaterMark$1(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

	  this.finalCalled = false; // drain event flag.

	  this.needDrain = false; // at the start of calling end()

	  this.ending = false; // when end() has been called, and returned

	  this.ended = false; // when 'finish' is emitted

	  this.finished = false; // has it been destroyed

	  this.destroyed = false; // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.

	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.

	  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.

	  this.length = 0; // a flag to see when we're in the middle of a write.

	  this.writing = false; // when true all writes will be buffered until .uncork() call

	  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.

	  this.sync = true; // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.

	  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

	  this.onwrite = function (er) {
	    onwrite$1(stream, er);
	  }; // the callback that the user supplies to write(chunk,encoding,cb)


	  this.writecb = null; // the amount that is being written when _write is called.

	  this.writelen = 0;
	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted

	  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams

	  this.prefinished = false; // True if the error was already emitted and should not be thrown again

	  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

	  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

	  this.autoDestroy = !!options.autoDestroy; // count buffered requests

	  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two

	  this.corkedRequestsFree = new CorkedRequest$1(this);
	}

	WritableState$1.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];

	  while (current) {
	    out.push(current);
	    current = current.next;
	  }

	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState$1.prototype, 'buffer', {
	      get: internalUtil$1.deprecate(function writableStateBufferGetter() {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})(); // Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.


	var realHasInstance$1;

	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance$1 = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable$1, Symbol.hasInstance, {
	    value: function value(object) {
	      if (realHasInstance$1.call(this, object)) return true;
	      if (this !== Writable$1) return false;
	      return object && object._writableState instanceof WritableState$1;
	    }
	  });
	} else {
	  realHasInstance$1 = function realHasInstance(object) {
	    return object instanceof this;
	  };
	}

	function Writable$1(options) {
	  Duplex$3 = Duplex$3 || _stream_duplex$1; // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.
	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the WritableState constructor, at least with V8 6.5

	  var isDuplex = this instanceof Duplex$3;
	  if (!isDuplex && !realHasInstance$1.call(Writable$1, this)) return new Writable$1(options);
	  this._writableState = new WritableState$1(options, this, isDuplex); // legacy.

	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;
	    if (typeof options.writev === 'function') this._writev = options.writev;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  stream$1.call(this);
	} // Otherwise people can pipe Writable streams, which is just wrong.


	Writable$1.prototype.pipe = function () {
	  errorOrDestroy$1(this, new ERR_STREAM_CANNOT_PIPE());
	};

	function writeAfterEnd$1(stream, cb) {
	  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

	  errorOrDestroy$1(stream, er);
	  process.nextTick(cb, er);
	} // Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.


	function validChunk$1(stream, state, chunk, cb) {
	  var er;

	  if (chunk === null) {
	    er = new ERR_STREAM_NULL_VALUES();
	  } else if (typeof chunk !== 'string' && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
	  }

	  if (er) {
	    errorOrDestroy$1(stream, er);
	    process.nextTick(cb, er);
	    return false;
	  }

	  return true;
	}

	Writable$1.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  var isBuf = !state.objectMode && _isUint8Array$2(chunk);

	  if (isBuf && !Buffer$5.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer$2(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
	  if (typeof cb !== 'function') cb = nop$1;
	  if (state.ending) writeAfterEnd$1(this, cb);else if (isBuf || validChunk$1(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer$1(this, state, isBuf, chunk, encoding, cb);
	  }
	  return ret;
	};

	Writable$1.prototype.cork = function () {
	  this._writableState.corked++;
	};

	Writable$1.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;
	    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer$1(this, state);
	  }
	};

	Writable$1.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	Object.defineProperty(Writable$1.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});

	function decodeChunk$1(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer$5.from(chunk, encoding);
	  }

	  return chunk;
	}

	Object.defineProperty(Writable$1.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	}); // if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.

	function writeOrBuffer$1(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk$1(state, chunk, encoding);

	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }

	  var len = state.objectMode ? 1 : chunk.length;
	  state.length += len;
	  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };

	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }

	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite$1(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite$1(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError$1(stream, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    process.nextTick(cb, er); // this can emit finish, and it will always happen
	    // after error

	    process.nextTick(finishMaybe$1, stream, state);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy$1(stream, er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    errorOrDestroy$1(stream, er); // this can emit finish, but finish must
	    // always follow error

	    finishMaybe$1(stream, state);
	  }
	}

	function onwriteStateUpdate$1(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite$1(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;
	  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
	  onwriteStateUpdate$1(state);
	  if (er) onwriteError$1(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish$1(state) || stream.destroyed;

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer$1(stream, state);
	    }

	    if (sync) {
	      process.nextTick(afterWrite$1, stream, state, finished, cb);
	    } else {
	      afterWrite$1(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite$1(stream, state, finished, cb) {
	  if (!finished) onwriteDrain$1(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe$1(stream, state);
	} // Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.


	function onwriteDrain$1(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	} // if there's something in the buffer waiting, then process it


	function clearBuffer$1(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;
	    var count = 0;
	    var allBuffers = true;

	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }

	    buffer.allBuffers = allBuffers;
	    doWrite$1(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite

	    state.pendingcb++;
	    state.lastBufferedRequest = null;

	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest$1(state);
	    }

	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;
	      doWrite$1(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.

	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable$1.prototype._write = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
	};

	Writable$1.prototype._writev = null;

	Writable$1.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  } // ignore unnecessary end() calls.


	  if (!state.ending) endWritable$1(this, state, cb);
	  return this;
	};

	Object.defineProperty(Writable$1.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	});

	function needFinish$1(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}

	function callFinal$1(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;

	    if (err) {
	      errorOrDestroy$1(stream, err);
	    }

	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe$1(stream, state);
	  });
	}

	function prefinish$1(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function' && !state.destroyed) {
	      state.pendingcb++;
	      state.finalCalled = true;
	      process.nextTick(callFinal$1, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}

	function finishMaybe$1(stream, state) {
	  var need = needFinish$1(state);

	  if (need) {
	    prefinish$1(stream, state);

	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');

	      if (state.autoDestroy) {
	        // In case of duplex streams we need a way to detect
	        // if the readable side is ready for autoDestroy as well
	        var rState = stream._readableState;

	        if (!rState || rState.autoDestroy && rState.endEmitted) {
	          stream.destroy();
	        }
	      }
	    }
	  }

	  return need;
	}

	function endWritable$1(stream, state, cb) {
	  state.ending = true;
	  finishMaybe$1(stream, state);

	  if (cb) {
	    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
	  }

	  state.ended = true;
	  stream.writable = false;
	}

	function onCorkedFinish$1(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;

	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  } // reuse the free corkReq.


	  state.corkedRequestsFree.next = corkReq;
	}

	Object.defineProperty(Writable$1.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._writableState === undefined) {
	      return false;
	    }

	    return this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    } // backward compatibility, the user is explicitly
	    // managing destroyed


	    this._writableState.destroyed = value;
	  }
	});
	Writable$1.prototype.destroy = destroy_1$1.destroy;
	Writable$1.prototype._undestroy = destroy_1$1.undestroy;

	Writable$1.prototype._destroy = function (err, cb) {
	  cb(err);
	};

	/*<replacement>*/

	var objectKeys$1 = Object.keys || function (obj) {
	  var keys = [];

	  for (var key in obj) {
	    keys.push(key);
	  }

	  return keys;
	};
	/*</replacement>*/


	var _stream_duplex$1 = Duplex$4;





	inherits(Duplex$4, _stream_readable$1);

	{
	  // Allow the keys array to be GC'ed.
	  var keys$1 = objectKeys$1(_stream_writable$1.prototype);

	  for (var v$1 = 0; v$1 < keys$1.length; v$1++) {
	    var method$1 = keys$1[v$1];
	    if (!Duplex$4.prototype[method$1]) Duplex$4.prototype[method$1] = _stream_writable$1.prototype[method$1];
	  }
	}

	function Duplex$4(options) {
	  if (!(this instanceof Duplex$4)) return new Duplex$4(options);
	  _stream_readable$1.call(this, options);
	  _stream_writable$1.call(this, options);
	  this.allowHalfOpen = true;

	  if (options) {
	    if (options.readable === false) this.readable = false;
	    if (options.writable === false) this.writable = false;

	    if (options.allowHalfOpen === false) {
	      this.allowHalfOpen = false;
	      this.once('end', onend$1);
	    }
	  }
	}

	Object.defineProperty(Duplex$4.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.highWaterMark;
	  }
	});
	Object.defineProperty(Duplex$4.prototype, 'writableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState && this._writableState.getBuffer();
	  }
	});
	Object.defineProperty(Duplex$4.prototype, 'writableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._writableState.length;
	  }
	}); // the no-half-open enforcer

	function onend$1() {
	  // If the writable side ended, then we're ok.
	  if (this._writableState.ended) return; // no more data can be written.
	  // But allow more writes to happen in this tick.

	  process.nextTick(onEndNT$1, this);
	}

	function onEndNT$1(self) {
	  self.end();
	}

	Object.defineProperty(Duplex$4.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }

	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    } // backward compatibility, the user is explicitly
	    // managing destroyed


	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	var safeBuffer$1 = createCommonjsModule(function (module, exports) {
	/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
	/* eslint-disable node/no-deprecated-api */

	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.prototype = Object.create(Buffer.prototype);

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	};
	});
	var safeBuffer_1$1 = safeBuffer$1.Buffer;

	/*<replacement>*/

	var Buffer$6 = safeBuffer$1.Buffer;
	/*</replacement>*/

	var isEncoding$1 = Buffer$6.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding$1(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding$1(enc) {
	  var nenc = _normalizeEncoding$1(enc);
	  if (typeof nenc !== 'string' && (Buffer$6.isEncoding === isEncoding$1 || !isEncoding$1(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	var StringDecoder_1$1 = StringDecoder$2;
	function StringDecoder$2(encoding) {
	  this.encoding = normalizeEncoding$1(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text$1;
	      this.end = utf16End$1;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast$1;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text$1;
	      this.end = base64End$1;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite$1;
	      this.end = simpleEnd$1;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer$6.allocUnsafe(nb);
	}

	StringDecoder$2.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder$2.prototype.end = utf8End$1;

	// Returns only complete characters in a Buffer
	StringDecoder$2.prototype.text = utf8Text$1;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder$2.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte. If an invalid byte is detected, -2 is returned.
	function utf8CheckByte$1(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return byte >> 6 === 0x02 ? -1 : -2;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete$1(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte$1(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte$1(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte$1(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes$1(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd';
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd';
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd';
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast$1(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes$1(this, buf);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text$1(buf, i) {
	  var total = utf8CheckIncomplete$1(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character is added when ending on a partial
	// character.
	function utf8End$1(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd';
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text$1(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End$1(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text$1(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End$1(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite$1(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd$1(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}

	var string_decoder$1 = {
		StringDecoder: StringDecoder_1$1
	};

	var ERR_STREAM_PREMATURE_CLOSE = errors.codes.ERR_STREAM_PREMATURE_CLOSE;

	function once(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    callback.apply(this, args);
	  };
	}

	function noop() {}

	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}

	function eos(stream, opts, callback) {
	  if (typeof opts === 'function') return eos(stream, null, opts);
	  if (!opts) opts = {};
	  callback = once(callback || noop);
	  var readable = opts.readable || opts.readable !== false && stream.readable;
	  var writable = opts.writable || opts.writable !== false && stream.writable;

	  var onlegacyfinish = function onlegacyfinish() {
	    if (!stream.writable) onfinish();
	  };

	  var writableEnded = stream._writableState && stream._writableState.finished;

	  var onfinish = function onfinish() {
	    writable = false;
	    writableEnded = true;
	    if (!readable) callback.call(stream);
	  };

	  var readableEnded = stream._readableState && stream._readableState.endEmitted;

	  var onend = function onend() {
	    readable = false;
	    readableEnded = true;
	    if (!writable) callback.call(stream);
	  };

	  var onerror = function onerror(err) {
	    callback.call(stream, err);
	  };

	  var onclose = function onclose() {
	    var err;

	    if (readable && !readableEnded) {
	      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }

	    if (writable && !writableEnded) {
	      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
	      return callback.call(stream, err);
	    }
	  };

	  var onrequest = function onrequest() {
	    stream.req.on('finish', onfinish);
	  };

	  if (isRequest(stream)) {
	    stream.on('complete', onfinish);
	    stream.on('abort', onclose);
	    if (stream.req) onrequest();else stream.on('request', onrequest);
	  } else if (writable && !stream._writableState) {
	    // legacy streams
	    stream.on('end', onlegacyfinish);
	    stream.on('close', onlegacyfinish);
	  }

	  stream.on('end', onend);
	  stream.on('finish', onfinish);
	  if (opts.error !== false) stream.on('error', onerror);
	  stream.on('close', onclose);
	  return function () {
	    stream.removeListener('complete', onfinish);
	    stream.removeListener('abort', onclose);
	    stream.removeListener('request', onrequest);
	    if (stream.req) stream.req.removeListener('finish', onfinish);
	    stream.removeListener('end', onlegacyfinish);
	    stream.removeListener('close', onlegacyfinish);
	    stream.removeListener('finish', onfinish);
	    stream.removeListener('end', onend);
	    stream.removeListener('error', onerror);
	    stream.removeListener('close', onclose);
	  };
	}

	var endOfStream = eos;

	var _Object$setPrototypeO;

	function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



	var kLastResolve = Symbol('lastResolve');
	var kLastReject = Symbol('lastReject');
	var kError = Symbol('error');
	var kEnded = Symbol('ended');
	var kLastPromise = Symbol('lastPromise');
	var kHandlePromise = Symbol('handlePromise');
	var kStream = Symbol('stream');

	function createIterResult(value, done) {
	  return {
	    value: value,
	    done: done
	  };
	}

	function readAndResolve(iter) {
	  var resolve = iter[kLastResolve];

	  if (resolve !== null) {
	    var data = iter[kStream].read(); // we defer if data is null
	    // we can be expecting either 'end' or
	    // 'error'

	    if (data !== null) {
	      iter[kLastPromise] = null;
	      iter[kLastResolve] = null;
	      iter[kLastReject] = null;
	      resolve(createIterResult(data, false));
	    }
	  }
	}

	function onReadable(iter) {
	  // we wait for the next tick, because it might
	  // emit an error with process.nextTick
	  process.nextTick(readAndResolve, iter);
	}

	function wrapForNext(lastPromise, iter) {
	  return function (resolve, reject) {
	    lastPromise.then(function () {
	      if (iter[kEnded]) {
	        resolve(createIterResult(undefined, true));
	        return;
	      }

	      iter[kHandlePromise](resolve, reject);
	    }, reject);
	  };
	}

	var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
	var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
	  get stream() {
	    return this[kStream];
	  },

	  next: function next() {
	    var _this = this;

	    // if we have detected an error in the meanwhile
	    // reject straight away
	    var error = this[kError];

	    if (error !== null) {
	      return Promise.reject(error);
	    }

	    if (this[kEnded]) {
	      return Promise.resolve(createIterResult(undefined, true));
	    }

	    if (this[kStream].destroyed) {
	      // We need to defer via nextTick because if .destroy(err) is
	      // called, the error will be emitted via nextTick, and
	      // we cannot guarantee that there is no error lingering around
	      // waiting to be emitted.
	      return new Promise(function (resolve, reject) {
	        process.nextTick(function () {
	          if (_this[kError]) {
	            reject(_this[kError]);
	          } else {
	            resolve(createIterResult(undefined, true));
	          }
	        });
	      });
	    } // if we have multiple next() calls
	    // we will wait for the previous Promise to finish
	    // this logic is optimized to support for await loops,
	    // where next() is only called once at a time


	    var lastPromise = this[kLastPromise];
	    var promise;

	    if (lastPromise) {
	      promise = new Promise(wrapForNext(lastPromise, this));
	    } else {
	      // fast path needed to support multiple this.push()
	      // without triggering the next() queue
	      var data = this[kStream].read();

	      if (data !== null) {
	        return Promise.resolve(createIterResult(data, false));
	      }

	      promise = new Promise(this[kHandlePromise]);
	    }

	    this[kLastPromise] = promise;
	    return promise;
	  }
	}, _defineProperty$1(_Object$setPrototypeO, Symbol.asyncIterator, function () {
	  return this;
	}), _defineProperty$1(_Object$setPrototypeO, "return", function _return() {
	  var _this2 = this;

	  // destroy(err, cb) is a private API
	  // we can guarantee we have that here, because we control the
	  // Readable class this is attached to
	  return new Promise(function (resolve, reject) {
	    _this2[kStream].destroy(null, function (err) {
	      if (err) {
	        reject(err);
	        return;
	      }

	      resolve(createIterResult(undefined, true));
	    });
	  });
	}), _Object$setPrototypeO), AsyncIteratorPrototype);

	var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
	  var _Object$create;

	  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty$1(_Object$create, kStream, {
	    value: stream,
	    writable: true
	  }), _defineProperty$1(_Object$create, kLastResolve, {
	    value: null,
	    writable: true
	  }), _defineProperty$1(_Object$create, kLastReject, {
	    value: null,
	    writable: true
	  }), _defineProperty$1(_Object$create, kError, {
	    value: null,
	    writable: true
	  }), _defineProperty$1(_Object$create, kEnded, {
	    value: stream._readableState.endEmitted,
	    writable: true
	  }), _defineProperty$1(_Object$create, kHandlePromise, {
	    value: function value(resolve, reject) {
	      var data = iterator[kStream].read();

	      if (data) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        resolve(createIterResult(data, false));
	      } else {
	        iterator[kLastResolve] = resolve;
	        iterator[kLastReject] = reject;
	      }
	    },
	    writable: true
	  }), _Object$create));
	  iterator[kLastPromise] = null;
	  endOfStream(stream, function (err) {
	    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
	      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
	      // returned by next() and store the error

	      if (reject !== null) {
	        iterator[kLastPromise] = null;
	        iterator[kLastResolve] = null;
	        iterator[kLastReject] = null;
	        reject(err);
	      }

	      iterator[kError] = err;
	      return;
	    }

	    var resolve = iterator[kLastResolve];

	    if (resolve !== null) {
	      iterator[kLastPromise] = null;
	      iterator[kLastResolve] = null;
	      iterator[kLastReject] = null;
	      resolve(createIterResult(undefined, true));
	    }

	    iterator[kEnded] = true;
	  });
	  stream.on('readable', onReadable.bind(null, iterator));
	  return iterator;
	};

	var async_iterator = createReadableStreamAsyncIterator;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

	function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var ERR_INVALID_ARG_TYPE$1 = errors.codes.ERR_INVALID_ARG_TYPE;

	function from(Readable, iterable, opts) {
	  var iterator;

	  if (iterable && typeof iterable.next === 'function') {
	    iterator = iterable;
	  } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();else throw new ERR_INVALID_ARG_TYPE$1('iterable', ['Iterable'], iterable);

	  var readable = new Readable(_objectSpread$1({
	    objectMode: true
	  }, opts)); // Reading boolean to protect against _read
	  // being called before last iteration completion.

	  var reading = false;

	  readable._read = function () {
	    if (!reading) {
	      reading = true;
	      next();
	    }
	  };

	  function next() {
	    return _next2.apply(this, arguments);
	  }

	  function _next2() {
	    _next2 = _asyncToGenerator(function* () {
	      try {
	        var _ref = yield iterator.next(),
	            value = _ref.value,
	            done = _ref.done;

	        if (done) {
	          readable.push(null);
	        } else if (readable.push((yield value))) {
	          next();
	        } else {
	          reading = false;
	        }
	      } catch (err) {
	        readable.destroy(err);
	      }
	    });
	    return _next2.apply(this, arguments);
	  }

	  return readable;
	}

	var from_1 = from;

	var _stream_readable$1 = Readable$1;
	/*<replacement>*/

	var Duplex$5;
	/*</replacement>*/

	Readable$1.ReadableState = ReadableState$1;
	/*<replacement>*/

	var EE$1 = events.EventEmitter;

	var EElistenerCount$1 = function EElistenerCount(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/



	/*</replacement>*/


	var Buffer$7 = buffer.Buffer;

	var OurUint8Array$3 = commonjsGlobal.Uint8Array || function () {};

	function _uint8ArrayToBuffer$3(chunk) {
	  return Buffer$7.from(chunk);
	}

	function _isUint8Array$3(obj) {
	  return Buffer$7.isBuffer(obj) || obj instanceof OurUint8Array$3;
	}
	/*<replacement>*/




	var debug$1;

	if (util$4 && util$4.debuglog) {
	  debug$1 = util$4.debuglog('stream');
	} else {
	  debug$1 = function debug() {};
	}
	/*</replacement>*/






	var getHighWaterMark$2 = state.getHighWaterMark;

	var _require$codes$1 = errors.codes,
	    ERR_INVALID_ARG_TYPE$2 = _require$codes$1.ERR_INVALID_ARG_TYPE,
	    ERR_STREAM_PUSH_AFTER_EOF = _require$codes$1.ERR_STREAM_PUSH_AFTER_EOF,
	    ERR_METHOD_NOT_IMPLEMENTED$1 = _require$codes$1.ERR_METHOD_NOT_IMPLEMENTED,
	    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes$1.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


	var StringDecoder$3;
	var createReadableStreamAsyncIterator$1;
	var from$1;

	inherits(Readable$1, stream$1);

	var errorOrDestroy$2 = destroy_1$1.errorOrDestroy;
	var kProxyEvents$1 = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener$1(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.

	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}

	function ReadableState$1(options, stream, isDuplex) {
	  Duplex$5 = Duplex$5 || _stream_duplex$1;
	  options = options || {}; // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.

	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex$5; // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away

	  this.objectMode = !!options.objectMode;
	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"

	  this.highWaterMark = getHighWaterMark$2(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()

	  this.buffer = new buffer_list();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.

	  this.sync = true; // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.

	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;
	  this.paused = true; // Should close be emitted on destroy. Defaults to true.

	  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

	  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

	  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.

	  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

	  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

	  this.readingMore = false;
	  this.decoder = null;
	  this.encoding = null;

	  if (options.encoding) {
	    if (!StringDecoder$3) StringDecoder$3 = string_decoder$1.StringDecoder;
	    this.decoder = new StringDecoder$3(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable$1(options) {
	  Duplex$5 = Duplex$5 || _stream_duplex$1;
	  if (!(this instanceof Readable$1)) return new Readable$1(options); // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the ReadableState constructor, at least with V8 6.5

	  var isDuplex = this instanceof Duplex$5;
	  this._readableState = new ReadableState$1(options, this, isDuplex); // legacy

	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  stream$1.call(this);
	}

	Object.defineProperty(Readable$1.prototype, 'destroyed', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    if (this._readableState === undefined) {
	      return false;
	    }

	    return this._readableState.destroyed;
	  },
	  set: function set(value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    } // backward compatibility, the user is explicitly
	    // managing destroyed


	    this._readableState.destroyed = value;
	  }
	});
	Readable$1.prototype.destroy = destroy_1$1.destroy;
	Readable$1.prototype._undestroy = destroy_1$1.undestroy;

	Readable$1.prototype._destroy = function (err, cb) {
	  cb(err);
	}; // Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.


	Readable$1.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;

	      if (encoding !== state.encoding) {
	        chunk = Buffer$7.from(chunk, encoding);
	        encoding = '';
	      }

	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk$1(this, chunk, encoding, false, skipChunkCheck);
	}; // Unshift should *always* be something directly out of read()


	Readable$1.prototype.unshift = function (chunk) {
	  return readableAddChunk$1(this, chunk, null, true, false);
	};

	function readableAddChunk$1(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  debug$1('readableAddChunk', chunk);
	  var state = stream._readableState;

	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk$1(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid$1(state, chunk);

	    if (er) {
	      errorOrDestroy$2(stream, er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer$7.prototype) {
	        chunk = _uint8ArrayToBuffer$3(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) errorOrDestroy$2(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk$1(stream, state, chunk, true);
	      } else if (state.ended) {
	        errorOrDestroy$2(stream, new ERR_STREAM_PUSH_AFTER_EOF());
	      } else if (state.destroyed) {
	        return false;
	      } else {
	        state.reading = false;

	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk$1(stream, state, chunk, false);else maybeReadMore$1(stream, state);
	        } else {
	          addChunk$1(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	      maybeReadMore$1(stream, state);
	    }
	  } // We can push more data if we are below the highWaterMark.
	  // Also, if we have no data yet, we can stand some more bytes.
	  // This is to work around cases where hwm=0, such as the repl.


	  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
	}

	function addChunk$1(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    state.awaitDrain = 0;
	    stream.emit('data', chunk);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
	    if (state.needReadable) emitReadable$1(stream);
	  }

	  maybeReadMore$1(stream, state);
	}

	function chunkInvalid$1(state, chunk) {
	  var er;

	  if (!_isUint8Array$3(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new ERR_INVALID_ARG_TYPE$2('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
	  }

	  return er;
	}

	Readable$1.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	}; // backwards compatibility.


	Readable$1.prototype.setEncoding = function (enc) {
	  if (!StringDecoder$3) StringDecoder$3 = string_decoder$1.StringDecoder;
	  var decoder = new StringDecoder$3(enc);
	  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

	  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

	  var p = this._readableState.buffer.head;
	  var content = '';

	  while (p !== null) {
	    content += decoder.write(p.data);
	    p = p.next;
	  }

	  this._readableState.buffer.clear();

	  if (content !== '') this._readableState.buffer.push(content);
	  this._readableState.length = content.length;
	  return this;
	}; // Don't raise the hwm > 1GB


	var MAX_HWM$1 = 0x40000000;

	function computeNewHighWaterMark$1(n) {
	  if (n >= MAX_HWM$1) {
	    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
	    n = MAX_HWM$1;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }

	  return n;
	} // This function is designed to be inlinable, so please take care when making
	// changes to the function body.


	function howMuchToRead$1(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;

	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  } // If we're asking for more than the current hwm, then raise the hwm.


	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark$1(n);
	  if (n <= state.length) return n; // Don't have enough

	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }

	  return state.length;
	} // you can override either this method, or the async _read(n) below.


	Readable$1.prototype.read = function (n) {
	  debug$1('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;
	  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.

	  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
	    debug$1('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable$1(this);else emitReadable$1(this);
	    return null;
	  }

	  n = howMuchToRead$1(n, state); // if we've ended, and we're now clear, then finish it up.

	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable$1(this);
	    return null;
	  } // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.
	  // if we need a readable event, then we need to do some reading.


	  var doRead = state.needReadable;
	  debug$1('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug$1('length less than watermark', doRead);
	  } // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.


	  if (state.ended || state.reading) {
	    doRead = false;
	    debug$1('reading or ended', doRead);
	  } else if (doRead) {
	    debug$1('do read');
	    state.reading = true;
	    state.sync = true; // if the length is currently zero, then we *need* a readable event.

	    if (state.length === 0) state.needReadable = true; // call internal read method

	    this._read(state.highWaterMark);

	    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.

	    if (!state.reading) n = howMuchToRead$1(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList$1(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = state.length <= state.highWaterMark;
	    n = 0;
	  } else {
	    state.length -= n;
	    state.awaitDrain = 0;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

	    if (nOrig !== n && state.ended) endReadable$1(this);
	  }

	  if (ret !== null) this.emit('data', ret);
	  return ret;
	};

	function onEofChunk$1(stream, state) {
	  debug$1('onEofChunk');
	  if (state.ended) return;

	  if (state.decoder) {
	    var chunk = state.decoder.end();

	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }

	  state.ended = true;

	  if (state.sync) {
	    // if we are sync, wait until next tick to emit the data.
	    // Otherwise we risk emitting data in the flow()
	    // the readable code triggers during a read() call
	    emitReadable$1(stream);
	  } else {
	    // emit 'readable' now to make sure it gets picked up.
	    state.needReadable = false;

	    if (!state.emittedReadable) {
	      state.emittedReadable = true;
	      emitReadable_$1(stream);
	    }
	  }
	} // Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.


	function emitReadable$1(stream) {
	  var state = stream._readableState;
	  debug$1('emitReadable', state.needReadable, state.emittedReadable);
	  state.needReadable = false;

	  if (!state.emittedReadable) {
	    debug$1('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    process.nextTick(emitReadable_$1, stream);
	  }
	}

	function emitReadable_$1(stream) {
	  var state = stream._readableState;
	  debug$1('emitReadable_', state.destroyed, state.length, state.ended);

	  if (!state.destroyed && (state.length || state.ended)) {
	    stream.emit('readable');
	    state.emittedReadable = false;
	  } // The stream needs another readable event if
	  // 1. It is not flowing, as the flow mechanism will take
	  //    care of it.
	  // 2. It is not ended.
	  // 3. It is below the highWaterMark, so we can schedule
	  //    another readable later.


	  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
	  flow$1(stream);
	} // at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.


	function maybeReadMore$1(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(maybeReadMore_$1, stream, state);
	  }
	}

	function maybeReadMore_$1(stream, state) {
	  // Attempt to read more data if we should.
	  //
	  // The conditions for reading more data are (one of):
	  // - Not enough data buffered (state.length < state.highWaterMark). The loop
	  //   is responsible for filling the buffer with enough data if such data
	  //   is available. If highWaterMark is 0 and we are not in the flowing mode
	  //   we should _not_ attempt to buffer any extra data. We'll get more data
	  //   when the stream consumer calls read() instead.
	  // - No data in the buffer, and the stream is in flowing mode. In this mode
	  //   the loop below is responsible for ensuring read() is called. Failing to
	  //   call read here would abort the flow and there's no other mechanism for
	  //   continuing the flow if the stream consumer has just subscribed to the
	  //   'data' event.
	  //
	  // In addition to the above conditions to keep reading data, the following
	  // conditions prevent the data from being read:
	  // - The stream has ended (state.ended).
	  // - There is already a pending 'read' operation (state.reading). This is a
	  //   case where the the stream has called the implementation defined _read()
	  //   method, but they are processing the call asynchronously and have _not_
	  //   called push() with new data. In this case we skip performing more
	  //   read()s. The execution ends in this method again after the _read() ends
	  //   up calling push() with more data.
	  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
	    var len = state.length;
	    debug$1('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length) // didn't get any data, stop spinning.
	      break;
	  }

	  state.readingMore = false;
	} // abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.


	Readable$1.prototype._read = function (n) {
	  errorOrDestroy$2(this, new ERR_METHOD_NOT_IMPLEMENTED$1('_read()'));
	};

	Readable$1.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;

	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;

	    default:
	      state.pipes.push(dest);
	      break;
	  }

	  state.pipesCount += 1;
	  debug$1('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
	  dest.on('unpipe', onunpipe);

	  function onunpipe(readable, unpipeInfo) {
	    debug$1('onunpipe');

	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug$1('onend');
	    dest.end();
	  } // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.


	  var ondrain = pipeOnDrain$1(src);
	  dest.on('drain', ondrain);
	  var cleanedUp = false;

	  function cleanup() {
	    debug$1('cleanup'); // cleanup event handlers once the pipe is broken

	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);
	    cleanedUp = true; // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.

	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  src.on('data', ondata);

	  function ondata(chunk) {
	    debug$1('ondata');
	    var ret = dest.write(chunk);
	    debug$1('dest.write', ret);

	    if (ret === false) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf$1(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug$1('false write response, pause', state.awaitDrain);
	        state.awaitDrain++;
	      }

	      src.pause();
	    }
	  } // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.


	  function onerror(er) {
	    debug$1('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount$1(dest, 'error') === 0) errorOrDestroy$2(dest, er);
	  } // Make sure our error handler is attached before userland ones.


	  prependListener$1(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }

	  dest.once('close', onclose);

	  function onfinish() {
	    debug$1('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }

	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug$1('unpipe');
	    src.unpipe(dest);
	  } // tell the dest that it's being piped to


	  dest.emit('pipe', src); // start the flow if it hasn't been started already.

	  if (!state.flowing) {
	    debug$1('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain$1(src) {
	  return function pipeOnDrainFunctionResult() {
	    var state = src._readableState;
	    debug$1('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;

	    if (state.awaitDrain === 0 && EElistenerCount$1(src, 'data')) {
	      state.flowing = true;
	      flow$1(src);
	    }
	  };
	}

	Readable$1.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = {
	    hasUnpiped: false
	  }; // if we're not piping anywhere, then do nothing.

	  if (state.pipesCount === 0) return this; // just one destination.  most common case.

	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;
	    if (!dest) dest = state.pipes; // got a match.

	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  } // slow case. multiple pipe destinations.


	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, {
	        hasUnpiped: false
	      });
	    }

	    return this;
	  } // try to find the right one.


	  var index = indexOf$1(state.pipes, dest);
	  if (index === -1) return this;
	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];
	  dest.emit('unpipe', this, unpipeInfo);
	  return this;
	}; // set up data events if they are asked for
	// Ensure readable listeners eventually get something


	Readable$1.prototype.on = function (ev, fn) {
	  var res = stream$1.prototype.on.call(this, ev, fn);
	  var state = this._readableState;

	  if (ev === 'data') {
	    // update readableListening so that resume() may be a no-op
	    // a few lines down. This is needed to support once('readable').
	    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

	    if (state.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.flowing = false;
	      state.emittedReadable = false;
	      debug$1('on readable', state.length, state.reading);

	      if (state.length) {
	        emitReadable$1(this);
	      } else if (!state.reading) {
	        process.nextTick(nReadingNextTick$1, this);
	      }
	    }
	  }

	  return res;
	};

	Readable$1.prototype.addListener = Readable$1.prototype.on;

	Readable$1.prototype.removeListener = function (ev, fn) {
	  var res = stream$1.prototype.removeListener.call(this, ev, fn);

	  if (ev === 'readable') {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }

	  return res;
	};

	Readable$1.prototype.removeAllListeners = function (ev) {
	  var res = stream$1.prototype.removeAllListeners.apply(this, arguments);

	  if (ev === 'readable' || ev === undefined) {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }

	  return res;
	};

	function updateReadableListening(self) {
	  var state = self._readableState;
	  state.readableListening = self.listenerCount('readable') > 0;

	  if (state.resumeScheduled && !state.paused) {
	    // flowing needs to be set to true now, otherwise
	    // the upcoming resume will not flow.
	    state.flowing = true; // crude way to check if we should resume
	  } else if (self.listenerCount('data') > 0) {
	    self.resume();
	  }
	}

	function nReadingNextTick$1(self) {
	  debug$1('readable nexttick read 0');
	  self.read(0);
	} // pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.


	Readable$1.prototype.resume = function () {
	  var state = this._readableState;

	  if (!state.flowing) {
	    debug$1('resume'); // we flow only if there is no one listening
	    // for readable, but we still have to call
	    // resume()

	    state.flowing = !state.readableListening;
	    resume$1(this, state);
	  }

	  state.paused = false;
	  return this;
	};

	function resume$1(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(resume_$1, stream, state);
	  }
	}

	function resume_$1(stream, state) {
	  debug$1('resume', state.reading);

	  if (!state.reading) {
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow$1(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable$1.prototype.pause = function () {
	  debug$1('call pause flowing=%j', this._readableState.flowing);

	  if (this._readableState.flowing !== false) {
	    debug$1('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }

	  this._readableState.paused = true;
	  return this;
	};

	function flow$1(stream) {
	  var state = stream._readableState;
	  debug$1('flow', state.flowing);

	  while (state.flowing && stream.read() !== null) {
	  }
	} // wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.


	Readable$1.prototype.wrap = function (stream) {
	  var _this = this;

	  var state = this._readableState;
	  var paused = false;
	  stream.on('end', function () {
	    debug$1('wrapped end');

	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }

	    _this.push(null);
	  });
	  stream.on('data', function (chunk) {
	    debug$1('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = _this.push(chunk);

	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  }); // proxy all the other methods.
	  // important when wrapping filters and duplexes.

	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function methodWrap(method) {
	        return function methodWrapReturnFunction() {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  } // proxy certain important events.


	  for (var n = 0; n < kProxyEvents$1.length; n++) {
	    stream.on(kProxyEvents$1[n], this.emit.bind(this, kProxyEvents$1[n]));
	  } // when we try to consume some more bytes, simply unpause the
	  // underlying stream.


	  this._read = function (n) {
	    debug$1('wrapped _read', n);

	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return this;
	};

	if (typeof Symbol === 'function') {
	  Readable$1.prototype[Symbol.asyncIterator] = function () {
	    if (createReadableStreamAsyncIterator$1 === undefined) {
	      createReadableStreamAsyncIterator$1 = async_iterator;
	    }

	    return createReadableStreamAsyncIterator$1(this);
	  };
	}

	Object.defineProperty(Readable$1.prototype, 'readableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.highWaterMark;
	  }
	});
	Object.defineProperty(Readable$1.prototype, 'readableBuffer', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState && this._readableState.buffer;
	  }
	});
	Object.defineProperty(Readable$1.prototype, 'readableFlowing', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.flowing;
	  },
	  set: function set(state) {
	    if (this._readableState) {
	      this._readableState.flowing = state;
	    }
	  }
	}); // exposed for testing purposes only.

	Readable$1._fromList = fromList$1;
	Object.defineProperty(Readable$1.prototype, 'readableLength', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function get() {
	    return this._readableState.length;
	  }
	}); // Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.

	function fromList$1(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;
	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = state.buffer.consume(n, state.decoder);
	  }
	  return ret;
	}

	function endReadable$1(stream) {
	  var state = stream._readableState;
	  debug$1('endReadable', state.endEmitted);

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(endReadableNT$1, state, stream);
	  }
	}

	function endReadableNT$1(state, stream) {
	  debug$1('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');

	    if (state.autoDestroy) {
	      // In case of duplex streams we need a way to detect
	      // if the writable side is ready for autoDestroy as well
	      var wState = stream._writableState;

	      if (!wState || wState.autoDestroy && wState.finished) {
	        stream.destroy();
	      }
	    }
	  }
	}

	if (typeof Symbol === 'function') {
	  Readable$1.from = function (iterable, opts) {
	    if (from$1 === undefined) {
	      from$1 = from_1;
	    }

	    return from$1(Readable$1, iterable, opts);
	  };
	}

	function indexOf$1(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }

	  return -1;
	}

	var _stream_transform = Transform;

	var _require$codes$2 = errors.codes,
	    ERR_METHOD_NOT_IMPLEMENTED$2 = _require$codes$2.ERR_METHOD_NOT_IMPLEMENTED,
	    ERR_MULTIPLE_CALLBACK$1 = _require$codes$2.ERR_MULTIPLE_CALLBACK,
	    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes$2.ERR_TRANSFORM_ALREADY_TRANSFORMING,
	    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes$2.ERR_TRANSFORM_WITH_LENGTH_0;



	inherits(Transform, _stream_duplex$1);

	function afterTransform(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;
	  var cb = ts.writecb;

	  if (cb === null) {
	    return this.emit('error', new ERR_MULTIPLE_CALLBACK$1());
	  }

	  ts.writechunk = null;
	  ts.writecb = null;
	  if (data != null) // single equals check for both `null` and `undefined`
	    this.push(data);
	  cb(er);
	  var rs = this._readableState;
	  rs.reading = false;

	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}

	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);
	  _stream_duplex$1.call(this, options);
	  this._transformState = {
	    afterTransform: afterTransform.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  }; // start out asking for a readable event once data is transformed.

	  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.

	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;
	    if (typeof options.flush === 'function') this._flush = options.flush;
	  } // When the writable side finishes, then flush out anything remaining.


	  this.on('prefinish', prefinish$2);
	}

	function prefinish$2() {
	  var _this = this;

	  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
	    this._flush(function (er, data) {
	      done(_this, er, data);
	    });
	  } else {
	    done(this, null, null);
	  }
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return _stream_duplex$1.prototype.push.call(this, chunk, encoding);
	}; // This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.


	Transform.prototype._transform = function (chunk, encoding, cb) {
	  cb(new ERR_METHOD_NOT_IMPLEMENTED$2('_transform()'));
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;

	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	}; // Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.


	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && !ts.transforming) {
	    ts.transforming = true;

	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	Transform.prototype._destroy = function (err, cb) {
	  _stream_duplex$1.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	  });
	};

	function done(stream, er, data) {
	  if (er) return stream.emit('error', er);
	  if (data != null) // single equals check for both `null` and `undefined`
	    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided

	  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
	  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
	  return stream.push(null);
	}

	var _stream_passthrough = PassThrough;



	inherits(PassThrough, _stream_transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);
	  _stream_transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	var eos$1;

	function once$1(callback) {
	  var called = false;
	  return function () {
	    if (called) return;
	    called = true;
	    callback.apply(void 0, arguments);
	  };
	}

	var _require$codes$3 = errors.codes,
	    ERR_MISSING_ARGS = _require$codes$3.ERR_MISSING_ARGS,
	    ERR_STREAM_DESTROYED$1 = _require$codes$3.ERR_STREAM_DESTROYED;

	function noop$1(err) {
	  // Rethrow the error if it exists to avoid swallowing it
	  if (err) throw err;
	}

	function isRequest$1(stream) {
	  return stream.setHeader && typeof stream.abort === 'function';
	}

	function destroyer(stream, reading, writing, callback) {
	  callback = once$1(callback);
	  var closed = false;
	  stream.on('close', function () {
	    closed = true;
	  });
	  if (eos$1 === undefined) eos$1 = endOfStream;
	  eos$1(stream, {
	    readable: reading,
	    writable: writing
	  }, function (err) {
	    if (err) return callback(err);
	    closed = true;
	    callback();
	  });
	  var destroyed = false;
	  return function (err) {
	    if (closed) return;
	    if (destroyed) return;
	    destroyed = true; // request.destroy just do .end - .abort is what we want

	    if (isRequest$1(stream)) return stream.abort();
	    if (typeof stream.destroy === 'function') return stream.destroy();
	    callback(err || new ERR_STREAM_DESTROYED$1('pipe'));
	  };
	}

	function call(fn) {
	  fn();
	}

	function pipe(from, to) {
	  return from.pipe(to);
	}

	function popCallback(streams) {
	  if (!streams.length) return noop$1;
	  if (typeof streams[streams.length - 1] !== 'function') return noop$1;
	  return streams.pop();
	}

	function pipeline() {
	  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
	    streams[_key] = arguments[_key];
	  }

	  var callback = popCallback(streams);
	  if (Array.isArray(streams[0])) streams = streams[0];

	  if (streams.length < 2) {
	    throw new ERR_MISSING_ARGS('streams');
	  }

	  var error;
	  var destroys = streams.map(function (stream, i) {
	    var reading = i < streams.length - 1;
	    var writing = i > 0;
	    return destroyer(stream, reading, writing, function (err) {
	      if (!error) error = err;
	      if (err) destroys.forEach(call);
	      if (reading) return;
	      destroys.forEach(call);
	      callback(error);
	    });
	  });
	  return streams.reduce(pipe);
	}

	var pipeline_1 = pipeline;

	var readable = createCommonjsModule(function (module, exports) {
	if (process.env.READABLE_STREAM === 'disable' && stream$3) {
	  module.exports = stream$3.Readable;
	  Object.assign(module.exports, stream$3);
	  module.exports.Stream = stream$3;
	} else {
	  exports = module.exports = _stream_readable$1;
	  exports.Stream = stream$3 || exports;
	  exports.Readable = exports;
	  exports.Writable = _stream_writable$1;
	  exports.Duplex = _stream_duplex$1;
	  exports.Transform = _stream_transform;
	  exports.PassThrough = _stream_passthrough;
	  exports.finished = endOfStream;
	  exports.pipeline = pipeline_1;
	}
	});
	var readable_1 = readable.Stream;
	var readable_2 = readable.Readable;
	var readable_3 = readable.Writable;
	var readable_4 = readable.Duplex;
	var readable_5 = readable.Transform;
	var readable_6 = readable.PassThrough;
	var readable_7 = readable.finished;
	var readable_8 = readable.pipeline;

	/**
	 * Contains all configured adapters for the given environment.
	 *
	 * @type {Array}
	 * @public
	 */
	var adapters = [];

	/**
	 * Contains all modifier functions.
	 *
	 * @typs {Array}
	 * @public
	 */
	var modifiers = [];

	/**
	 * Our default logger.
	 *
	 * @public
	 */
	var logger = function devnull() {};

	/**
	 * Register a new adapter that will used to find environments.
	 *
	 * @param {Function} adapter A function that will return the possible env.
	 * @returns {Boolean} Indication of a successful add.
	 * @public
	 */
	function use(adapter) {
	  if (~adapters.indexOf(adapter)) return false;

	  adapters.push(adapter);
	  return true;
	}

	/**
	 * Assign a new log method.
	 *
	 * @param {Function} custom The log method.
	 * @public
	 */
	function set(custom) {
	  logger = custom;
	}

	/**
	 * Check if the namespace is allowed by any of our adapters.
	 *
	 * @param {String} namespace The namespace that needs to be enabled
	 * @returns {Boolean|Promise} Indication if the namespace is enabled by our adapters.
	 * @public
	 */
	function enabled(namespace) {
	  var async = [];

	  for (var i = 0; i < adapters.length; i++) {
	    if (adapters[i].async) {
	      async.push(adapters[i]);
	      continue;
	    }

	    if (adapters[i](namespace)) return true;
	  }

	  if (!async.length) return false;

	  //
	  // Now that we know that we Async functions, we know we run in an ES6
	  // environment and can use all the API's that they offer, in this case
	  // we want to return a Promise so that we can `await` in React-Native
	  // for an async adapter.
	  //
	  return new Promise(function pinky(resolve) {
	    Promise.all(
	      async.map(function prebind(fn) {
	        return fn(namespace);
	      })
	    ).then(function resolved(values) {
	      resolve(values.some(Boolean));
	    });
	  });
	}

	/**
	 * Add a new message modifier to the debugger.
	 *
	 * @param {Function} fn Modification function.
	 * @returns {Boolean} Indication of a successful add.
	 * @public
	 */
	function modify(fn) {
	  if (~modifiers.indexOf(fn)) return false;

	  modifiers.push(fn);
	  return true;
	}

	/**
	 * Write data to the supplied logger.
	 *
	 * @param {Object} meta Meta information about the log.
	 * @param {Array} args Arguments for console.log.
	 * @public
	 */
	function write() {
	  logger.apply(logger, arguments);
	}

	/**
	 * Process the message with the modifiers.
	 *
	 * @param {Mixed} message The message to be transformed by modifers.
	 * @returns {String} Transformed message.
	 * @public
	 */
	function process$1(message) {
	  for (var i = 0; i < modifiers.length; i++) {
	    message = modifiers[i].apply(modifiers[i], arguments);
	  }

	  return message;
	}

	/**
	 * Introduce options to the logger function.
	 *
	 * @param {Function} fn Calback function.
	 * @param {Object} options Properties to introduce on fn.
	 * @returns {Function} The passed function
	 * @public
	 */
	function introduce(fn, options) {
	  var has = Object.prototype.hasOwnProperty;

	  for (var key in options) {
	    if (has.call(options, key)) {
	      fn[key] = options[key];
	    }
	  }

	  return fn;
	}

	/**
	 * Nope, we're not allowed to write messages.
	 *
	 * @returns {Boolean} false
	 * @public
	 */
	function nope(options) {
	  options.enabled = false;
	  options.modify = modify;
	  options.set = set;
	  options.use = use;

	  return introduce(function diagnopes() {
	    return false;
	  }, options);
	}

	/**
	 * Yep, we're allowed to write debug messages.
	 *
	 * @param {Object} options The options for the process.
	 * @returns {Function} The function that does the logging.
	 * @public
	 */
	function yep(options) {
	  /**
	   * The function that receives the actual debug information.
	   *
	   * @returns {Boolean} indication that we're logging.
	   * @public
	   */
	  function diagnostics() {
	    var args = Array.prototype.slice.call(arguments, 0);

	    write.call(write, options, process$1(args, options));
	    return true;
	  }

	  options.enabled = true;
	  options.modify = modify;
	  options.set = set;
	  options.use = use;

	  return introduce(diagnostics, options);
	}

	/**
	 * Simple helper function to introduce various of helper methods to our given
	 * diagnostics function.
	 *
	 * @param {Function} diagnostics The diagnostics function.
	 * @returns {Function} diagnostics
	 * @public
	 */
	var diagnostics = function create(diagnostics) {
	  diagnostics.introduce = introduce;
	  diagnostics.enabled = enabled;
	  diagnostics.process = process$1;
	  diagnostics.modify = modify;
	  diagnostics.write = write;
	  diagnostics.nope = nope;
	  diagnostics.yep = yep;
	  diagnostics.set = set;
	  diagnostics.use = use;

	  return diagnostics;
	};

	/**
	 * Create a new diagnostics logger.
	 *
	 * @param {String} namespace The namespace it should enable.
	 * @param {Object} options Additional options.
	 * @returns {Function} The logger.
	 * @public
	 */
	var diagnostics$1 = diagnostics(function prod(namespace, options) {
	  options = options || {};
	  options.namespace = namespace;
	  options.prod = true;
	  options.dev = false;

	  if (!(options.force || prod.force)) return prod.nope(options);
	  return prod.yep(options);
	});

	var colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};

	var isArrayish = function isArrayish(obj) {
		if (!obj || typeof obj === 'string') {
			return false;
		}

		return obj instanceof Array || Array.isArray(obj) ||
			(obj.length >= 0 && (obj.splice instanceof Function ||
				(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
	};

	var simpleSwizzle = createCommonjsModule(function (module) {



	var concat = Array.prototype.concat;
	var slice = Array.prototype.slice;

	var swizzle = module.exports = function swizzle(args) {
		var results = [];

		for (var i = 0, len = args.length; i < len; i++) {
			var arg = args[i];

			if (isArrayish(arg)) {
				// http://jsperf.com/javascript-array-concat-vs-push/98
				results = concat.call(results, slice.call(arg));
			} else {
				results.push(arg);
			}
		}

		return results;
	};

	swizzle.wrap = function (fn) {
		return function () {
			return fn(swizzle(arguments));
		};
	};
	});

	var colorString = createCommonjsModule(function (module) {
	/* MIT license */



	var reverseNames = {};

	// create a list of reverse color names
	for (var name in colorName) {
		if (colorName.hasOwnProperty(name)) {
			reverseNames[colorName[name]] = name;
		}
	}

	var cs = module.exports = {
		to: {},
		get: {}
	};

	cs.get = function (string) {
		var prefix = string.substring(0, 3).toLowerCase();
		var val;
		var model;
		switch (prefix) {
			case 'hsl':
				val = cs.get.hsl(string);
				model = 'hsl';
				break;
			case 'hwb':
				val = cs.get.hwb(string);
				model = 'hwb';
				break;
			default:
				val = cs.get.rgb(string);
				model = 'rgb';
				break;
		}

		if (!val) {
			return null;
		}

		return {model: model, value: val};
	};

	cs.get.rgb = function (string) {
		if (!string) {
			return null;
		}

		var abbr = /^#([a-f0-9]{3,4})$/i;
		var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
		var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
		var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
		var keyword = /(\D+)/;

		var rgb = [0, 0, 0, 1];
		var match;
		var i;
		var hexAlpha;

		if (match = string.match(hex)) {
			hexAlpha = match[2];
			match = match[1];

			for (i = 0; i < 3; i++) {
				// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
				var i2 = i * 2;
				rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
			}

			if (hexAlpha) {
				rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
			}
		} else if (match = string.match(abbr)) {
			match = match[1];
			hexAlpha = match[3];

			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i] + match[i], 16);
			}

			if (hexAlpha) {
				rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
			}
		} else if (match = string.match(rgba)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i + 1], 0);
			}

			if (match[4]) {
				rgb[3] = parseFloat(match[4]);
			}
		} else if (match = string.match(per)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
			}

			if (match[4]) {
				rgb[3] = parseFloat(match[4]);
			}
		} else if (match = string.match(keyword)) {
			if (match[1] === 'transparent') {
				return [0, 0, 0, 0];
			}

			rgb = colorName[match[1]];

			if (!rgb) {
				return null;
			}

			rgb[3] = 1;

			return rgb;
		} else {
			return null;
		}

		for (i = 0; i < 3; i++) {
			rgb[i] = clamp(rgb[i], 0, 255);
		}
		rgb[3] = clamp(rgb[3], 0, 1);

		return rgb;
	};

	cs.get.hsl = function (string) {
		if (!string) {
			return null;
		}

		var hsl = /^hsla?\(\s*([+-]?(?:\d*\.)?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
		var match = string.match(hsl);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = (parseFloat(match[1]) + 360) % 360;
			var s = clamp(parseFloat(match[2]), 0, 100);
			var l = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

			return [h, s, l, a];
		}

		return null;
	};

	cs.get.hwb = function (string) {
		if (!string) {
			return null;
		}

		var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
		var match = string.match(hwb);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = ((parseFloat(match[1]) % 360) + 360) % 360;
			var w = clamp(parseFloat(match[2]), 0, 100);
			var b = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
			return [h, w, b, a];
		}

		return null;
	};

	cs.to.hex = function () {
		var rgba = simpleSwizzle(arguments);

		return (
			'#' +
			hexDouble(rgba[0]) +
			hexDouble(rgba[1]) +
			hexDouble(rgba[2]) +
			(rgba[3] < 1
				? (hexDouble(Math.round(rgba[3] * 255)))
				: '')
		);
	};

	cs.to.rgb = function () {
		var rgba = simpleSwizzle(arguments);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
			: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
	};

	cs.to.rgb.percent = function () {
		var rgba = simpleSwizzle(arguments);

		var r = Math.round(rgba[0] / 255 * 100);
		var g = Math.round(rgba[1] / 255 * 100);
		var b = Math.round(rgba[2] / 255 * 100);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
			: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
	};

	cs.to.hsl = function () {
		var hsla = simpleSwizzle(arguments);
		return hsla.length < 4 || hsla[3] === 1
			? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
			: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
	};

	// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
	// (hwb have alpha optional & 1 is default value)
	cs.to.hwb = function () {
		var hwba = simpleSwizzle(arguments);

		var a = '';
		if (hwba.length >= 4 && hwba[3] !== 1) {
			a = ', ' + hwba[3];
		}

		return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
	};

	cs.to.keyword = function (rgb) {
		return reverseNames[rgb.slice(0, 3)];
	};

	// helpers
	function clamp(num, min, max) {
		return Math.min(Math.max(min, num), max);
	}

	function hexDouble(num) {
		var str = num.toString(16).toUpperCase();
		return (str.length < 2) ? '0' + str : str;
	}
	});
	var colorString_1 = colorString.to;
	var colorString_2 = colorString.get;

	var conversions = createCommonjsModule(function (module) {
	/* MIT license */


	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	var reverseKeywords = {};
	for (var key in colorName) {
		if (colorName.hasOwnProperty(key)) {
			reverseKeywords[colorName[key]] = key;
		}
	}

	var convert = module.exports = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	// hide .channels and .labels properties
	for (var model in convert) {
		if (convert.hasOwnProperty(model)) {
			if (!('channels' in convert[model])) {
				throw new Error('missing channels property: ' + model);
			}

			if (!('labels' in convert[model])) {
				throw new Error('missing channel labels property: ' + model);
			}

			if (convert[model].labels.length !== convert[model].channels) {
				throw new Error('channel and label counts mismatch: ' + model);
			}

			var channels = convert[model].channels;
			var labels = convert[model].labels;
			delete convert[model].channels;
			delete convert[model].labels;
			Object.defineProperty(convert[model], 'channels', {value: channels});
			Object.defineProperty(convert[model], 'labels', {value: labels});
		}
	}

	convert.rgb.hsl = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var min = Math.min(r, g, b);
		var max = Math.max(r, g, b);
		var delta = max - min;
		var h;
		var s;
		var l;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		var rdif;
		var gdif;
		var bdif;
		var h;
		var s;

		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var v = Math.max(r, g, b);
		var diff = v - Math.min(r, g, b);
		var diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}
			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		var h = convert.rgb.hsl(rgb)[0];
		var w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var c;
		var m;
		var y;
		var k;

		k = Math.min(1 - r, 1 - g, 1 - b);
		c = (1 - r - k) / (1 - k) || 0;
		m = (1 - g - k) / (1 - k) || 0;
		y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	/**
	 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	 * */
	function comparativeDistance(x, y) {
		return (
			Math.pow(x[0] - y[0], 2) +
			Math.pow(x[1] - y[1], 2) +
			Math.pow(x[2] - y[2], 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		var reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		var currentClosestDistance = Infinity;
		var currentClosestKeyword;

		for (var keyword in colorName) {
			if (colorName.hasOwnProperty(keyword)) {
				var value = colorName[keyword];

				// Compute comparative distance
				var distance = comparativeDistance(rgb, value);

				// Check if its less, if so set as closest
				if (distance < currentClosestDistance) {
					currentClosestDistance = distance;
					currentClosestKeyword = keyword;
				}
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return colorName[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;

		// assume sRGB
		r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
		g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
		b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

		var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		var xyz = convert.rgb.xyz(rgb);
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		var h = hsl[0] / 360;
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var t1;
		var t2;
		var t3;
		var rgb;
		var val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		t1 = 2 * l - t2;

		rgb = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}
			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		var h = hsl[0];
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var smin = s;
		var lmin = Math.max(l, 0.01);
		var sv;
		var v;

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		v = (l + s) / 2;
		sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		var h = hsv[0] / 60;
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var hi = Math.floor(h) % 6;

		var f = h - Math.floor(h);
		var p = 255 * v * (1 - s);
		var q = 255 * v * (1 - (s * f));
		var t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		var h = hsv[0];
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var vmin = Math.max(v, 0.01);
		var lmin;
		var sl;
		var l;

		l = (2 - s) * v;
		lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		var h = hwb[0] / 360;
		var wh = hwb[1] / 100;
		var bl = hwb[2] / 100;
		var ratio = wh + bl;
		var i;
		var v;
		var f;
		var n;

		// wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		i = Math.floor(6 * h);
		v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		n = wh + f * (v - wh); // linear interpolation

		var r;
		var g;
		var b;
		switch (i) {
			default:
			case 6:
			case 0: r = v; g = n; b = wh; break;
			case 1: r = n; g = v; b = wh; break;
			case 2: r = wh; g = v; b = n; break;
			case 3: r = wh; g = n; b = v; break;
			case 4: r = n; g = wh; b = v; break;
			case 5: r = v; g = wh; b = n; break;
		}

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		var c = cmyk[0] / 100;
		var m = cmyk[1] / 100;
		var y = cmyk[2] / 100;
		var k = cmyk[3] / 100;
		var r;
		var g;
		var b;

		r = 1 - Math.min(1, c * (1 - k) + k);
		g = 1 - Math.min(1, m * (1 - k) + k);
		b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		var x = xyz[0] / 100;
		var y = xyz[1] / 100;
		var z = xyz[2] / 100;
		var r;
		var g;
		var b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// assume sRGB
		r = r > 0.0031308
			? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var x;
		var y;
		var z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		var y2 = Math.pow(y, 3);
		var x2 = Math.pow(x, 3);
		var z2 = Math.pow(z, 3);
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var hr;
		var h;
		var c;

		hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		var l = lch[0];
		var c = lch[1];
		var h = lch[2];
		var a;
		var b;
		var hr;

		hr = h / 360 * 2 * Math.PI;
		a = c * Math.cos(hr);
		b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];
		var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		var ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];

		// we use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		var ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		var color = args % 10;

		// handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		var mult = (~~(args > 50) + 1) * 0.5;
		var r = ((color & 1) * mult) * 255;
		var g = (((color >> 1) & 1) * mult) * 255;
		var b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// handle greyscale
		if (args >= 232) {
			var c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		var rem;
		var r = Math.floor(args / 36) / 5 * 255;
		var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		var b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		var integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		var colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(function (char) {
				return char + char;
			}).join('');
		}

		var integer = parseInt(colorString, 16);
		var r = (integer >> 16) & 0xFF;
		var g = (integer >> 8) & 0xFF;
		var b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var max = Math.max(Math.max(r, g), b);
		var min = Math.min(Math.min(r, g), b);
		var chroma = (max - min);
		var grayscale;
		var hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma + 4;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var c = 1;
		var f = 0;

		if (l < 0.5) {
			c = 2.0 * s * l;
		} else {
			c = 2.0 * s * (1.0 - l);
		}

		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;

		var c = s * v;
		var f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		var h = hcg[0] / 360;
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		var pure = [0, 0, 0];
		var hi = (h % 1) * 6;
		var v = hi % 1;
		var w = 1 - v;
		var mg = 0;

		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var v = c + g * (1.0 - c);
		var f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var l = g * (1.0 - c) + 0.5 * c;
		var s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;
		var v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		var w = hwb[1] / 100;
		var b = hwb[2] / 100;
		var v = 1 - b;
		var c = v - w;
		var g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = convert.gray.hsv = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		var val = Math.round(gray[0] / 100 * 255) & 0xFF;
		var integer = (val << 16) + (val << 8) + val;

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	});
	var conversions_1 = conversions.rgb;
	var conversions_2 = conversions.hsl;
	var conversions_3 = conversions.hsv;
	var conversions_4 = conversions.hwb;
	var conversions_5 = conversions.cmyk;
	var conversions_6 = conversions.xyz;
	var conversions_7 = conversions.lab;
	var conversions_8 = conversions.lch;
	var conversions_9 = conversions.hex;
	var conversions_10 = conversions.keyword;
	var conversions_11 = conversions.ansi16;
	var conversions_12 = conversions.ansi256;
	var conversions_13 = conversions.hcg;
	var conversions_14 = conversions.apple;
	var conversions_15 = conversions.gray;

	/*
		this function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		var graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		var models = Object.keys(conversions);

		for (var len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		var graph = buildGraph();
		var queue = [fromModel]; // unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			var current = queue.pop();
			var adjacents = Object.keys(conversions[current]);

			for (var len = adjacents.length, i = 0; i < len; i++) {
				var adjacent = adjacents[i];
				var node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		var path = [graph[toModel].parent, toModel];
		var fn = conversions[graph[toModel].parent][toModel];

		var cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	var route = function (fromModel) {
		var graph = deriveBFS(fromModel);
		var conversion = {};

		var models = Object.keys(graph);
		for (var len = models.length, i = 0; i < len; i++) {
			var toModel = models[i];
			var node = graph[toModel];

			if (node.parent === null) {
				// no possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};

	var convert = {};

	var models = Object.keys(conversions);

	function wrapRaw(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			return fn(args);
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			var result = fn(args);

			// we're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (var len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(function (fromModel) {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		var routes = route(fromModel);
		var routeModels = Object.keys(routes);

		routeModels.forEach(function (toModel) {
			var fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	var colorConvert = convert;

	var _slice = [].slice;

	var skippedModels = [
		// to be honest, I don't really feel like keyword belongs in color convert, but eh.
		'keyword',

		// gray conflicts with some method names, and has its own method defined.
		'gray',

		// shouldn't really be in color-convert either...
		'hex'
	];

	var hashedModelKeys = {};
	Object.keys(colorConvert).forEach(function (model) {
		hashedModelKeys[_slice.call(colorConvert[model].labels).sort().join('')] = model;
	});

	var limiters = {};

	function Color(obj, model) {
		if (!(this instanceof Color)) {
			return new Color(obj, model);
		}

		if (model && model in skippedModels) {
			model = null;
		}

		if (model && !(model in colorConvert)) {
			throw new Error('Unknown model: ' + model);
		}

		var i;
		var channels;

		if (!obj) {
			this.model = 'rgb';
			this.color = [0, 0, 0];
			this.valpha = 1;
		} else if (obj instanceof Color) {
			this.model = obj.model;
			this.color = obj.color.slice();
			this.valpha = obj.valpha;
		} else if (typeof obj === 'string') {
			var result = colorString.get(obj);
			if (result === null) {
				throw new Error('Unable to parse color from string: ' + obj);
			}

			this.model = result.model;
			channels = colorConvert[this.model].channels;
			this.color = result.value.slice(0, channels);
			this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
		} else if (obj.length) {
			this.model = model || 'rgb';
			channels = colorConvert[this.model].channels;
			var newArr = _slice.call(obj, 0, channels);
			this.color = zeroArray(newArr, channels);
			this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
		} else if (typeof obj === 'number') {
			// this is always RGB - can be converted later on.
			obj &= 0xFFFFFF;
			this.model = 'rgb';
			this.color = [
				(obj >> 16) & 0xFF,
				(obj >> 8) & 0xFF,
				obj & 0xFF
			];
			this.valpha = 1;
		} else {
			this.valpha = 1;

			var keys = Object.keys(obj);
			if ('alpha' in obj) {
				keys.splice(keys.indexOf('alpha'), 1);
				this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
			}

			var hashedKeys = keys.sort().join('');
			if (!(hashedKeys in hashedModelKeys)) {
				throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
			}

			this.model = hashedModelKeys[hashedKeys];

			var labels = colorConvert[this.model].labels;
			var color = [];
			for (i = 0; i < labels.length; i++) {
				color.push(obj[labels[i]]);
			}

			this.color = zeroArray(color);
		}

		// perform limitations (clamping, etc.)
		if (limiters[this.model]) {
			channels = colorConvert[this.model].channels;
			for (i = 0; i < channels; i++) {
				var limit = limiters[this.model][i];
				if (limit) {
					this.color[i] = limit(this.color[i]);
				}
			}
		}

		this.valpha = Math.max(0, Math.min(1, this.valpha));

		if (Object.freeze) {
			Object.freeze(this);
		}
	}

	Color.prototype = {
		toString: function () {
			return this.string();
		},

		toJSON: function () {
			return this[this.model]();
		},

		string: function (places) {
			var self = this.model in colorString.to ? this : this.rgb();
			self = self.round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to[self.model](args);
		},

		percentString: function (places) {
			var self = this.rgb().round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to.rgb.percent(args);
		},

		array: function () {
			return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
		},

		object: function () {
			var result = {};
			var channels = colorConvert[this.model].channels;
			var labels = colorConvert[this.model].labels;

			for (var i = 0; i < channels; i++) {
				result[labels[i]] = this.color[i];
			}

			if (this.valpha !== 1) {
				result.alpha = this.valpha;
			}

			return result;
		},

		unitArray: function () {
			var rgb = this.rgb().color;
			rgb[0] /= 255;
			rgb[1] /= 255;
			rgb[2] /= 255;

			if (this.valpha !== 1) {
				rgb.push(this.valpha);
			}

			return rgb;
		},

		unitObject: function () {
			var rgb = this.rgb().object();
			rgb.r /= 255;
			rgb.g /= 255;
			rgb.b /= 255;

			if (this.valpha !== 1) {
				rgb.alpha = this.valpha;
			}

			return rgb;
		},

		round: function (places) {
			places = Math.max(places || 0, 0);
			return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
		},

		alpha: function (val) {
			if (arguments.length) {
				return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
			}

			return this.valpha;
		},

		// rgb
		red: getset('rgb', 0, maxfn(255)),
		green: getset('rgb', 1, maxfn(255)),
		blue: getset('rgb', 2, maxfn(255)),

		hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

		saturationl: getset('hsl', 1, maxfn(100)),
		lightness: getset('hsl', 2, maxfn(100)),

		saturationv: getset('hsv', 1, maxfn(100)),
		value: getset('hsv', 2, maxfn(100)),

		chroma: getset('hcg', 1, maxfn(100)),
		gray: getset('hcg', 2, maxfn(100)),

		white: getset('hwb', 1, maxfn(100)),
		wblack: getset('hwb', 2, maxfn(100)),

		cyan: getset('cmyk', 0, maxfn(100)),
		magenta: getset('cmyk', 1, maxfn(100)),
		yellow: getset('cmyk', 2, maxfn(100)),
		black: getset('cmyk', 3, maxfn(100)),

		x: getset('xyz', 0, maxfn(100)),
		y: getset('xyz', 1, maxfn(100)),
		z: getset('xyz', 2, maxfn(100)),

		l: getset('lab', 0, maxfn(100)),
		a: getset('lab', 1),
		b: getset('lab', 2),

		keyword: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return colorConvert[this.model].keyword(this.color);
		},

		hex: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return colorString.to.hex(this.rgb().round().color);
		},

		rgbNumber: function () {
			var rgb = this.rgb().color;
			return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
		},

		luminosity: function () {
			// http://www.w3.org/TR/WCAG20/#relativeluminancedef
			var rgb = this.rgb().color;

			var lum = [];
			for (var i = 0; i < rgb.length; i++) {
				var chan = rgb[i] / 255;
				lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
			}

			return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
		},

		contrast: function (color2) {
			// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
			var lum1 = this.luminosity();
			var lum2 = color2.luminosity();

			if (lum1 > lum2) {
				return (lum1 + 0.05) / (lum2 + 0.05);
			}

			return (lum2 + 0.05) / (lum1 + 0.05);
		},

		level: function (color2) {
			var contrastRatio = this.contrast(color2);
			if (contrastRatio >= 7.1) {
				return 'AAA';
			}

			return (contrastRatio >= 4.5) ? 'AA' : '';
		},

		isDark: function () {
			// YIQ equation from http://24ways.org/2010/calculating-color-contrast
			var rgb = this.rgb().color;
			var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
			return yiq < 128;
		},

		isLight: function () {
			return !this.isDark();
		},

		negate: function () {
			var rgb = this.rgb();
			for (var i = 0; i < 3; i++) {
				rgb.color[i] = 255 - rgb.color[i];
			}
			return rgb;
		},

		lighten: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] += hsl.color[2] * ratio;
			return hsl;
		},

		darken: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] -= hsl.color[2] * ratio;
			return hsl;
		},

		saturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] += hsl.color[1] * ratio;
			return hsl;
		},

		desaturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] -= hsl.color[1] * ratio;
			return hsl;
		},

		whiten: function (ratio) {
			var hwb = this.hwb();
			hwb.color[1] += hwb.color[1] * ratio;
			return hwb;
		},

		blacken: function (ratio) {
			var hwb = this.hwb();
			hwb.color[2] += hwb.color[2] * ratio;
			return hwb;
		},

		grayscale: function () {
			// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
			var rgb = this.rgb().color;
			var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
			return Color.rgb(val, val, val);
		},

		fade: function (ratio) {
			return this.alpha(this.valpha - (this.valpha * ratio));
		},

		opaquer: function (ratio) {
			return this.alpha(this.valpha + (this.valpha * ratio));
		},

		rotate: function (degrees) {
			var hsl = this.hsl();
			var hue = hsl.color[0];
			hue = (hue + degrees) % 360;
			hue = hue < 0 ? 360 + hue : hue;
			hsl.color[0] = hue;
			return hsl;
		},

		mix: function (mixinColor, weight) {
			// ported from sass implementation in C
			// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
			var color1 = mixinColor.rgb();
			var color2 = this.rgb();
			var p = weight === undefined ? 0.5 : weight;

			var w = 2 * p - 1;
			var a = color1.alpha() - color2.alpha();

			var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
			var w2 = 1 - w1;

			return Color.rgb(
					w1 * color1.red() + w2 * color2.red(),
					w1 * color1.green() + w2 * color2.green(),
					w1 * color1.blue() + w2 * color2.blue(),
					color1.alpha() * p + color2.alpha() * (1 - p));
		}
	};

	// model conversion methods and static constructors
	Object.keys(colorConvert).forEach(function (model) {
		if (skippedModels.indexOf(model) !== -1) {
			return;
		}

		var channels = colorConvert[model].channels;

		// conversion methods
		Color.prototype[model] = function () {
			if (this.model === model) {
				return new Color(this);
			}

			if (arguments.length) {
				return new Color(arguments, model);
			}

			var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
			return new Color(assertArray(colorConvert[this.model][model].raw(this.color)).concat(newAlpha), model);
		};

		// 'static' construction methods
		Color[model] = function (color) {
			if (typeof color === 'number') {
				color = zeroArray(_slice.call(arguments), channels);
			}
			return new Color(color, model);
		};
	});

	function roundTo(num, places) {
		return Number(num.toFixed(places));
	}

	function roundToPlace(places) {
		return function (num) {
			return roundTo(num, places);
		};
	}

	function getset(model, channel, modifier) {
		model = Array.isArray(model) ? model : [model];

		model.forEach(function (m) {
			(limiters[m] || (limiters[m] = []))[channel] = modifier;
		});

		model = model[0];

		return function (val) {
			var result;

			if (arguments.length) {
				if (modifier) {
					val = modifier(val);
				}

				result = this[model]();
				result.color[channel] = val;
				return result;
			}

			result = this[model]().color[channel];
			if (modifier) {
				result = modifier(result);
			}

			return result;
		};
	}

	function maxfn(max) {
		return function (v) {
			return Math.max(0, Math.min(max, v));
		};
	}

	function assertArray(val) {
		return Array.isArray(val) ? val : [val];
	}

	function zeroArray(arr, length) {
		for (var i = 0; i < length; i++) {
			if (typeof arr[i] !== 'number') {
				arr[i] = 0;
			}
		}

		return arr;
	}

	var color = Color;

	/***
	 * Convert string to hex color.
	 *
	 * @param {String} str Text to hash and convert to hex.
	 * @returns {String}
	 * @api public
	 */
	var textHex = function hex(str) {
	  for (
	    var i = 0, hash = 0;
	    i < str.length;
	    hash = str.charCodeAt(i++) + ((hash << 5) - hash)
	  );

	  var color = Math.floor(
	    Math.abs(
	      (Math.sin(hash) * 10000) % 1 * 16777216
	    )
	  ).toString(16);

	  return '#' + Array(6 - color.length + 1).join('0') + color;
	};

	/**
	 * Generate a color for a given name. But be reasonably smart about it by
	 * understanding name spaces and coloring each namespace a bit lighter so they
	 * still have the same base color as the root.
	 *
	 * @param {string} namespace The namespace
	 * @param {string} [delimiter] The delimiter
	 * @returns {string} color
	 */
	var colorspace = function colorspace(namespace, delimiter) {
	  var split = namespace.split(delimiter || ':');
	  var base = textHex(split[0]);

	  if (!split.length) return base;

	  for (var i = 0, l = split.length - 1; i < l; i++) {
	    base = color(base)
	    .mix(color(textHex(split[i + 1])))
	    .saturate(1)
	    .hex();
	  }

	  return base;
	};

	/**
	 * Kuler: Color text using CSS colors
	 *
	 * @constructor
	 * @param {String} text The text that needs to be styled
	 * @param {String} color Optional color for alternate API.
	 * @api public
	 */
	function Kuler(text, color) {
	  if (color) return (new Kuler(text)).style(color);
	  if (!(this instanceof Kuler)) return new Kuler(text);

	  this.text = text;
	}

	/**
	 * ANSI color codes.
	 *
	 * @type {String}
	 * @private
	 */
	Kuler.prototype.prefix = '\x1b[';
	Kuler.prototype.suffix = 'm';

	/**
	 * Parse a hex color string and parse it to it's RGB equiv.
	 *
	 * @param {String} color
	 * @returns {Array}
	 * @api private
	 */
	Kuler.prototype.hex = function hex(color) {
	  color = color[0] === '#' ? color.substring(1) : color;

	  //
	  // Pre-parse for shorthand hex colors.
	  //
	  if (color.length === 3) {
	    color = color.split('');

	    color[5] = color[2]; // F60##0
	    color[4] = color[2]; // F60#00
	    color[3] = color[1]; // F60600
	    color[2] = color[1]; // F66600
	    color[1] = color[0]; // FF6600

	    color = color.join('');
	  }

	  var r = color.substring(0, 2)
	    , g = color.substring(2, 4)
	    , b = color.substring(4, 6);

	  return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
	};

	/**
	 * Transform a 255 RGB value to an RGV code.
	 *
	 * @param {Number} r Red color channel.
	 * @param {Number} g Green color channel.
	 * @param {Number} b Blue color channel.
	 * @returns {String}
	 * @api public
	 */
	Kuler.prototype.rgb = function rgb(r, g, b) {
	  var red = r / 255 * 5
	    , green = g / 255 * 5
	    , blue = b / 255 * 5;

	  return this.ansi(red, green, blue);
	};

	/**
	 * Turns RGB 0-5 values into a single ANSI code.
	 *
	 * @param {Number} r Red color channel.
	 * @param {Number} g Green color channel.
	 * @param {Number} b Blue color channel.
	 * @returns {String}
	 * @api public
	 */
	Kuler.prototype.ansi = function ansi(r, g, b) {
	  var red = Math.round(r)
	    , green = Math.round(g)
	    , blue = Math.round(b);

	  return 16 + (red * 36) + (green * 6) + blue;
	};

	/**
	 * Marks an end of color sequence.
	 *
	 * @returns {String} Reset sequence.
	 * @api public
	 */
	Kuler.prototype.reset = function reset() {
	  return this.prefix +'39;49'+ this.suffix;
	};

	/**
	 * Colour the terminal using CSS.
	 *
	 * @param {String} color The HEX color code.
	 * @returns {String} the escape code.
	 * @api public
	 */
	Kuler.prototype.style = function style(color) {
	  return this.prefix +'38;5;'+ this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
	};


	//
	// Expose the actual interface.
	//
	var kuler = Kuler;

	/**
	 * Prefix the messages with a colored namespace.
	 *
	 * @param {Array} args The messages array that is getting written.
	 * @param {Object} options Options for diagnostics.
	 * @returns {Array} Altered messages array.
	 * @public
	 */
	var namespaceAnsi = function ansiModifier(args, options) {
	  var namespace = options.namespace;
	  var ansi = options.colors !== false
	  ? kuler(namespace +':', colorspace(namespace))
	  : namespace +':';

	  args[0] = ansi +' '+ args[0];
	  return args;
	};

	/**
	 * Checks if a given namespace is allowed by the given variable.
	 *
	 * @param {String} name namespace that should be included.
	 * @param {String} variable Value that needs to be tested.
	 * @returns {Boolean} Indication if namespace is enabled.
	 * @public
	 */
	var enabled$1 = function enabled(name, variable) {
	  if (!variable) return false;

	  var variables = variable.split(/[\s,]+/)
	    , i = 0;

	  for (; i < variables.length; i++) {
	    variable = variables[i].replace('*', '.*?');

	    if ('-' === variable.charAt(0)) {
	      if ((new RegExp('^'+ variable.substr(1) +'$')).test(name)) {
	        return false;
	      }

	      continue;
	    }

	    if ((new RegExp('^'+ variable +'$')).test(name)) {
	      return true;
	    }
	  }

	  return false;
	};

	/**
	 * Creates a new Adapter.
	 *
	 * @param {Function} fn Function that returns the value.
	 * @returns {Function} The adapter logic.
	 * @public
	 */
	var adapters$1 = function create(fn) {
	  return function adapter(namespace) {
	    try {
	      return enabled$1(namespace, fn());
	    } catch (e) { /* Any failure means that we found nothing */ }

	    return false;
	  };
	};

	/**
	 * Extracts the values from process.env.
	 *
	 * @type {Function}
	 * @public
	 */
	var process_env = adapters$1(function processenv() {
	  return process.env.DEBUG || process.env.DIAGNOSTICS;
	});

	/**
	 * An idiot proof logger to be used as default. We've wrapped it in a try/catch
	 * statement to ensure the environments without the `console` API do not crash
	 * as well as an additional fix for ancient browsers like IE8 where the
	 * `console.log` API doesn't have an `apply`, so we need to use the Function's
	 * apply functionality to apply the arguments.
	 *
	 * @param {Object} meta Options of the logger.
	 * @param {Array} messages The actuall message that needs to be logged.
	 * @public
	 */
	var console_1$1 = function (meta, messages) {
	  //
	  // So yea. IE8 doesn't have an apply so we need a work around to puke the
	  // arguments in place.
	  //
	  try { Function.prototype.apply.call(console.log, console, messages); }
	  catch (e) {}
	};

	var tty = tty$1.isatty(1);

	/**
	 * Create a new diagnostics logger.
	 *
	 * @param {String} namespace The namespace it should enable.
	 * @param {Object} options Additional options.
	 * @returns {Function} The logger.
	 * @public
	 */
	var diagnostics$2 = diagnostics(function dev(namespace, options) {
	  options = options || {};
	  options.colors = 'colors' in options ? options.colors : tty;
	  options.namespace = namespace;
	  options.prod = false;
	  options.dev = true;

	  if (!dev.enabled(namespace) && !(options.force || dev.force)) {
	    return dev.nope(options);
	  }
	  
	  return dev.yep(options);
	});

	//
	// Configure the logger for the given environment.
	//
	diagnostics$2.modify(namespaceAnsi);
	diagnostics$2.use(process_env);
	diagnostics$2.set(console_1$1);

	//
	// Expose the diagnostics logger.
	//
	var development = diagnostics$2;

	var node$1 = createCommonjsModule(function (module) {
	//
	// Select the correct build version depending on the environment.
	//
	{
	  module.exports = development;
	}
	});

	const { StringDecoder: StringDecoder$4 } = string_decoder$2;
	const { Stream } = readable;

	/**
	 * Simple no-op function.
	 * @returns {undefined}
	 */
	function noop$2() {}

	/**
	 * TODO: add function description.
	 * @param {Object} options - Options for tail.
	 * @param {function} iter - Iterator function to execute on every line.
	* `tail -f` a file. Options must include file.
	 * @returns {mixed} - TODO: add return description.
	 */
	var tailFile = (options, iter) => {
	  const buffer = Buffer.alloc(64 * 1024);
	  const decode = new StringDecoder$4('utf8');
	  const stream = new Stream();
	  let buff = '';
	  let pos = 0;
	  let row = 0;

	  if (options.start === -1) {
	    delete options.start;
	  }

	  stream.readable = true;
	  stream.destroy = () => {
	    stream.destroyed = true;
	    stream.emit('end');
	    stream.emit('close');
	  };

	  fs.open(options.file, 'a+', '0644', (err, fd) => {
	    if (err) {
	      if (!iter) {
	        stream.emit('error', err);
	      } else {
	        iter(err);
	      }
	      stream.destroy();
	      return;
	    }

	    (function read() {
	      if (stream.destroyed) {
	        fs.close(fd, noop$2);
	        return;
	      }

	      return fs.read(fd, buffer, 0, buffer.length, pos, (error, bytes) => {
	        if (error) {
	          if (!iter) {
	            stream.emit('error', error);
	          } else {
	            iter(error);
	          }
	          stream.destroy();
	          return;
	        }

	        if (!bytes) {
	          if (buff) {
	            // eslint-disable-next-line eqeqeq
	            if (options.start == null || row > options.start) {
	              if (!iter) {
	                stream.emit('line', buff);
	              } else {
	                iter(null, buff);
	              }
	            }
	            row++;
	            buff = '';
	          }
	          return setTimeout(read, 1000);
	        }

	        let data = decode.write(buffer.slice(0, bytes));
	        if (!iter) {
	          stream.emit('data', data);
	        }

	        data = (buff + data).split(/\n+/);

	        const l = data.length - 1;
	        let i = 0;

	        for (; i < l; i++) {
	          // eslint-disable-next-line eqeqeq
	          if (options.start == null || row > options.start) {
	            if (!iter) {
	              stream.emit('line', data[i]);
	            } else {
	              iter(null, data[i]);
	            }
	          }
	          row++;
	        }

	        buff = data[l];
	        pos += bytes;
	        return read();
	      });
	    }());
	  });

	  if (!iter) {
	    return stream;
	  }

	  return stream.destroy;
	};

	const { MESSAGE: MESSAGE$1 } = tripleBeam;
	const { Stream: Stream$1, PassThrough: PassThrough$1 } = readable;

	const debug$2 = node$1('winston:file');



	/**
	 * Transport for outputting to a local log file.
	 * @type {File}
	 * @extends {TransportStream}
	 */
	var file = class File extends winstonTransport {
	  /**
	   * Constructor function for the File transport object responsible for
	   * persisting log messages and metadata to one or more files.
	   * @param {Object} options - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    // Expose the name of this Transport on the prototype.
	    this.name = options.name || 'file';

	    // Helper function which throws an `Error` in the event that any of the
	    // rest of the arguments is present in `options`.
	    function throwIf(target, ...args) {
	      args.slice(1).forEach(name => {
	        if (options[name]) {
	          throw new Error(`Cannot set ${name} and ${target} together`);
	        }
	      });
	    }

	    // Setup the base stream that always gets piped to to handle buffering.
	    this._stream = new PassThrough$1();
	    this._stream.setMaxListeners(30);

	    // Bind this context for listener methods.
	    this._onError = this._onError.bind(this);

	    if (options.filename || options.dirname) {
	      throwIf('filename or dirname', 'stream');
	      this._basename = this.filename = options.filename
	        ? path.basename(options.filename)
	        : 'winston.log';

	      this.dirname = options.dirname || path.dirname(options.filename);
	      this.options = options.options || { flags: 'a' };
	    } else if (options.stream) {
	      // eslint-disable-next-line no-console
	      console.warn('options.stream will be removed in winston@4. Use winston.transports.Stream');
	      throwIf('stream', 'filename', 'maxsize');
	      this._dest = this._stream.pipe(this._setupStream(options.stream));
	      this.dirname = path.dirname(this._dest.path);
	      // We need to listen for drain events when write() returns false. This
	      // can make node mad at times.
	    } else {
	      throw new Error('Cannot log to file without filename or stream.');
	    }

	    this.maxsize = options.maxsize || null;
	    this.rotationFormat = options.rotationFormat || false;
	    this.zippedArchive = options.zippedArchive || false;
	    this.maxFiles = options.maxFiles || null;
	    this.eol = options.eol || os.EOL;
	    this.tailable = options.tailable || false;

	    // Internal state variables representing the number of files this instance
	    // has created and the current size (in bytes) of the current logfile.
	    this._size = 0;
	    this._pendingSize = 0;
	    this._created = 0;
	    this._drain = false;
	    this._opening = false;
	    this._ending = false;

	    if (this.dirname) this._createLogDirIfNotExist(this.dirname);
	    this.open();
	  }

	  finishIfEnding() {
	    if (this._ending) {
	      if (this._opening) {
	        this.once('open', () => {
	          this._stream.once('finish', () => this.emit('finish'));
	          setImmediate(() => this._stream.end());
	        });
	      } else {
	        this._stream.once('finish', () => this.emit('finish'));
	        setImmediate(() => this._stream.end());
	      }
	    }
	  }


	  /**
	   * Core logging method exposed to Winston. Metadata is optional.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback = () => {}) {
	    // Remark: (jcrugzz) What is necessary about this callback(null, true) now
	    // when thinking about 3.x? Should silent be handled in the base
	    // TransportStream _write method?
	    if (this.silent) {
	      callback();
	      return true;
	    }

	    // Output stream buffer is full and has asked us to wait for the drain event
	    if (this._drain) {
	      this._stream.once('drain', () => {
	        this._drain = false;
	        this.log(info, callback);
	      });
	      return;
	    }
	    if (this._rotate) {
	      this._stream.once('rotate', () => {
	        this._rotate = false;
	        this.log(info, callback);
	      });
	      return;
	    }

	    // Grab the raw string and append the expected EOL.
	    const output = `${info[MESSAGE$1]}${this.eol}`;
	    const bytes = Buffer.byteLength(output);

	    // After we have written to the PassThrough check to see if we need
	    // to rotate to the next file.
	    //
	    // Remark: This gets called too early and does not depict when data
	    // has been actually flushed to disk.
	    function logged() {
	      this._size += bytes;
	      this._pendingSize -= bytes;

	      debug$2('logged %s %s', this._size, output);
	      this.emit('logged', info);

	      // Do not attempt to rotate files while opening
	      if (this._opening) {
	        return;
	      }

	      // Check to see if we need to end the stream and create a new one.
	      if (!this._needsNewFile()) {
	        return;
	      }

	      // End the current stream, ensure it flushes and create a new one.
	      // This could potentially be optimized to not run a stat call but its
	      // the safest way since we are supporting `maxFiles`.
	      this._rotate = true;
	      this._endStream(() => this._rotateFile());
	    }

	    // Keep track of the pending bytes being written while files are opening
	    // in order to properly rotate the PassThrough this._stream when the file
	    // eventually does open.
	    this._pendingSize += bytes;
	    if (this._opening
	      && !this.rotatedWhileOpening
	      && this._needsNewFile(this._size + this._pendingSize)) {
	      this.rotatedWhileOpening = true;
	    }

	    const written = this._stream.write(output, logged.bind(this));
	    if (!written) {
	      this._drain = true;
	      this._stream.once('drain', () => {
	        this._drain = false;
	        callback();
	      });
	    } else {
	      callback(); // eslint-disable-line callback-return
	    }

	    debug$2('written', written, this._drain);

	    this.finishIfEnding();

	    return written;
	  }

	  /**
	   * Query the transport. Options object is optional.
	   * @param {Object} options - Loggly-like query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   * TODO: Refactor me.
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = normalizeQuery(options);
	    const file = path.join(this.dirname, this.filename);
	    let buff = '';
	    let results = [];
	    let row = 0;

	    const stream = fs.createReadStream(file, {
	      encoding: 'utf8'
	    });

	    stream.on('error', err => {
	      if (stream.readable) {
	        stream.destroy();
	      }
	      if (!callback) {
	        return;
	      }

	      return err.code !== 'ENOENT' ? callback(err) : callback(null, results);
	    });

	    stream.on('data', data => {
	      data = (buff + data).split(/\n+/);
	      const l = data.length - 1;
	      let i = 0;

	      for (; i < l; i++) {
	        if (!options.start || row >= options.start) {
	          add(data[i]);
	        }
	        row++;
	      }

	      buff = data[l];
	    });

	    stream.on('close', () => {
	      if (buff) {
	        add(buff, true);
	      }
	      if (options.order === 'desc') {
	        results = results.reverse();
	      }

	      // eslint-disable-next-line callback-return
	      if (callback) callback(null, results);
	    });

	    function add(buff, attempt) {
	      try {
	        const log = JSON.parse(buff);
	        if (check(log)) {
	          push(log);
	        }
	      } catch (e) {
	        if (!attempt) {
	          stream.emit('error', e);
	        }
	      }
	    }

	    function push(log) {
	      if (
	        options.rows &&
	        results.length >= options.rows &&
	        options.order !== 'desc'
	      ) {
	        if (stream.readable) {
	          stream.destroy();
	        }
	        return;
	      }

	      if (options.fields) {
	        log = options.fields.reduce((obj, key) => {
	          obj[key] = log[key];
	          return obj;
	        }, {});
	      }

	      if (options.order === 'desc') {
	        if (results.length >= options.rows) {
	          results.shift();
	        }
	      }
	      results.push(log);
	    }

	    function check(log) {
	      if (!log) {
	        return;
	      }

	      if (typeof log !== 'object') {
	        return;
	      }

	      const time = new Date(log.timestamp);
	      if (
	        (options.from && time < options.from) ||
	        (options.until && time > options.until) ||
	        (options.level && options.level !== log.level)
	      ) {
	        return;
	      }

	      return true;
	    }

	    function normalizeQuery(options) {
	      options = options || {};

	      // limit
	      options.rows = options.rows || options.limit || 10;

	      // starting row offset
	      options.start = options.start || 0;

	      // now
	      options.until = options.until || new Date();
	      if (typeof options.until !== 'object') {
	        options.until = new Date(options.until);
	      }

	      // now - 24
	      options.from = options.from || (options.until - (24 * 60 * 60 * 1000));
	      if (typeof options.from !== 'object') {
	        options.from = new Date(options.from);
	      }

	      // 'asc' or 'desc'
	      options.order = options.order || 'desc';

	      return options;
	    }
	  }

	  /**
	   * Returns a log stream for this transport. Options object is optional.
	   * @param {Object} options - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description.
	   * TODO: Refactor me.
	   */
	  stream(options = {}) {
	    const file = path.join(this.dirname, this.filename);
	    const stream = new Stream$1();
	    const tail = {
	      file,
	      start: options.start
	    };

	    stream.destroy = tailFile(tail, (err, line) => {
	      if (err) {
	        return stream.emit('error', err);
	      }

	      try {
	        stream.emit('data', line);
	        line = JSON.parse(line);
	        stream.emit('log', line);
	      } catch (e) {
	        stream.emit('error', e);
	      }
	    });

	    return stream;
	  }

	  /**
	   * Checks to see the filesize of.
	   * @returns {undefined}
	   */
	  open() {
	    // If we do not have a filename then we were passed a stream and
	    // don't need to keep track of size.
	    if (!this.filename) return;
	    if (this._opening) return;

	    this._opening = true;

	    // Stat the target file to get the size and create the stream.
	    this.stat((err, size) => {
	      if (err) {
	        return this.emit('error', err);
	      }
	      debug$2('stat done: %s { size: %s }', this.filename, size);
	      this._size = size;
	      this._dest = this._createStream(this._stream);
	      this._opening = false;
	      this.once('open', () => {
	        if (this._stream.eventNames().includes('rotate')) {
	          this._stream.emit('rotate');
	        } else {
	          this._rotate = false;
	        }
	      });
	    });
	  }

	  /**
	   * Stat the file and assess information in order to create the proper stream.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  stat(callback) {
	    const target = this._getFile();
	    const fullpath = path.join(this.dirname, target);

	    fs.stat(fullpath, (err, stat) => {
	      if (err && err.code === 'ENOENT') {
	        debug$2('ENOENT ok', fullpath);
	        // Update internally tracked filename with the new target name.
	        this.filename = target;
	        return callback(null, 0);
	      }

	      if (err) {
	        debug$2(`err ${err.code} ${fullpath}`);
	        return callback(err);
	      }

	      if (!stat || this._needsNewFile(stat.size)) {
	        // If `stats.size` is greater than the `maxsize` for this
	        // instance then try again.
	        return this._incFile(() => this.stat(callback));
	      }

	      // Once we have figured out what the filename is, set it
	      // and return the size.
	      this.filename = target;
	      callback(null, stat.size);
	    });
	  }

	  /**
	   * Closes the stream associated with this instance.
	   * @param {function} cb - TODO: add param description.
	   * @returns {undefined}
	   */
	  close(cb) {
	    if (!this._stream) {
	      return;
	    }

	    this._stream.end(() => {
	      if (cb) {
	        cb(); // eslint-disable-line callback-return
	      }
	      this.emit('flush');
	      this.emit('closed');
	    });
	  }

	  /**
	   * TODO: add method description.
	   * @param {number} size - TODO: add param description.
	   * @returns {undefined}
	   */
	  _needsNewFile(size) {
	    size = size || this._size;
	    return this.maxsize && size >= this.maxsize;
	  }

	  /**
	   * TODO: add method description.
	   * @param {Error} err - TODO: add param description.
	   * @returns {undefined}
	   */
	  _onError(err) {
	    this.emit('error', err);
	  }

	  /**
	   * TODO: add method description.
	   * @param {Stream} stream - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  _setupStream(stream) {
	    stream.on('error', this._onError);

	    return stream;
	  }

	  /**
	   * TODO: add method description.
	   * @param {Stream} stream - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  _cleanupStream(stream) {
	    stream.removeListener('error', this._onError);

	    return stream;
	  }

	  /**
	   * TODO: add method description.
	   */
	  _rotateFile() {
	    this._incFile(() => this.open());
	  }

	  /**
	   * Unpipe from the stream that has been marked as full and end it so it
	   * flushes to disk.
	   *
	   * @param {function} callback - Callback for when the current file has closed.
	   * @private
	   */
	  _endStream(callback = () => {}) {
	    if (this._dest) {
	      this._stream.unpipe(this._dest);
	      this._dest.end(() => {
	        this._cleanupStream(this._dest);
	        callback();
	      });
	    } else {
	      callback(); // eslint-disable-line callback-return
	    }
	  }

	  /**
	   * Returns the WritableStream for the active file on this instance. If we
	   * should gzip the file then a zlib stream is returned.
	   *
	   * @param {ReadableStream} source – PassThrough to pipe to the file when open.
	   * @returns {WritableStream} Stream that writes to disk for the active file.
	   */
	  _createStream(source) {
	    const fullpath = path.join(this.dirname, this.filename);

	    debug$2('create stream start', fullpath, this.options);
	    const dest = fs.createWriteStream(fullpath, this.options)
	      // TODO: What should we do with errors here?
	      .on('error', err => debug$2(err))
	      .on('close', () => debug$2('close', dest.path, dest.bytesWritten))
	      .on('open', () => {
	        debug$2('file open ok', fullpath);
	        this.emit('open', fullpath);
	        source.pipe(dest);

	        // If rotation occured during the open operation then we immediately
	        // start writing to a new PassThrough, begin opening the next file
	        // and cleanup the previous source and dest once the source has drained.
	        if (this.rotatedWhileOpening) {
	          this._stream = new PassThrough$1();
	          this._stream.setMaxListeners(30);
	          this._rotateFile();
	          this.rotatedWhileOpening = false;
	          this._cleanupStream(dest);
	          source.end();
	        }
	      });

	    debug$2('create stream ok', fullpath);
	    if (this.zippedArchive) {
	      const gzip = zlib.createGzip();
	      gzip.pipe(dest);
	      return gzip;
	    }

	    return dest;
	  }

	  /**
	   * TODO: add method description.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  _incFile(callback) {
	    debug$2('_incFile', this.filename);
	    const ext = path.extname(this._basename);
	    const basename = path.basename(this._basename, ext);

	    if (!this.tailable) {
	      this._created += 1;
	      this._checkMaxFilesIncrementing(ext, basename, callback);
	    } else {
	      this._checkMaxFilesTailable(ext, basename, callback);
	    }
	  }

	  /**
	   * Gets the next filename to use for this instance in the case that log
	   * filesizes are being capped.
	   * @returns {string} - TODO: add return description.
	   * @private
	   */
	  _getFile() {
	    const ext = path.extname(this._basename);
	    const basename = path.basename(this._basename, ext);
	    const isRotation = this.rotationFormat
	      ? this.rotationFormat()
	      : this._created;

	    // Caveat emptor (indexzero): rotationFormat() was broken by design When
	    // combined with max files because the set of files to unlink is never
	    // stored.
	    const target = !this.tailable && this._created
	      ? `${basename}${isRotation}${ext}`
	      : `${basename}${ext}`;

	    return this.zippedArchive && !this.tailable
	      ? `${target}.gz`
	      : target;
	  }

	  /**
	   * Increment the number of files created or checked by this instance.
	   * @param {mixed} ext - TODO: add param description.
	   * @param {mixed} basename - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {undefined}
	   * @private
	   */
	  _checkMaxFilesIncrementing(ext, basename, callback) {
	    // Check for maxFiles option and delete file.
	    if (!this.maxFiles || this._created < this.maxFiles) {
	      return setImmediate(callback);
	    }

	    const oldest = this._created - this.maxFiles;
	    const isOldest = oldest !== 0 ? oldest : '';
	    const isZipped = this.zippedArchive ? '.gz' : '';
	    const filePath = `${basename}${isOldest}${ext}${isZipped}`;
	    const target = path.join(this.dirname, filePath);

	    fs.unlink(target, callback);
	  }

	  /**
	   * Roll files forward based on integer, up to maxFiles. e.g. if base if
	   * file.log and it becomes oversized, roll to file1.log, and allow file.log
	   * to be re-used. If file is oversized again, roll file1.log to file2.log,
	   * roll file.log to file1.log, and so on.
	   * @param {mixed} ext - TODO: add param description.
	   * @param {mixed} basename - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {undefined}
	   * @private
	   */
	  _checkMaxFilesTailable(ext, basename, callback) {
	    const tasks = [];
	    if (!this.maxFiles) {
	      return;
	    }

	    // const isZipped = this.zippedArchive ? '.gz' : '';
	    const isZipped = this.zippedArchive ? '.gz' : '';
	    for (let x = this.maxFiles - 1; x > 1; x--) {
	      tasks.push(function (i, cb) {
	        let fileName = `${basename}${(i - 1)}${ext}${isZipped}`;
	        const tmppath = path.join(this.dirname, fileName);

	        fs.exists(tmppath, exists => {
	          if (!exists) {
	            return cb(null);
	          }

	          fileName = `${basename}${i}${ext}${isZipped}`;
	          fs.rename(tmppath, path.join(this.dirname, fileName), cb);
	        });
	      }.bind(this, x));
	    }

	    series_1(tasks, () => {
	      fs.rename(
	        path.join(this.dirname, `${basename}${ext}`),
	        path.join(this.dirname, `${basename}1${ext}${isZipped}`),
	        callback
	      );
	    });
	  }

	  _createLogDirIfNotExist(dirPath) {
	    /* eslint-disable no-sync */
	    if (!fs.existsSync(dirPath)) {
	      fs.mkdirSync(dirPath, { recursive: true });
	    }
	    /* eslint-enable no-sync */
	  }
	};

	const { Stream: Stream$2 } = readable;


	/**
	 * Transport for outputting to a json-rpc server.
	 * @type {Stream}
	 * @extends {TransportStream}
	 */
	var http_1 = class Http extends winstonTransport {
	  /**
	   * Constructor function for the Http transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    this.options = options;
	    this.name = options.name || 'http';
	    this.ssl = !!options.ssl;
	    this.host = options.host || 'localhost';
	    this.port = options.port;
	    this.auth = options.auth;
	    this.path = options.path || '';
	    this.agent = options.agent;
	    this.headers = options.headers || {};
	    this.headers['content-type'] = 'application/json';

	    if (!this.port) {
	      this.port = this.ssl ? 443 : 80;
	    }
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    this._request(info, (err, res) => {
	      if (res && res.statusCode !== 200) {
	        err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
	      }

	      if (err) {
	        this.emit('warn', err);
	      } else {
	        this.emit('logged', info);
	      }
	    });

	    // Remark: (jcrugzz) Fire and forget here so requests dont cause buffering
	    // and block more requests from happening?
	    if (callback) {
	      setImmediate(callback);
	    }
	  }

	  /**
	   * Query the transport. Options object is optional.
	   * @param {Object} options -  Loggly-like query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   * @returns {undefined}
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = {
	      method: 'query',
	      params: this.normalizeQuery(options)
	    };

	    if (options.params.path) {
	      options.path = options.params.path;
	      delete options.params.path;
	    }

	    if (options.params.auth) {
	      options.auth = options.params.auth;
	      delete options.params.auth;
	    }

	    this._request(options, (err, res, body) => {
	      if (res && res.statusCode !== 200) {
	        err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
	      }

	      if (err) {
	        return callback(err);
	      }

	      if (typeof body === 'string') {
	        try {
	          body = JSON.parse(body);
	        } catch (e) {
	          return callback(e);
	        }
	      }

	      callback(null, body);
	    });
	  }

	  /**
	   * Returns a log stream for this transport. Options object is optional.
	   * @param {Object} options - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description
	   */
	  stream(options = {}) {
	    const stream = new Stream$2();
	    options = {
	      method: 'stream',
	      params: options
	    };

	    if (options.params.path) {
	      options.path = options.params.path;
	      delete options.params.path;
	    }

	    if (options.params.auth) {
	      options.auth = options.params.auth;
	      delete options.params.auth;
	    }

	    let buff = '';
	    const req = this._request(options);

	    stream.destroy = () => req.destroy();
	    req.on('data', data => {
	      data = (buff + data).split(/\n+/);
	      const l = data.length - 1;

	      let i = 0;
	      for (; i < l; i++) {
	        try {
	          stream.emit('log', JSON.parse(data[i]));
	        } catch (e) {
	          stream.emit('error', e);
	        }
	      }

	      buff = data[l];
	    });
	    req.on('error', err => stream.emit('error', err));

	    return stream;
	  }

	  /**
	   * Make a request to a winstond server or any http server which can
	   * handle json-rpc.
	   * @param {function} options - Options to sent the request.
	   * @param {function} callback - Continuation to respond to when complete.
	   */
	  _request(options, callback) {
	    options = options || {};

	    const auth = options.auth || this.auth;
	    const path = options.path || this.path || '';

	    delete options.auth;
	    delete options.path;

	    // Prepare options for outgoing HTTP request
	    const headers = Object.assign({}, this.headers);
	    if (auth && auth.bearer) {
	      headers.Authorization = `Bearer ${auth.bearer}`;
	    }
	    const req = (this.ssl ? https : http).request({
	      ...this.options,
	      method: 'POST',
	      host: this.host,
	      port: this.port,
	      path: `/${path.replace(/^\//, '')}`,
	      headers: headers,
	      auth: (auth && auth.username && auth.password) ? (`${auth.username}:${auth.password}`) : '',
	      agent: this.agent
	    });

	    req.on('error', callback);
	    req.on('response', res => (
	      res.on('end', () => callback(null, res)).resume()
	    ));
	    req.end(Buffer.from(JSON.stringify(options), 'utf8'));
	  }
	};

	const isStream = stream =>
		stream !== null &&
		typeof stream === 'object' &&
		typeof stream.pipe === 'function';

	isStream.writable = stream =>
		isStream(stream) &&
		stream.writable !== false &&
		typeof stream._write === 'function' &&
		typeof stream._writableState === 'object';

	isStream.readable = stream =>
		isStream(stream) &&
		stream.readable !== false &&
		typeof stream._read === 'function' &&
		typeof stream._readableState === 'object';

	isStream.duplex = stream =>
		isStream.writable(stream) &&
		isStream.readable(stream);

	isStream.transform = stream =>
		isStream.duplex(stream) &&
		typeof stream._transform === 'function' &&
		typeof stream._transformState === 'object';

	var isStream_1 = isStream;

	const { MESSAGE: MESSAGE$2 } = tripleBeam;



	/**
	 * Transport for outputting to any arbitrary stream.
	 * @type {Stream}
	 * @extends {TransportStream}
	 */
	var stream$2 = class Stream extends winstonTransport {
	  /**
	   * Constructor function for the Console transport object responsible for
	   * persisting log messages and metadata to a terminal or TTY.
	   * @param {!Object} [options={}] - Options for this instance.
	   */
	  constructor(options = {}) {
	    super(options);

	    if (!options.stream || !isStream_1(options.stream)) {
	      throw new Error('options.stream is required.');
	    }

	    // We need to listen for drain events when write() returns false. This can
	    // make node mad at times.
	    this._stream = options.stream;
	    this._stream.setMaxListeners(Infinity);
	    this.isObjectMode = options.stream._writableState.objectMode;
	    this.eol = options.eol || os.EOL;
	  }

	  /**
	   * Core logging method exposed to Winston.
	   * @param {Object} info - TODO: add param description.
	   * @param {Function} callback - TODO: add param description.
	   * @returns {undefined}
	   */
	  log(info, callback) {
	    setImmediate(() => this.emit('logged', info));
	    if (this.isObjectMode) {
	      this._stream.write(info);
	      if (callback) {
	        callback(); // eslint-disable-line callback-return
	      }
	      return;
	    }

	    this._stream.write(`${info[MESSAGE$2]}${this.eol}`);
	    if (callback) {
	      callback(); // eslint-disable-line callback-return
	    }
	    return;
	  }
	};

	var transports = createCommonjsModule(function (module, exports) {

	/**
	 * TODO: add property description.
	 * @type {Console}
	 */
	Object.defineProperty(exports, 'Console', {
	  configurable: true,
	  enumerable: true,
	  get() {
	    return console_1;
	  }
	});

	/**
	 * TODO: add property description.
	 * @type {File}
	 */
	Object.defineProperty(exports, 'File', {
	  configurable: true,
	  enumerable: true,
	  get() {
	    return file;
	  }
	});

	/**
	 * TODO: add property description.
	 * @type {Http}
	 */
	Object.defineProperty(exports, 'Http', {
	  configurable: true,
	  enumerable: true,
	  get() {
	    return http_1;
	  }
	});

	/**
	 * TODO: add property description.
	 * @type {Stream}
	 */
	Object.defineProperty(exports, 'Stream', {
	  configurable: true,
	  enumerable: true,
	  get() {
	    return stream$2;
	  }
	});
	});

	const { configs } = tripleBeam;

	/**
	 * Export config set for the CLI.
	 * @type {Object}
	 */
	var cli$1 = logform.levels(configs.cli);

	/**
	 * Export config set for npm.
	 * @type {Object}
	 */
	var npm$1 = logform.levels(configs.npm);

	/**
	 * Export config set for the syslog.
	 * @type {Object}
	 */
	var syslog$1 = logform.levels(configs.syslog);

	/**
	 * Hoist addColors from logform where it was refactored into in winston@3.
	 * @type {Object}
	 */
	var addColors = logform.levels;

	var config$1 = {
		cli: cli$1,
		npm: npm$1,
		syslog: syslog$1,
		addColors: addColors
	};

	var eachOf_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});



	var _isArrayLike2 = _interopRequireDefault(isArrayLike_1);



	var _breakLoop2 = _interopRequireDefault(breakLoop_1);



	var _eachOfLimit2 = _interopRequireDefault(eachOfLimit_1);



	var _once2 = _interopRequireDefault(once_1);



	var _onlyOnce2 = _interopRequireDefault(onlyOnce_1);



	var _wrapAsync2 = _interopRequireDefault(wrapAsync_1);



	var _awaitify2 = _interopRequireDefault(awaitify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// eachOf implementation optimized for array-likes
	function eachOfArrayLike(coll, iteratee, callback) {
	    callback = (0, _once2.default)(callback);
	    var index = 0,
	        completed = 0,
	        { length } = coll,
	        canceled = false;
	    if (length === 0) {
	        callback(null);
	    }

	    function iteratorCallback(err, value) {
	        if (err === false) {
	            canceled = true;
	        }
	        if (canceled === true) return;
	        if (err) {
	            callback(err);
	        } else if (++completed === length || value === _breakLoop2.default) {
	            callback(null);
	        }
	    }

	    for (; index < length; index++) {
	        iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
	    }
	}

	// a generic version of eachOf which can handle array, object, and iterator cases.
	function eachOfGeneric(coll, iteratee, callback) {
	    return (0, _eachOfLimit2.default)(coll, Infinity, iteratee, callback);
	}

	/**
	 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
	 * to the iteratee.
	 *
	 * @name eachOf
	 * @static
	 * @memberOf module:Collections
	 * @method
	 * @alias forEachOf
	 * @category Collection
	 * @see [async.each]{@link module:Collections.each}
	 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
	 * @param {AsyncFunction} iteratee - A function to apply to each
	 * item in `coll`.
	 * The `key` is the item's key, or index in the case of an array.
	 * Invoked with (item, key, callback).
	 * @param {Function} [callback] - A callback which is called when all
	 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
	 * @returns {Promise} a promise, if a callback is omitted
	 * @example
	 *
	 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
	 * var configs = {};
	 *
	 * async.forEachOf(obj, function (value, key, callback) {
	 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
	 *         if (err) return callback(err);
	 *         try {
	 *             configs[key] = JSON.parse(data);
	 *         } catch (e) {
	 *             return callback(e);
	 *         }
	 *         callback();
	 *     });
	 * }, function (err) {
	 *     if (err) console.error(err.message);
	 *     // configs is now a map of JSON data
	 *     doSomethingWith(configs);
	 * });
	 */
	function eachOf(coll, iteratee, callback) {
	    var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
	    return eachOfImplementation(coll, (0, _wrapAsync2.default)(iteratee), callback);
	}

	exports.default = (0, _awaitify2.default)(eachOf, 3);
	module.exports = exports['default'];
	});

	unwrapExports(eachOf_1);

	var withoutIndex = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = _withoutIndex;
	function _withoutIndex(iteratee) {
	    return (value, index, callback) => iteratee(value, callback);
	}
	module.exports = exports["default"];
	});

	unwrapExports(withoutIndex);

	var forEach = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});



	var _eachOf2 = _interopRequireDefault(eachOf_1);



	var _withoutIndex2 = _interopRequireDefault(withoutIndex);



	var _wrapAsync2 = _interopRequireDefault(wrapAsync_1);



	var _awaitify2 = _interopRequireDefault(awaitify_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Applies the function `iteratee` to each item in `coll`, in parallel.
	 * The `iteratee` is called with an item from the list, and a callback for when
	 * it has finished. If the `iteratee` passes an error to its `callback`, the
	 * main `callback` (for the `each` function) is immediately called with the
	 * error.
	 *
	 * Note, that since this function applies `iteratee` to each item in parallel,
	 * there is no guarantee that the iteratee functions will complete in order.
	 *
	 * @name each
	 * @static
	 * @memberOf module:Collections
	 * @method
	 * @alias forEach
	 * @category Collection
	 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
	 * @param {AsyncFunction} iteratee - An async function to apply to
	 * each item in `coll`. Invoked with (item, callback).
	 * The array index is not passed to the iteratee.
	 * If you need the index, use `eachOf`.
	 * @param {Function} [callback] - A callback which is called when all
	 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
	 * @returns {Promise} a promise, if a callback is omitted
	 * @example
	 *
	 * // assuming openFiles is an array of file names and saveFile is a function
	 * // to save the modified contents of that file:
	 *
	 * async.each(openFiles, saveFile, function(err){
	 *   // if any of the saves produced an error, err would equal that error
	 * });
	 *
	 * // assuming openFiles is an array of file names
	 * async.each(openFiles, function(file, callback) {
	 *
	 *     // Perform operation on file here.
	 *     console.log('Processing file ' + file);
	 *
	 *     if( file.length > 32 ) {
	 *       console.log('This file name is too long');
	 *       callback('File name too long');
	 *     } else {
	 *       // Do work to process file here
	 *       console.log('File processed');
	 *       callback();
	 *     }
	 * }, function(err) {
	 *     // if any of the file processing produced an error, err would equal that error
	 *     if( err ) {
	 *       // One of the iterations produced an error.
	 *       // All processing will now stop.
	 *       console.log('A file failed to process');
	 *     } else {
	 *       console.log('All files have been processed successfully');
	 *     }
	 * });
	 */
	function eachLimit(coll, iteratee, callback) {
	  return (0, _eachOf2.default)(coll, (0, _withoutIndex2.default)((0, _wrapAsync2.default)(iteratee)), callback);
	}

	exports.default = (0, _awaitify2.default)(eachLimit, 3);
	module.exports = exports['default'];
	});

	unwrapExports(forEach);

	var toString$1 = Object.prototype.toString;

	/**
	 * Extract names from functions.
	 *
	 * @param {Function} fn The function who's name we need to extract.
	 * @returns {String} The name of the function.
	 * @public
	 */
	var fn_name = function name(fn) {
	  if ('string' === typeof fn.displayName && fn.constructor.name) {
	    return fn.displayName;
	  } else if ('string' === typeof fn.name && fn.name) {
	    return fn.name;
	  }

	  //
	  // Check to see if the constructor has a name.
	  //
	  if (
	       'object' === typeof fn
	    && fn.constructor
	    && 'string' === typeof fn.constructor.name
	  ) return fn.constructor.name;

	  //
	  // toString the given function and attempt to parse it out of it, or determine
	  // the class.
	  //
	  var named = fn.toString()
	    , type = toString$1.call(fn).slice(8, -1);

	  if ('Function' === type) {
	    named = named.substring(named.indexOf('(') + 1, named.indexOf(')'));
	  } else {
	    named = type;
	  }

	  return named || 'anonymous';
	};

	/**
	 * Wrap callbacks to prevent double execution.
	 *
	 * @param {Function} fn Function that should only be called once.
	 * @returns {Function} A wrapped callback which prevents multiple executions.
	 * @public
	 */
	var oneTime = function one(fn) {
	  var called = 0
	    , value;

	  /**
	   * The function that prevents double execution.
	   *
	   * @private
	   */
	  function onetime() {
	    if (called) return value;

	    called = 1;
	    value = fn.apply(this, arguments);
	    fn = null;

	    return value;
	  }

	  //
	  // To make debugging more easy we want to use the name of the supplied
	  // function. So when you look at the functions that are assigned to event
	  // listeners you don't see a load of `onetime` functions but actually the
	  // names of the functions that this module will call.
	  //
	  // NOTE: We cannot override the `name` property, as that is `readOnly`
	  // property, so displayName will have to do.
	  //
	  onetime.displayName = fn_name(fn);
	  return onetime;
	};

	var stackTrace = createCommonjsModule(function (module, exports) {
	exports.get = function(belowFn) {
	  var oldLimit = Error.stackTraceLimit;
	  Error.stackTraceLimit = Infinity;

	  var dummyObject = {};

	  var v8Handler = Error.prepareStackTrace;
	  Error.prepareStackTrace = function(dummyObject, v8StackTrace) {
	    return v8StackTrace;
	  };
	  Error.captureStackTrace(dummyObject, belowFn || exports.get);

	  var v8StackTrace = dummyObject.stack;
	  Error.prepareStackTrace = v8Handler;
	  Error.stackTraceLimit = oldLimit;

	  return v8StackTrace;
	};

	exports.parse = function(err) {
	  if (!err.stack) {
	    return [];
	  }

	  var self = this;
	  var lines = err.stack.split('\n').slice(1);

	  return lines
	    .map(function(line) {
	      if (line.match(/^\s*[-]{4,}$/)) {
	        return self._createParsedCallSite({
	          fileName: line,
	          lineNumber: null,
	          functionName: null,
	          typeName: null,
	          methodName: null,
	          columnNumber: null,
	          'native': null,
	        });
	      }

	      var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
	      if (!lineMatch) {
	        return;
	      }

	      var object = null;
	      var method = null;
	      var functionName = null;
	      var typeName = null;
	      var methodName = null;
	      var isNative = (lineMatch[5] === 'native');

	      if (lineMatch[1]) {
	        functionName = lineMatch[1];
	        var methodStart = functionName.lastIndexOf('.');
	        if (functionName[methodStart-1] == '.')
	          methodStart--;
	        if (methodStart > 0) {
	          object = functionName.substr(0, methodStart);
	          method = functionName.substr(methodStart + 1);
	          var objectEnd = object.indexOf('.Module');
	          if (objectEnd > 0) {
	            functionName = functionName.substr(objectEnd + 1);
	            object = object.substr(0, objectEnd);
	          }
	        }
	        typeName = null;
	      }

	      if (method) {
	        typeName = object;
	        methodName = method;
	      }

	      if (method === '<anonymous>') {
	        methodName = null;
	        functionName = null;
	      }

	      var properties = {
	        fileName: lineMatch[2] || null,
	        lineNumber: parseInt(lineMatch[3], 10) || null,
	        functionName: functionName,
	        typeName: typeName,
	        methodName: methodName,
	        columnNumber: parseInt(lineMatch[4], 10) || null,
	        'native': isNative,
	      };

	      return self._createParsedCallSite(properties);
	    })
	    .filter(function(callSite) {
	      return !!callSite;
	    });
	};

	function CallSite(properties) {
	  for (var property in properties) {
	    this[property] = properties[property];
	  }
	}

	var strProperties = [
	  'this',
	  'typeName',
	  'functionName',
	  'methodName',
	  'fileName',
	  'lineNumber',
	  'columnNumber',
	  'function',
	  'evalOrigin'
	];
	var boolProperties = [
	  'topLevel',
	  'eval',
	  'native',
	  'constructor'
	];
	strProperties.forEach(function (property) {
	  CallSite.prototype[property] = null;
	  CallSite.prototype['get' + property[0].toUpperCase() + property.substr(1)] = function () {
	    return this[property];
	  };
	});
	boolProperties.forEach(function (property) {
	  CallSite.prototype[property] = false;
	  CallSite.prototype['is' + property[0].toUpperCase() + property.substr(1)] = function () {
	    return this[property];
	  };
	});

	exports._createParsedCallSite = function(properties) {
	  return new CallSite(properties);
	};
	});
	var stackTrace_1 = stackTrace.get;
	var stackTrace_2 = stackTrace.parse;
	var stackTrace_3 = stackTrace._createParsedCallSite;

	const { Writable: Writable$2 } = readable;

	/**
	 * TODO: add class description.
	 * @type {ExceptionStream}
	 * @extends {Writable}
	 */
	var exceptionStream = class ExceptionStream extends Writable$2 {
	  /**
	   * Constructor function for the ExceptionStream responsible for wrapping a
	   * TransportStream; only allowing writes of `info` objects with
	   * `info.exception` set to true.
	   * @param {!TransportStream} transport - Stream to filter to exceptions
	   */
	  constructor(transport) {
	    super({ objectMode: true });

	    if (!transport) {
	      throw new Error('ExceptionStream requires a TransportStream instance.');
	    }

	    // Remark (indexzero): we set `handleExceptions` here because it's the
	    // predicate checked in ExceptionHandler.prototype.__getExceptionHandlers
	    this.handleExceptions = true;
	    this.transport = transport;
	  }

	  /**
	   * Writes the info object to our transport instance if (and only if) the
	   * `exception` property is set on the info.
	   * @param {mixed} info - TODO: add param description.
	   * @param {mixed} enc - TODO: add param description.
	   * @param {mixed} callback - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _write(info, enc, callback) {
	    if (info.exception) {
	      return this.transport.log(info, callback);
	    }

	    callback();
	    return true;
	  }
	};

	const debug$3 = node$1('winston:exception');




	/**
	 * Object for handling uncaughtException events.
	 * @type {ExceptionHandler}
	 */
	var exceptionHandler = class ExceptionHandler {
	  /**
	   * TODO: add contructor description
	   * @param {!Logger} logger - TODO: add param description
	   */
	  constructor(logger) {
	    if (!logger) {
	      throw new Error('Logger is required to handle exceptions');
	    }

	    this.logger = logger;
	    this.handlers = new Map();
	  }

	  /**
	   * Handles `uncaughtException` events for the current process by adding any
	   * handlers passed in.
	   * @returns {undefined}
	   */
	  handle(...args) {
	    args.forEach(arg => {
	      if (Array.isArray(arg)) {
	        return arg.forEach(handler => this._addHandler(handler));
	      }

	      this._addHandler(arg);
	    });

	    if (!this.catcher) {
	      this.catcher = this._uncaughtException.bind(this);
	      process.on('uncaughtException', this.catcher);
	    }
	  }

	  /**
	   * Removes any handlers to `uncaughtException` events for the current
	   * process. This does not modify the state of the `this.handlers` set.
	   * @returns {undefined}
	   */
	  unhandle() {
	    if (this.catcher) {
	      process.removeListener('uncaughtException', this.catcher);
	      this.catcher = false;

	      Array.from(this.handlers.values())
	        .forEach(wrapper => this.logger.unpipe(wrapper));
	    }
	  }

	  /**
	   * TODO: add method description
	   * @param {Error} err - Error to get information about.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getAllInfo(err) {
	    let { message } = err;
	    if (!message && typeof err === 'string') {
	      message = err;
	    }

	    return {
	      error: err,
	      // TODO (indexzero): how do we configure this?
	      level: 'error',
	      message: [
	        `uncaughtException: ${(message || '(no error message)')}`,
	        err.stack || '  No stack trace'
	      ].join('\n'),
	      stack: err.stack,
	      exception: true,
	      date: new Date().toString(),
	      process: this.getProcessInfo(),
	      os: this.getOsInfo(),
	      trace: this.getTrace(err)
	    };
	  }

	  /**
	   * Gets all relevant process information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getProcessInfo() {
	    return {
	      pid: process.pid,
	      uid: process.getuid ? process.getuid() : null,
	      gid: process.getgid ? process.getgid() : null,
	      cwd: process.cwd(),
	      execPath: process.execPath,
	      version: process.version,
	      argv: process.argv,
	      memoryUsage: process.memoryUsage()
	    };
	  }

	  /**
	   * Gets all relevant OS information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getOsInfo() {
	    return {
	      loadavg: os.loadavg(),
	      uptime: os.uptime()
	    };
	  }

	  /**
	   * Gets a stack trace for the specified error.
	   * @param {mixed} err - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getTrace(err) {
	    const trace = err ? stackTrace.parse(err) : stackTrace.get();
	    return trace.map(site => {
	      return {
	        column: site.getColumnNumber(),
	        file: site.getFileName(),
	        function: site.getFunctionName(),
	        line: site.getLineNumber(),
	        method: site.getMethodName(),
	        native: site.isNative()
	      };
	    });
	  }

	  /**
	   * Helper method to add a transport as an exception handler.
	   * @param {Transport} handler - The transport to add as an exception handler.
	   * @returns {void}
	   */
	  _addHandler(handler) {
	    if (!this.handlers.has(handler)) {
	      handler.handleExceptions = true;
	      const wrapper = new exceptionStream(handler);
	      this.handlers.set(handler, wrapper);
	      this.logger.pipe(wrapper);
	    }
	  }

	  /**
	   * Logs all relevant information around the `err` and exits the current
	   * process.
	   * @param {Error} err - Error to handle
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _uncaughtException(err) {
	    const info = this.getAllInfo(err);
	    const handlers = this._getExceptionHandlers();
	    // Calculate if we should exit on this error
	    let doExit = typeof this.logger.exitOnError === 'function'
	      ? this.logger.exitOnError(err)
	      : this.logger.exitOnError;
	    let timeout;

	    if (!handlers.length && doExit) {
	      // eslint-disable-next-line no-console
	      console.warn('winston: exitOnError cannot be true with no exception handlers.');
	      // eslint-disable-next-line no-console
	      console.warn('winston: not exiting process.');
	      doExit = false;
	    }

	    function gracefulExit() {
	      debug$3('doExit', doExit);
	      debug$3('process._exiting', process._exiting);

	      if (doExit && !process._exiting) {
	        // Remark: Currently ignoring any exceptions from transports when
	        // catching uncaught exceptions.
	        if (timeout) {
	          clearTimeout(timeout);
	        }
	        // eslint-disable-next-line no-process-exit
	        process.exit(1);
	      }
	    }

	    if (!handlers || handlers.length === 0) {
	      return process.nextTick(gracefulExit);
	    }

	    // Log to all transports attempting to listen for when they are completed.
	    forEach(handlers, (handler, next) => {
	      const done = oneTime(next);
	      const transport = handler.transport || handler;

	      // Debug wrapping so that we can inspect what's going on under the covers.
	      function onDone(event) {
	        return () => {
	          debug$3(event);
	          done();
	        };
	      }

	      transport._ending = true;
	      transport.once('finish', onDone('finished'));
	      transport.once('error', onDone('error'));
	    }, () => doExit && gracefulExit());

	    this.logger.log(info);

	    // If exitOnError is true, then only allow the logging of exceptions to
	    // take up to `3000ms`.
	    if (doExit) {
	      timeout = setTimeout(gracefulExit, 3000);
	    }
	  }

	  /**
	   * Returns the list of transports and exceptionHandlers for this instance.
	   * @returns {Array} - List of transports and exceptionHandlers for this
	   * instance.
	   * @private
	   */
	  _getExceptionHandlers() {
	    // Remark (indexzero): since `logger.transports` returns all of the pipes
	    // from the _readableState of the stream we actually get the join of the
	    // explicit handlers and the implicit transports with
	    // `handleExceptions: true`
	    return this.logger.transports.filter(wrap => {
	      const transport = wrap.transport || wrap;
	      return transport.handleExceptions;
	    });
	  }
	};

	const debug$4 = node$1('winston:rejection');




	/**
	 * Object for handling unhandledRejection events.
	 * @type {RejectionHandler}
	 */
	var rejectionHandler = class RejectionHandler {
	  /**
	   * TODO: add contructor description
	   * @param {!Logger} logger - TODO: add param description
	   */
	  constructor(logger) {
	    if (!logger) {
	      throw new Error('Logger is required to handle rejections');
	    }

	    this.logger = logger;
	    this.handlers = new Map();
	  }

	  /**
	   * Handles `unhandledRejection` events for the current process by adding any
	   * handlers passed in.
	   * @returns {undefined}
	   */
	  handle(...args) {
	    args.forEach(arg => {
	      if (Array.isArray(arg)) {
	        return arg.forEach(handler => this._addHandler(handler));
	      }

	      this._addHandler(arg);
	    });

	    if (!this.catcher) {
	      this.catcher = this._unhandledRejection.bind(this);
	      process.on('unhandledRejection', this.catcher);
	    }
	  }

	  /**
	   * Removes any handlers to `unhandledRejection` events for the current
	   * process. This does not modify the state of the `this.handlers` set.
	   * @returns {undefined}
	   */
	  unhandle() {
	    if (this.catcher) {
	      process.removeListener('unhandledRejection', this.catcher);
	      this.catcher = false;

	      Array.from(this.handlers.values()).forEach(wrapper =>
	        this.logger.unpipe(wrapper)
	      );
	    }
	  }

	  /**
	   * TODO: add method description
	   * @param {Error} err - Error to get information about.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getAllInfo(err) {
	    let { message } = err;
	    if (!message && typeof err === 'string') {
	      message = err;
	    }

	    return {
	      error: err,
	      // TODO (indexzero): how do we configure this?
	      level: 'error',
	      message: [
	        `unhandledRejection: ${message || '(no error message)'}`,
	        err.stack || '  No stack trace'
	      ].join('\n'),
	      stack: err.stack,
	      exception: true,
	      date: new Date().toString(),
	      process: this.getProcessInfo(),
	      os: this.getOsInfo(),
	      trace: this.getTrace(err)
	    };
	  }

	  /**
	   * Gets all relevant process information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getProcessInfo() {
	    return {
	      pid: process.pid,
	      uid: process.getuid ? process.getuid() : null,
	      gid: process.getgid ? process.getgid() : null,
	      cwd: process.cwd(),
	      execPath: process.execPath,
	      version: process.version,
	      argv: process.argv,
	      memoryUsage: process.memoryUsage()
	    };
	  }

	  /**
	   * Gets all relevant OS information for the currently running process.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getOsInfo() {
	    return {
	      loadavg: os.loadavg(),
	      uptime: os.uptime()
	    };
	  }

	  /**
	   * Gets a stack trace for the specified error.
	   * @param {mixed} err - TODO: add param description.
	   * @returns {mixed} - TODO: add return description.
	   */
	  getTrace(err) {
	    const trace = err ? stackTrace.parse(err) : stackTrace.get();
	    return trace.map(site => {
	      return {
	        column: site.getColumnNumber(),
	        file: site.getFileName(),
	        function: site.getFunctionName(),
	        line: site.getLineNumber(),
	        method: site.getMethodName(),
	        native: site.isNative()
	      };
	    });
	  }

	  /**
	   * Helper method to add a transport as an exception handler.
	   * @param {Transport} handler - The transport to add as an exception handler.
	   * @returns {void}
	   */
	  _addHandler(handler) {
	    if (!this.handlers.has(handler)) {
	      handler.handleRejections = true;
	      const wrapper = new exceptionStream(handler);
	      this.handlers.set(handler, wrapper);
	      this.logger.pipe(wrapper);
	    }
	  }

	  /**
	   * Logs all relevant information around the `err` and exits the current
	   * process.
	   * @param {Error} err - Error to handle
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  _unhandledRejection(err) {
	    const info = this.getAllInfo(err);
	    const handlers = this._getRejectionHandlers();
	    // Calculate if we should exit on this error
	    let doExit =
	      typeof this.logger.exitOnError === 'function'
	        ? this.logger.exitOnError(err)
	        : this.logger.exitOnError;
	    let timeout;

	    if (!handlers.length && doExit) {
	      // eslint-disable-next-line no-console
	      console.warn('winston: exitOnError cannot be true with no rejection handlers.');
	      // eslint-disable-next-line no-console
	      console.warn('winston: not exiting process.');
	      doExit = false;
	    }

	    function gracefulExit() {
	      debug$4('doExit', doExit);
	      debug$4('process._exiting', process._exiting);

	      if (doExit && !process._exiting) {
	        // Remark: Currently ignoring any rejections from transports when
	        // catching unhandled rejections.
	        if (timeout) {
	          clearTimeout(timeout);
	        }
	        // eslint-disable-next-line no-process-exit
	        process.exit(1);
	      }
	    }

	    if (!handlers || handlers.length === 0) {
	      return process.nextTick(gracefulExit);
	    }

	    // Log to all transports attempting to listen for when they are completed.
	    forEach(
	      handlers,
	      (handler, next) => {
	        const done = oneTime(next);
	        const transport = handler.transport || handler;

	        // Debug wrapping so that we can inspect what's going on under the covers.
	        function onDone(event) {
	          return () => {
	            debug$4(event);
	            done();
	          };
	        }

	        transport._ending = true;
	        transport.once('finish', onDone('finished'));
	        transport.once('error', onDone('error'));
	      },
	      () => doExit && gracefulExit()
	    );

	    this.logger.log(info);

	    // If exitOnError is true, then only allow the logging of exceptions to
	    // take up to `3000ms`.
	    if (doExit) {
	      timeout = setTimeout(gracefulExit, 3000);
	    }
	  }

	  /**
	   * Returns the list of transports and exceptionHandlers for this instance.
	   * @returns {Array} - List of transports and exceptionHandlers for this
	   * instance.
	   * @private
	   */
	  _getRejectionHandlers() {
	    // Remark (indexzero): since `logger.transports` returns all of the pipes
	    // from the _readableState of the stream we actually get the join of the
	    // explicit handlers and the implicit transports with
	    // `handleRejections: true`
	    return this.logger.transports.filter(wrap => {
	      const transport = wrap.transport || wrap;
	      return transport.handleRejections;
	    });
	  }
	};

	/**
	 * profiler.js: TODO: add file header description.
	 *
	 * (C) 2010 Charlie Robbins
	 * MIT LICENCE
	 */

	/**
	 * TODO: add class description.
	 * @type {Profiler}
	 * @private
	 */
	var profiler = class Profiler {
	  /**
	   * Constructor function for the Profiler instance used by
	   * `Logger.prototype.startTimer`. When done is called the timer will finish
	   * and log the duration.
	   * @param {!Logger} logger - TODO: add param description.
	   * @private
	   */
	  constructor(logger) {
	    if (!logger) {
	      throw new Error('Logger is required for profiling.');
	    }

	    this.logger = logger;
	    this.start = Date.now();
	  }

	  /**
	   * Ends the current timer (i.e. Profiler) instance and logs the `msg` along
	   * with the duration since creation.
	   * @returns {mixed} - TODO: add return description.
	   * @private
	   */
	  done(...args) {
	    if (typeof args[args.length - 1] === 'function') {
	      // eslint-disable-next-line no-console
	      console.warn('Callback function no longer supported as of winston@3.0.0');
	      args.pop();
	    }

	    const info = typeof args[args.length - 1] === 'object' ? args.pop() : {};
	    info.level = info.level || 'info';
	    info.durationMs = (Date.now()) - this.start;

	    return this.logger.write(info);
	  }
	};

	var fastSafeStringify = stringify;
	stringify.default = stringify;
	stringify.stable = deterministicStringify;
	stringify.stableStringify = deterministicStringify;

	var arr = [];
	var replacerStack = [];

	// Regular stringify
	function stringify (obj, replacer, spacer) {
	  decirc(obj, '', [], undefined);
	  var res;
	  if (replacerStack.length === 0) {
	    res = JSON.stringify(obj, replacer, spacer);
	  } else {
	    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
	  }
	  while (arr.length !== 0) {
	    var part = arr.pop();
	    if (part.length === 4) {
	      Object.defineProperty(part[0], part[1], part[3]);
	    } else {
	      part[0][part[1]] = part[2];
	    }
	  }
	  return res
	}
	function decirc (val, k, stack, parent) {
	  var i;
	  if (typeof val === 'object' && val !== null) {
	    for (i = 0; i < stack.length; i++) {
	      if (stack[i] === val) {
	        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
	        if (propertyDescriptor.get !== undefined) {
	          if (propertyDescriptor.configurable) {
	            Object.defineProperty(parent, k, { value: '[Circular]' });
	            arr.push([parent, k, val, propertyDescriptor]);
	          } else {
	            replacerStack.push([val, k]);
	          }
	        } else {
	          parent[k] = '[Circular]';
	          arr.push([parent, k, val]);
	        }
	        return
	      }
	    }
	    stack.push(val);
	    // Optimize for Arrays. Big arrays could kill the performance otherwise!
	    if (Array.isArray(val)) {
	      for (i = 0; i < val.length; i++) {
	        decirc(val[i], i, stack, val);
	      }
	    } else {
	      var keys = Object.keys(val);
	      for (i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        decirc(val[key], key, stack, val);
	      }
	    }
	    stack.pop();
	  }
	}

	// Stable-stringify
	function compareFunction (a, b) {
	  if (a < b) {
	    return -1
	  }
	  if (a > b) {
	    return 1
	  }
	  return 0
	}

	function deterministicStringify (obj, replacer, spacer) {
	  var tmp = deterministicDecirc(obj, '', [], undefined) || obj;
	  var res;
	  if (replacerStack.length === 0) {
	    res = JSON.stringify(tmp, replacer, spacer);
	  } else {
	    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
	  }
	  while (arr.length !== 0) {
	    var part = arr.pop();
	    if (part.length === 4) {
	      Object.defineProperty(part[0], part[1], part[3]);
	    } else {
	      part[0][part[1]] = part[2];
	    }
	  }
	  return res
	}

	function deterministicDecirc (val, k, stack, parent) {
	  var i;
	  if (typeof val === 'object' && val !== null) {
	    for (i = 0; i < stack.length; i++) {
	      if (stack[i] === val) {
	        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
	        if (propertyDescriptor.get !== undefined) {
	          if (propertyDescriptor.configurable) {
	            Object.defineProperty(parent, k, { value: '[Circular]' });
	            arr.push([parent, k, val, propertyDescriptor]);
	          } else {
	            replacerStack.push([val, k]);
	          }
	        } else {
	          parent[k] = '[Circular]';
	          arr.push([parent, k, val]);
	        }
	        return
	      }
	    }
	    if (typeof val.toJSON === 'function') {
	      return
	    }
	    stack.push(val);
	    // Optimize for Arrays. Big arrays could kill the performance otherwise!
	    if (Array.isArray(val)) {
	      for (i = 0; i < val.length; i++) {
	        deterministicDecirc(val[i], i, stack, val);
	      }
	    } else {
	      // Create a temporary object in the required way
	      var tmp = {};
	      var keys = Object.keys(val).sort(compareFunction);
	      for (i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        deterministicDecirc(val[key], key, stack, val);
	        tmp[key] = val[key];
	      }
	      if (parent !== undefined) {
	        arr.push([parent, k, val]);
	        parent[k] = tmp;
	      } else {
	        return tmp
	      }
	    }
	    stack.pop();
	  }
	}

	// wraps replacer function to handle values we couldn't replace
	// and mark them as [Circular]
	function replaceGetterValues (replacer) {
	  replacer = replacer !== undefined ? replacer : function (k, v) { return v };
	  return function (key, val) {
	    if (replacerStack.length > 0) {
	      for (var i = 0; i < replacerStack.length; i++) {
	        var part = replacerStack[i];
	        if (part[1] === key && part[0] === val) {
	          val = '[Circular]';
	          replacerStack.splice(i, 1);
	          break
	        }
	      }
	    }
	    return replacer.call(this, key, val)
	  }
	}

	const { MESSAGE: MESSAGE$3 } = tripleBeam;


	/*
	 * function replacer (key, value)
	 * Handles proper stringification of Buffer and bigint output.
	 */
	function replacer(key, value) {
	  if (value instanceof Buffer)
	    return value.toString('base64');
	  // eslint-disable-next-line valid-typeof
	  if (typeof value === 'bigint')
	    return value.toString();
	  return value;
	}

	/*
	 * function json (info)
	 * Returns a new instance of the JSON format that turns a log `info`
	 * object into pure JSON. This was previously exposed as { json: true }
	 * to transports in `winston < 3.0.0`.
	 */
	var json = format((info, opts = {}) => {
	  info[MESSAGE$3] = (opts.stable ? fastSafeStringify.stableStringify
	    : fastSafeStringify)(info, opts.replacer || replacer, opts.space);
	  return info;
	});

	const { Stream: Stream$3, Transform: Transform$1 } = readable;

	const { LEVEL: LEVEL$1, SPLAT } = tripleBeam;





	const { warn } = common;


	/**
	 * Captures the number of format (i.e. %s strings) in a given string.
	 * Based on `util.format`, see Node.js source:
	 * https://github.com/nodejs/node/blob/b1c8f15c5f169e021f7c46eb7b219de95fe97603/lib/util.js#L201-L230
	 * @type {RegExp}
	 */
	const formatRegExp = /%[scdjifoO%]/g;

	/**
	 * TODO: add class description.
	 * @type {Logger}
	 * @extends {Transform}
	 */
	class Logger extends Transform$1 {
	  /**
	   * Constructor function for the Logger object responsible for persisting log
	   * messages and metadata to one or more transports.
	   * @param {!Object} options - foo
	   */
	  constructor(options) {
	    super({ objectMode: true });
	    this.configure(options);
	  }

	  child(defaultRequestMetadata) {
	    const logger = this;
	    return Object.create(logger, {
	      write: {
	        value: function (info) {
	          const infoClone = Object.assign(
	            {},
	            defaultRequestMetadata,
	            info
	          );

	          // Object.assign doesn't copy inherited Error
	          // properties so we have to do that explicitly
	          //
	          // Remark (indexzero): we should remove this
	          // since the errors format will handle this case.
	          //
	          if (info instanceof Error) {
	            infoClone.stack = info.stack;
	            infoClone.message = info.message;
	          }

	          logger.write(infoClone);
	        }
	      }
	    });
	  }

	  /**
	   * This will wholesale reconfigure this instance by:
	   * 1. Resetting all transports. Older transports will be removed implicitly.
	   * 2. Set all other options including levels, colors, rewriters, filters,
	   *    exceptionHandlers, etc.
	   * @param {!Object} options - TODO: add param description.
	   * @returns {undefined}
	   */
	  configure({
	    silent,
	    format,
	    defaultMeta,
	    levels,
	    level = 'info',
	    exitOnError = true,
	    transports,
	    colors,
	    emitErrs,
	    formatters,
	    padLevels,
	    rewriters,
	    stripColors,
	    exceptionHandlers,
	    rejectionHandlers
	  } = {}) {
	    // Reset transports if we already have them
	    if (this.transports.length) {
	      this.clear();
	    }

	    this.silent = silent;
	    this.format = format || this.format || json();

	    this.defaultMeta = defaultMeta || null;
	    // Hoist other options onto this instance.
	    this.levels = levels || this.levels || config$1.npm.levels;
	    this.level = level;
	    this.exceptions = new exceptionHandler(this);
	    this.rejections = new rejectionHandler(this);
	    this.profilers = {};
	    this.exitOnError = exitOnError;

	    // Add all transports we have been provided.
	    if (transports) {
	      transports = Array.isArray(transports) ? transports : [transports];
	      transports.forEach(transport => this.add(transport));
	    }

	    if (
	      colors ||
	      emitErrs ||
	      formatters ||
	      padLevels ||
	      rewriters ||
	      stripColors
	    ) {
	      throw new Error(
	        [
	          '{ colors, emitErrs, formatters, padLevels, rewriters, stripColors } were removed in winston@3.0.0.',
	          'Use a custom winston.format(function) instead.',
	          'See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md'
	        ].join('\n')
	      );
	    }

	    if (exceptionHandlers) {
	      this.exceptions.handle(exceptionHandlers);
	    }
	    if (rejectionHandlers) {
	      this.rejections.handle(rejectionHandlers);
	    }
	  }

	  isLevelEnabled(level) {
	    const givenLevelValue = getLevelValue(this.levels, level);
	    if (givenLevelValue === null) {
	      return false;
	    }

	    const configuredLevelValue = getLevelValue(this.levels, this.level);
	    if (configuredLevelValue === null) {
	      return false;
	    }

	    if (!this.transports || this.transports.length === 0) {
	      return configuredLevelValue >= givenLevelValue;
	    }

	    const index = this.transports.findIndex(transport => {
	      let transportLevelValue = getLevelValue(this.levels, transport.level);
	      if (transportLevelValue === null) {
	        transportLevelValue = configuredLevelValue;
	      }
	      return transportLevelValue >= givenLevelValue;
	    });
	    return index !== -1;
	  }

	  /* eslint-disable valid-jsdoc */
	  /**
	   * Ensure backwards compatibility with a `log` method
	   * @param {mixed} level - Level the log message is written at.
	   * @param {mixed} msg - TODO: add param description.
	   * @param {mixed} meta - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   *
	   * @example
	   *    // Supports the existing API:
	   *    logger.log('info', 'Hello world', { custom: true });
	   *    logger.log('info', new Error('Yo, it\'s on fire'));
	   *
	   *    // Requires winston.format.splat()
	   *    logger.log('info', '%s %d%%', 'A string', 50, { thisIsMeta: true });
	   *
	   *    // And the new API with a single JSON literal:
	   *    logger.log({ level: 'info', message: 'Hello world', custom: true });
	   *    logger.log({ level: 'info', message: new Error('Yo, it\'s on fire') });
	   *
	   *    // Also requires winston.format.splat()
	   *    logger.log({
	   *      level: 'info',
	   *      message: '%s %d%%',
	   *      [SPLAT]: ['A string', 50],
	   *      meta: { thisIsMeta: true }
	   *    });
	   *
	   */
	  /* eslint-enable valid-jsdoc */
	  log(level, msg, ...splat) {
	    // eslint-disable-line max-params
	    // Optimize for the hotpath of logging JSON literals
	    if (arguments.length === 1) {
	      // Yo dawg, I heard you like levels ... seriously ...
	      // In this context the LHS `level` here is actually the `info` so read
	      // this as: info[LEVEL] = info.level;
	      level[LEVEL$1] = level.level;
	      this._addDefaultMeta(level);
	      this.write(level);
	      return this;
	    }

	    // Slightly less hotpath, but worth optimizing for.
	    if (arguments.length === 2) {
	      if (msg && typeof msg === 'object') {
	        msg[LEVEL$1] = msg.level = level;
	        this._addDefaultMeta(msg);
	        this.write(msg);
	        return this;
	      }

	      this.write({ [LEVEL$1]: level, level, message: msg });
	      return this;
	    }

	    const [meta] = splat;
	    if (typeof meta === 'object' && meta !== null) {
	      // Extract tokens, if none available default to empty array to
	      // ensure consistancy in expected results
	      const tokens = msg && msg.match && msg.match(formatRegExp);

	      if (!tokens) {
	        const info = Object.assign({}, this.defaultMeta, meta, {
	          [LEVEL$1]: level,
	          [SPLAT]: splat,
	          level,
	          message: msg
	        });

	        if (meta.message) info.message = `${info.message} ${meta.message}`;
	        if (meta.stack) info.stack = meta.stack;

	        this.write(info);
	        return this;
	      }
	    }

	    this.write(Object.assign({}, this.defaultMeta, {
	      [LEVEL$1]: level,
	      [SPLAT]: splat,
	      level,
	      message: msg
	    }));

	    return this;
	  }

	  /**
	   * Pushes data so that it can be picked up by all of our pipe targets.
	   * @param {mixed} info - TODO: add param description.
	   * @param {mixed} enc - TODO: add param description.
	   * @param {mixed} callback - Continues stream processing.
	   * @returns {undefined}
	   * @private
	   */
	  _transform(info, enc, callback) {
	    if (this.silent) {
	      return callback();
	    }

	    // [LEVEL] is only soft guaranteed to be set here since we are a proper
	    // stream. It is likely that `info` came in through `.log(info)` or
	    // `.info(info)`. If it is not defined, however, define it.
	    // This LEVEL symbol is provided by `triple-beam` and also used in:
	    // - logform
	    // - winston-transport
	    // - abstract-winston-transport
	    if (!info[LEVEL$1]) {
	      info[LEVEL$1] = info.level;
	    }

	    // Remark: really not sure what to do here, but this has been reported as
	    // very confusing by pre winston@2.0.0 users as quite confusing when using
	    // custom levels.
	    if (!this.levels[info[LEVEL$1]] && this.levels[info[LEVEL$1]] !== 0) {
	      // eslint-disable-next-line no-console
	      console.error('[winston] Unknown logger level: %s', info[LEVEL$1]);
	    }

	    // Remark: not sure if we should simply error here.
	    if (!this._readableState.pipes) {
	      // eslint-disable-next-line no-console
	      console.error(
	        '[winston] Attempt to write logs with no transports %j',
	        info
	      );
	    }

	    // Here we write to the `format` pipe-chain, which on `readable` above will
	    // push the formatted `info` Object onto the buffer for this instance. We trap
	    // (and re-throw) any errors generated by the user-provided format, but also
	    // guarantee that the streams callback is invoked so that we can continue flowing.
	    try {
	      this.push(this.format.transform(info, this.format.options));
	    } catch (ex) {
	      throw ex;
	    } finally {
	      // eslint-disable-next-line callback-return
	      callback();
	    }
	  }

	  /**
	   * Delays the 'finish' event until all transport pipe targets have
	   * also emitted 'finish' or are already finished.
	   * @param {mixed} callback - Continues stream processing.
	   */
	  _final(callback) {
	    const transports = this.transports.slice();
	    forEach(
	      transports,
	      (transport, next) => {
	        if (!transport || transport.finished) return setImmediate(next);
	        transport.once('finish', next);
	        transport.end();
	      },
	      callback
	    );
	  }

	  /**
	   * Adds the transport to this logger instance by piping to it.
	   * @param {mixed} transport - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   */
	  add(transport) {
	    // Support backwards compatibility with all existing `winston < 3.x.x`
	    // transports which meet one of two criteria:
	    // 1. They inherit from winston.Transport in  < 3.x.x which is NOT a stream.
	    // 2. They expose a log method which has a length greater than 2 (i.e. more then
	    //    just `log(info, callback)`.
	    const target =
	      !isStream_1(transport) || transport.log.length > 2
	        ? new legacy({ transport })
	        : transport;

	    if (!target._writableState || !target._writableState.objectMode) {
	      throw new Error(
	        'Transports must WritableStreams in objectMode. Set { objectMode: true }.'
	      );
	    }

	    // Listen for the `error` event and the `warn` event on the new Transport.
	    this._onEvent('error', target);
	    this._onEvent('warn', target);
	    this.pipe(target);

	    if (transport.handleExceptions) {
	      this.exceptions.handle();
	    }

	    if (transport.handleRejections) {
	      this.rejections.handle();
	    }

	    return this;
	  }

	  /**
	   * Removes the transport from this logger instance by unpiping from it.
	   * @param {mixed} transport - TODO: add param description.
	   * @returns {Logger} - TODO: add return description.
	   */
	  remove(transport) {
	    if (!transport) return this;
	    let target = transport;
	    if (!isStream_1(transport) || transport.log.length > 2) {
	      target = this.transports.filter(
	        match => match.transport === transport
	      )[0];
	    }

	    if (target) {
	      this.unpipe(target);
	    }
	    return this;
	  }

	  /**
	   * Removes all transports from this logger instance.
	   * @returns {Logger} - TODO: add return description.
	   */
	  clear() {
	    this.unpipe();
	    return this;
	  }

	  /**
	   * Cleans up resources (streams, event listeners) for all transports
	   * associated with this instance (if necessary).
	   * @returns {Logger} - TODO: add return description.
	   */
	  close() {
	    this.clear();
	    this.emit('close');
	    return this;
	  }

	  /**
	   * Sets the `target` levels specified on this instance.
	   * @param {Object} Target levels to use on this instance.
	   */
	  setLevels() {
	    warn.deprecated('setLevels');
	  }

	  /**
	   * Queries the all transports for this instance with the specified `options`.
	   * This will aggregate each transport's results into one object containing
	   * a property per transport.
	   * @param {Object} options - Query options for this instance.
	   * @param {function} callback - Continuation to respond to when complete.
	   */
	  query(options, callback) {
	    if (typeof options === 'function') {
	      callback = options;
	      options = {};
	    }

	    options = options || {};
	    const results = {};
	    const queryObject = Object.assign({}, options.query || {});

	    // Helper function to query a single transport
	    function queryTransport(transport, next) {
	      if (options.query && typeof transport.formatQuery === 'function') {
	        options.query = transport.formatQuery(queryObject);
	      }

	      transport.query(options, (err, res) => {
	        if (err) {
	          return next(err);
	        }

	        if (typeof transport.formatResults === 'function') {
	          res = transport.formatResults(res, options.format);
	        }

	        next(null, res);
	      });
	    }

	    // Helper function to accumulate the results from `queryTransport` into
	    // the `results`.
	    function addResults(transport, next) {
	      queryTransport(transport, (err, result) => {
	        // queryTransport could potentially invoke the callback multiple times
	        // since Transport code can be unpredictable.
	        if (next) {
	          result = err || result;
	          if (result) {
	            results[transport.name] = result;
	          }

	          // eslint-disable-next-line callback-return
	          next();
	        }

	        next = null;
	      });
	    }

	    // Iterate over the transports in parallel setting the appropriate key in
	    // the `results`.
	    forEach(
	      this.transports.filter(transport => !!transport.query),
	      addResults,
	      () => callback(null, results)
	    );
	  }

	  /**
	   * Returns a log stream for all transports. Options object is optional.
	   * @param{Object} options={} - Stream options for this instance.
	   * @returns {Stream} - TODO: add return description.
	   */
	  stream(options = {}) {
	    const out = new Stream$3();
	    const streams = [];

	    out._streams = streams;
	    out.destroy = () => {
	      let i = streams.length;
	      while (i--) {
	        streams[i].destroy();
	      }
	    };

	    // Create a list of all transports for this instance.
	    this.transports
	      .filter(transport => !!transport.stream)
	      .forEach(transport => {
	        const str = transport.stream(options);
	        if (!str) {
	          return;
	        }

	        streams.push(str);

	        str.on('log', log => {
	          log.transport = log.transport || [];
	          log.transport.push(transport.name);
	          out.emit('log', log);
	        });

	        str.on('error', err => {
	          err.transport = err.transport || [];
	          err.transport.push(transport.name);
	          out.emit('error', err);
	        });
	      });

	    return out;
	  }

	  /**
	   * Returns an object corresponding to a specific timing. When done is called
	   * the timer will finish and log the duration. e.g.:
	   * @returns {Profile} - TODO: add return description.
	   * @example
	   *    const timer = winston.startTimer()
	   *    setTimeout(() => {
	   *      timer.done({
	   *        message: 'Logging message'
	   *      });
	   *    }, 1000);
	   */
	  startTimer() {
	    return new profiler(this);
	  }

	  /**
	   * Tracks the time inbetween subsequent calls to this method with the same
	   * `id` parameter. The second call to this method will log the difference in
	   * milliseconds along with the message.
	   * @param {string} id Unique id of the profiler
	   * @returns {Logger} - TODO: add return description.
	   */
	  profile(id, ...args) {
	    const time = Date.now();
	    if (this.profilers[id]) {
	      const timeEnd = this.profilers[id];
	      delete this.profilers[id];

	      // Attempt to be kind to users if they are still using older APIs.
	      if (typeof args[args.length - 2] === 'function') {
	        // eslint-disable-next-line no-console
	        console.warn(
	          'Callback function no longer supported as of winston@3.0.0'
	        );
	        args.pop();
	      }

	      // Set the duration property of the metadata
	      const info = typeof args[args.length - 1] === 'object' ? args.pop() : {};
	      info.level = info.level || 'info';
	      info.durationMs = time - timeEnd;
	      info.message = info.message || id;
	      return this.write(info);
	    }

	    this.profilers[id] = time;
	    return this;
	  }

	  /**
	   * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
	   * @returns {undefined}
	   * @deprecated
	   */
	  handleExceptions(...args) {
	    // eslint-disable-next-line no-console
	    console.warn(
	      'Deprecated: .handleExceptions() will be removed in winston@4. Use .exceptions.handle()'
	    );
	    this.exceptions.handle(...args);
	  }

	  /**
	   * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
	   * @returns {undefined}
	   * @deprecated
	   */
	  unhandleExceptions(...args) {
	    // eslint-disable-next-line no-console
	    console.warn(
	      'Deprecated: .unhandleExceptions() will be removed in winston@4. Use .exceptions.unhandle()'
	    );
	    this.exceptions.unhandle(...args);
	  }

	  /**
	   * Throw a more meaningful deprecation notice
	   * @throws {Error} - TODO: add throws description.
	   */
	  cli() {
	    throw new Error(
	      [
	        'Logger.cli() was removed in winston@3.0.0',
	        'Use a custom winston.formats.cli() instead.',
	        'See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md'
	      ].join('\n')
	    );
	  }

	  /**
	   * Bubbles the `event` that occured on the specified `transport` up
	   * from this instance.
	   * @param {string} event - The event that occured
	   * @param {Object} transport - Transport on which the event occured
	   * @private
	   */
	  _onEvent(event, transport) {
	    function transportEvent(err) {
	      // https://github.com/winstonjs/winston/issues/1364
	      if (event === 'error' && !this.transports.includes(transport)) {
	        this.add(transport);
	      }
	      this.emit(event, err, transport);
	    }

	    if (!transport['__winston' + event]) {
	      transport['__winston' + event] = transportEvent.bind(this);
	      transport.on(event, transport['__winston' + event]);
	    }
	  }

	  _addDefaultMeta(msg) {
	    if (this.defaultMeta) {
	      Object.assign(msg, this.defaultMeta);
	    }
	  }
	}

	function getLevelValue(levels, level) {
	  const value = levels[level];
	  if (!value && value !== 0) {
	    return null;
	  }
	  return value;
	}

	/**
	 * Represents the current readableState pipe targets for this Logger instance.
	 * @type {Array|Object}
	 */
	Object.defineProperty(Logger.prototype, 'transports', {
	  configurable: false,
	  enumerable: true,
	  get() {
	    const { pipes } = this._readableState;
	    return !Array.isArray(pipes) ? [pipes].filter(Boolean) : pipes;
	  }
	});

	var logger$1 = Logger;

	const { LEVEL: LEVEL$2 } = tripleBeam;


	const debug$5 = node$1('winston:create-logger');

	function isLevelEnabledFunctionName(level) {
	  return 'is' + level.charAt(0).toUpperCase() + level.slice(1) + 'Enabled';
	}

	/**
	 * Create a new instance of a winston Logger. Creates a new
	 * prototype for each instance.
	 * @param {!Object} opts - Options for the created logger.
	 * @returns {Logger} - A newly created logger instance.
	 */
	var createLogger = function (opts = {}) {
	  //
	  // Default levels: npm
	  //
	  opts.levels = opts.levels || config$1.npm.levels;

	  /**
	   * DerivedLogger to attach the logs level methods.
	   * @type {DerivedLogger}
	   * @extends {Logger}
	   */
	  class DerivedLogger extends logger$1 {
	    /**
	     * Create a new class derived logger for which the levels can be attached to
	     * the prototype of. This is a V8 optimization that is well know to increase
	     * performance of prototype functions.
	     * @param {!Object} options - Options for the created logger.
	     */
	    constructor(options) {
	      super(options);
	    }
	  }

	  const logger = new DerivedLogger(opts);

	  //
	  // Create the log level methods for the derived logger.
	  //
	  Object.keys(opts.levels).forEach(function (level) {
	    debug$5('Define prototype method for "%s"', level);
	    if (level === 'log') {
	      // eslint-disable-next-line no-console
	      console.warn('Level "log" not defined: conflicts with the method "log". Use a different level name.');
	      return;
	    }

	    //
	    // Define prototype methods for each log level e.g.:
	    // logger.log('info', msg) implies these methods are defined:
	    // - logger.info(msg)
	    // - logger.isInfoEnabled()
	    //
	    // Remark: to support logger.child this **MUST** be a function
	    // so it'll always be called on the instance instead of a fixed
	    // place in the prototype chain.
	    //
	    DerivedLogger.prototype[level] = function (...args) {
	      // Prefer any instance scope, but default to "root" logger
	      const self = this || logger;

	      // Optimize the hot-path which is the single object.
	      if (args.length === 1) {
	        const [msg] = args;
	        const info = msg && msg.message && msg || { message: msg };
	        info.level = info[LEVEL$2] = level;
	        self._addDefaultMeta(info);
	        self.write(info);
	        return (this || logger);
	      }

	      // When provided nothing assume the empty string
	      if (args.length === 0) {
	        self.log(level, '');
	        return self;
	      }

	      // Otherwise build argument list which could potentially conform to
	      // either:
	      // . v3 API: log(obj)
	      // 2. v1/v2 API: log(level, msg, ... [string interpolate], [{metadata}], [callback])
	      return self.log(level, ...args);
	    };

	    DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function () {
	      return (this || logger).isLevelEnabled(level);
	    };
	  });

	  return logger;
	};

	/**
	 * Inversion of control container for winston logger instances.
	 * @type {Container}
	 */
	var container = class Container {
	  /**
	   * Constructor function for the Container object responsible for managing a
	   * set of `winston.Logger` instances based on string ids.
	   * @param {!Object} [options={}] - Default pass-thru options for Loggers.
	   */
	  constructor(options = {}) {
	    this.loggers = new Map();
	    this.options = options;
	  }

	  /**
	   * Retreives a `winston.Logger` instance for the specified `id`. If an
	   * instance does not exist, one is created.
	   * @param {!string} id - The id of the Logger to get.
	   * @param {?Object} [options] - Options for the Logger instance.
	   * @returns {Logger} - A configured Logger instance with a specified id.
	   */
	  add(id, options) {
	    if (!this.loggers.has(id)) {
	      // Remark: Simple shallow clone for configuration options in case we pass
	      // in instantiated protoypal objects
	      options = Object.assign({}, options || this.options);
	      const existing = options.transports || this.options.transports;

	      // Remark: Make sure if we have an array of transports we slice it to
	      // make copies of those references.
	      options.transports = existing ? existing.slice() : [];

	      const logger = createLogger(options);
	      logger.on('close', () => this._delete(id));
	      this.loggers.set(id, logger);
	    }

	    return this.loggers.get(id);
	  }

	  /**
	   * Retreives a `winston.Logger` instance for the specified `id`. If
	   * an instance does not exist, one is created.
	   * @param {!string} id - The id of the Logger to get.
	   * @param {?Object} [options] - Options for the Logger instance.
	   * @returns {Logger} - A configured Logger instance with a specified id.
	   */
	  get(id, options) {
	    return this.add(id, options);
	  }

	  /**
	   * Check if the container has a logger with the id.
	   * @param {?string} id - The id of the Logger instance to find.
	   * @returns {boolean} - Boolean value indicating if this instance has a
	   * logger with the specified `id`.
	   */
	  has(id) {
	    return !!this.loggers.has(id);
	  }

	  /**
	   * Closes a `Logger` instance with the specified `id` if it exists.
	   * If no `id` is supplied then all Loggers are closed.
	   * @param {?string} id - The id of the Logger instance to close.
	   * @returns {undefined}
	   */
	  close(id) {
	    if (id) {
	      return this._removeLogger(id);
	    }

	    this.loggers.forEach((val, key) => this._removeLogger(key));
	  }

	  /**
	   * Remove a logger based on the id.
	   * @param {!string} id - The id of the logger to remove.
	   * @returns {undefined}
	   * @private
	   */
	  _removeLogger(id) {
	    if (!this.loggers.has(id)) {
	      return;
	    }

	    const logger = this.loggers.get(id);
	    logger.close();
	    this._delete(id);
	  }

	  /**
	   * Deletes a `Logger` instance with the specified `id`.
	   * @param {!string} id - The id of the Logger instance to delete from
	   * container.
	   * @returns {undefined}
	   * @private
	   */
	  _delete(id) {
	    this.loggers.delete(id);
	  }
	};

	var require$$1 = getCjsExportFromNamespace(_package$3);

	var winston_1 = createCommonjsModule(function (module, exports) {


	const { warn } = common;

	/**
	 * Setup to expose.
	 * @type {Object}
	 */
	const winston = exports;

	/**
	 * Expose version. Use `require` method for `webpack` support.
	 * @type {string}
	 */
	winston.version = require$$1.version;
	/**
	 * Include transports defined by default by winston
	 * @type {Array}
	 */
	winston.transports = transports;
	/**
	 * Expose utility methods
	 * @type {Object}
	 */
	winston.config = config$1;
	/**
	 * Hoist format-related functionality from logform.
	 * @type {Object}
	 */
	winston.addColors = logform.levels;
	/**
	 * Hoist format-related functionality from logform.
	 * @type {Object}
	 */
	winston.format = logform.format;
	/**
	 * Expose core Logging-related prototypes.
	 * @type {function}
	 */
	winston.createLogger = createLogger;
	/**
	 * Expose core Logging-related prototypes.
	 * @type {Object}
	 */
	winston.ExceptionHandler = exceptionHandler;
	/**
	 * Expose core Logging-related prototypes.
	 * @type {Object}
	 */
	winston.RejectionHandler = rejectionHandler;
	/**
	 * Expose core Logging-related prototypes.
	 * @type {Container}
	 */
	winston.Container = container;
	/**
	 * Expose core Logging-related prototypes.
	 * @type {Object}
	 */
	winston.Transport = winstonTransport;
	/**
	 * We create and expose a default `Container` to `winston.loggers` so that the
	 * programmer may manage multiple `winston.Logger` instances without any
	 * additional overhead.
	 * @example
	 *   // some-file1.js
	 *   const logger = require('winston').loggers.get('something');
	 *
	 *   // some-file2.js
	 *   const logger = require('winston').loggers.get('something');
	 */
	winston.loggers = new winston.Container();

	/**
	 * We create and expose a 'defaultLogger' so that the programmer may do the
	 * following without the need to create an instance of winston.Logger directly:
	 * @example
	 *   const winston = require('winston');
	 *   winston.log('info', 'some message');
	 *   winston.error('some error');
	 */
	const defaultLogger = winston.createLogger();

	// Pass through the target methods onto `winston.
	Object.keys(winston.config.npm.levels)
	  .concat([
	    'log',
	    'query',
	    'stream',
	    'add',
	    'remove',
	    'clear',
	    'profile',
	    'startTimer',
	    'handleExceptions',
	    'unhandleExceptions',
	    'handleRejections',
	    'unhandleRejections',
	    'configure',
	    'child'
	  ])
	  .forEach(
	    method => (winston[method] = (...args) => defaultLogger[method](...args))
	  );

	/**
	 * Define getter / setter for the default logger level which need to be exposed
	 * by winston.
	 * @type {string}
	 */
	Object.defineProperty(winston, 'level', {
	  get() {
	    return defaultLogger.level;
	  },
	  set(val) {
	    defaultLogger.level = val;
	  }
	});

	/**
	 * Define getter for `exceptions` which replaces `handleExceptions` and
	 * `unhandleExceptions`.
	 * @type {Object}
	 */
	Object.defineProperty(winston, 'exceptions', {
	  get() {
	    return defaultLogger.exceptions;
	  }
	});

	/**
	 * Define getters / setters for appropriate properties of the default logger
	 * which need to be exposed by winston.
	 * @type {Logger}
	 */
	['exitOnError'].forEach(prop => {
	  Object.defineProperty(winston, prop, {
	    get() {
	      return defaultLogger[prop];
	    },
	    set(val) {
	      defaultLogger[prop] = val;
	    }
	  });
	});

	/**
	 * The default transports and exceptionHandlers for the default winston logger.
	 * @type {Object}
	 */
	Object.defineProperty(winston, 'default', {
	  get() {
	    return {
	      exceptionHandlers: defaultLogger.exceptionHandlers,
	      rejectionHandlers: defaultLogger.rejectionHandlers,
	      transports: defaultLogger.transports
	    };
	  }
	});

	// Have friendlier breakage notices for properties that were exposed by default
	// on winston < 3.0.
	warn.deprecated(winston, 'setLevels');
	warn.forFunctions(winston, 'useFormat', ['cli']);
	warn.forProperties(winston, 'useFormat', ['padLevels', 'stripColors']);
	warn.forFunctions(winston, 'deprecated', [
	  'addRewriter',
	  'addFilter',
	  'clone',
	  'extend'
	]);
	warn.forProperties(winston, 'deprecated', ['emitErrs', 'levelLength']);
	// Throw a useful error when users attempt to run `new winston.Logger`.
	warn.moved(winston, 'createLogger', 'Logger');
	});

	var winston = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': winston_1,
		__moduleExports: winston_1
	});

	var logger$2 = undefined({
	  level: 'info',
	  format: undefined(undefined(), undefined(), undefined()),
	  defaultMeta: {
	    service: 'trendytrend'
	  }
	});

	{
	  logger$2.add(new undefined());
	} // Call exceptions.handle with a transport to handle exceptions


	logger$2.exceptions.handle(new undefined({
	  filename: 'exceptions.log'
	}));

	function _await(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	function _async(f) {
	  return function () {
	    var arguments$1 = arguments;

	    for (var args = [], i = 0; i < arguments.length; i++) {
	      args[i] = arguments$1[i];
	    }

	    try {
	      return Promise.resolve(f.apply(this, args));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  };
	}

	var PGData = function PGData(params) {
	  var _this = this,
	        _this2 = this;

	  this.getTable = _async(function (tableName) {
	    return _await(_this._client.connect(), function (client) {
	      // try {
	      // } catch(err) {
	      //   logger.log('error', `error connecting to PG ${err}`)
	      // }
	      var table = tableName || _this._params.tableName || 'industry';
	      if (!table) { logger$2.log('error', ("cannot find " + table + " or tableName wasn't provided")); }
	      var simpleQuery = "SELECT * FROM public." + table + " ORDER BY id ASC ";
	      return _await(_this._client.query(simpleQuery), function (res) {
	        // try {
	        // } catch(err) {
	        //   logger.log('error', `error getting data for this query '${simpleQuery}', error- ${err}`)
	        // }
	        client.release(true);
	        return res;
	      });
	    });
	  });
	  this.getTableRandom = _async(function (tableName, randomLimit) {
	    return _await(_this2._client.connect(), function (client) {
	      var table = tableName || _this2._params.tableName || 'industry';
	      randomLimit = randomLimit || 680;
	      if (!table) { logger$2.log('error', ("cannot find " + table + " or tableName wasn't provided")); }
	      var randomItems = "SELECT id, \"Name\", \"Key\" FROM public." + table + " order BY RANDOM() LIMIT " + randomLimit + " ;";
	      return _await(_this2._client.query(randomItems), function (res) {
	        client.release(true);
	        return res;
	      });
	    });
	  });
	  this._params = params || {};
	  this._client = new PGClient(params).getClient();
	};

	exports.PGClient = PGClient;
	exports.PGData = PGData;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
