/***************************
 *  class test case
 *  testing web server by requesting with URL and SEND(parameters),
 *  verifying the result data with TEST obj - a keyword test data
 **/
const log4js = require('log4js');
const expect = require('chai').expect;
const config = require('config');
const util = require('util');
const request = require('superagent');

const keywordsTester = require('./keywordsTester');
const def = require('../def')

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');


class TestCase {
    constructor(testCase) {
        expect(testCase.URL).to.be.ok;
        this.URL = testCase.URL;
        this.SEND = testCase.SEND;
        this.TEST = testCase.TEST;
    }

    runTestCasePromise(cookie) {
        let that = this;
        if (that.SEND.exports) {
            logger.warn(`\n      ${this.URL} | send parameters with "exports=1", will not workded!`);
        }
        return request
            .get(`${config.svrInfo.url}${that.URL}?${def.parseJson2Params(that.SEND)}`)
            .set('Cookie', cookie)
            .then(res => {
                // execute keyword parser and verify the result
                let result = null;
                if (typeof(res.body) == 'string') {
                    try {
                        result = JSON.parse(res.body);
                    } catch (err) {
                        throw new Error(`JSON.parse error from: ${that.URL} | ${res.body} | ${err.message}`);
                    }
                } else {
                    result = res.body;
                }
                if (!result) {
                    throw new Error('response body can not be empty!');
                }
                result = def.getattr(result, config.datakey);
                logger.debug(`Data Return From | ${that.URL} | \n      ${JSON.stringify(res.body)}`);
                try {
                    keywordsTester(result, that);
                } catch (err) {
                    throw new Error(`${err.message} | `);
                }
                return { status: true, name: that.URL };
            })
            .catch((err) => {
                return { status: false, msg: err.message, name: that.URL };
            })
    }
}

exports = module.exports = TestCase;
