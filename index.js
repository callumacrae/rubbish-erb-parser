'use strict';

var fs = require('fs');

var _ = require('lodash');
var nunjucks = require('nunjucks');
var objToAttrs = require('obj-to-attrs');
var Q = require('q');

var erbParser = module.exports = {};

// A couple default helpers. More coming soon.
var contextDefaults = {
	image_path: function (options, path) {
		return options.getImagePath(path);
	},
	image_tag: function (options, path, attrs) {
		path = options.getImagePath(path);

		attrs = objToAttrs(attrs);
		if (attrs) {
			attrs = ' ' + attrs;
		}

		return '<img src="' + path + '"' + attrs + '>';
	}
};

/**
 * Internal function to get the context object, binding them to the context
 * object and passing in the options.
 *
 * @private
 * @param {object} options The options to bind the context functions to.
 * @param {object} context Context items to add to the default.
 * @returns {object} The new, bound, context object to be passed to nunjucks.
 */
function getContext(options, context) {
	return _.merge(_.mapValues(contextDefaults, function (value) {
		if (typeof value === 'function') {
			return value.bind(context, options);
		} else {
			return value;
		}
	}), context);
}

/**
 * Render an erb string with a tiny subset of erb.
 *
 * @param {string} str The string to parse.
 * @param {object} [options] Optional options object, containing stuff like
 *                           nunjucks config and image paths.
 * @param {object} [context] The variables to use in the erb.
 * @returns {Promise} Returns a promise which will be resolved when rendered.
 */
erbParser.renderString = function renderString(str, options, context) {
	// Make options optional
	if (typeof context !== 'object' && typeof options === 'object') {
		context = options;
		options = {};
	}

	options = _.merge({
		nunjucks: {
			watch: false,
			tags: {
				variableStart: '<%=',
				variableEnd: '%>'
			}
		},
		imagePath: 'imgs/',
		getImagePath: function getImagePath(path) {
			var index = path.indexOf('//');
			return index != -1 && index < 7 ? path : this.imagePath + path;
		}
	}, options);

	var env = nunjucks.configure(options.nunjucks);
	return Q.ninvoke(env, 'renderString', str, getContext(options, context));
};

/**
 * Render an erb file.
 *
 * @param {string} file The path to the file.
 * @param {object} [options] Optional options object. {@see renderString}
 * @param {object} [context] The variables to use in the erb file.
 * @returns {Promise} Returns a promise which will be resolved when rendered.
 */
erbParser.render = function render(file, options, context) {
	return Q.nfcall(fs.readFile, file, 'utf8')
		.then(function (str) {
			return erbParser.renderString(str, options, context);
		});
};

/**
 * Adds a helper that you can use in the erb.
 *
 * @param {string} name The name of the helper, e.g. "image_tag".
 * @param {function} helper The helper to be called in the erb file.
 */
erbParser.addHelper = function addHelper(name, helper) {
	contextDefaults[name] = helper;
};

