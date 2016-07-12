const expect = require('expect.js');
const express = require('express');
const request = require('supertest');

const isReferrerSpam = require('../');

const NOT_SPAMING = 'google.com';
const IS_SPAMING = 'free-traffic.xyz';

var server;

beforeEach(() => {
	server = express();
});

describe('Middleware', () => {

	describe('Marking spammers', () => {

		beforeEach(() => {

			server.get('/', isReferrerSpam(markSpammer), returnJsonWithMark);

			function markSpammer(req, res, next){
				req.isSpammer = true;
				next();
			}

			function returnJsonWithMark(req, res){
				res.json({ isSpammer: !!req.isSpammer });
			}

		});

		it('Should be able to mark a spammer', done => {

			request(server)
				.get('/')
				.set('referer', IS_SPAMING)
				.end((err, res) => {
					expect(err).to.be.eql(null);
					expect(res.body.isSpammer).to.be.equal(true);

					done();
				});

		});

		it('Shouldn\'t mark a request from a non spammer', done => {

			request(server)
				.get('/')
				.set('referer', NOT_SPAMING)
				.end((err, res) => {
					expect(err).to.be.eql(null);
					expect(res.body.isSpammer).to.be.equal(false);

					done();
				});

		});

	});

	describe('Blocking spammer', () => {

		beforeEach(() => {

			server.get('/', isReferrerSpam(blockSpammer), resOk);

			function blockSpammer(req, res, next){
				res.status(404).end();
			}

			function resOk(req, res){
				res.status(200).end();
			}

		});

		it('Should be able to block a spammer', done => {

			request(server)
				.get('/')
				.set('referer', IS_SPAMING)
				.expect(404, done);

		});

		it('Shouldn\'t block a request from a non spammer', done => {

			request(server)
				.get('/')
				.set('referer', NOT_SPAMING)
				.expect(200, done);

		});

	});

});