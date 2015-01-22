/* global describe, it */

'use strict';

var erbParser = require('./../index');

var should = require('should');

describe('Rubbish erb parser', function () {
	describe('rendering', function () {
		it('should handle simple strings', function () {
			return erbParser.renderString('<p>test</p>')
				.then(function (str) {
					str.should.equal('<p>test</p>');
				});
		});

		it('should handle variables', function () {
			return erbParser.renderString('<%= foo %>', { foo: 'bar' })
				.then(function (str) {
					str.should.equal('bar');
				});
		});

		it('should handle functions', function () {
			function t(foo) {
				return foo === 'foo' ? 'bar' : 'wat';
			}

			return erbParser.renderString('<%= t("foo") %>', { t: t })
				.then(function (str) {
					str.should.equal('bar');
				});
		});

		it('should render files', function () {
			return erbParser.render('test/example.html', { greeting: 'hi' })
				.then(function (str) {
					str.should.equal('<p>hi</p>')
				})
		});
	});

	describe('helpers', function () {
		it('should have built in image_path helper', function () {
			return erbParser.renderString('<%= image_path("dog.png") %>')
				.then(function (str) {
					str.should.equal('imgs/dog.png');
				});
		});

		it('should have built in image_tag helper', function () {
			return erbParser.render('test/image_tag.html')
				.then(function (str) {
					str.should.equal('<img src="imgs/dog.png" foo="bar">');
				});
		});

		it('should let you change the image path', function () {
			var options = { imagePath: '../images/' };
			return erbParser.render('test/image_tag.html', options, {})
				.then(function (str) {
					str.should.equal('<img src="../images/dog.png" foo="bar">');
				});
		});

		it('should let you change the image path using a function', function () {
			var options = {
				getImagePath: function (path) {
					return '//cdn.com/' + path.replace('.', '-small.');
				}
			};
			return erbParser.render('test/image_tag.html', options, {})
				.then(function (str) {
					str.should.equal('<img src="//cdn.com/dog-small.png" foo="bar">');
				});
		});
	});

	describe('custom helpers', function () {
		it('should let you add helpers', function () {
			erbParser.addHelper('to_upper', function (options, lower) {
				return lower.toUpperCase();
			});

			erbParser.renderString('<%= to_upper("test") %>')
				.then(function (str) {
					str.should.equal('TEST');
				});
		});
	});
});
