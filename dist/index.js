/*!
 * @dimkk/pg-worker2 v0.0.0
 * (c) [authorFullName]
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var pg = _interopDefault(require('pg'));
var winston = require('winston');

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
  this._client = new pg.Pool(this._opts.pgClientConfig);
};

var logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.colorize()),
  defaultMeta: {
    service: 'trendytrend'
  }
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
} else {
  logger.add(new winston.transports.File({
    filename: 'error.log',
    level: 'error'
  }));
  logger.add(new winston.transports.File({
    filename: 'all.log'
  }));
} // Call exceptions.handle with a transport to handle exceptions


logger.exceptions.handle(new winston.transports.File({
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
      if (!table) { logger.log('error', ("cannot find " + table + " or tableName wasn't provided")); }
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
      if (!table) { logger.log('error', ("cannot find " + table + " or tableName wasn't provided")); }
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
//# sourceMappingURL=index.js.map
