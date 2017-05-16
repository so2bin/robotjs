/**
 * class Test Suite
 */
'use strict';
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const expect = require('chai').expect;
const config = require('config');
const util = require('util');

const SuiteBase = require('./suiteBase');
const TestCase = require('./TestCase');
const def = require('../def')
const cookieManager = require('../cookie');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');


class Suite extends SuiteBase {
    constructor(opts) {
        super();
        this.before = opts.before || this.before;
        this.after = opts.after || this.after;
        this.name = opts.name || this.name;
        this.cases = opts.cases || this.cases;
        this.numSuites = this.cases.length;
    }

    endTestSuite() {
        logger.info(
            `
            TestSuite "${this.name}" Finished,
                      ${this.numSuites}  total test cases,
                ${def.color.ok}    ${this.numPassed}  cases passed,
                ${def.color.fail}    ${this.numFailed}  cases failed,
                ${def.color.skip}    ${this.numIgnored}  cases skipped
            `
        )
    }

    runTestCases() {
        let casesPromiseArr = [];
        for (let tstCase of this.cases) {
            if (tstCase.bIgnore) {
                ++this.numIgnored;
                continue;
            }
            casesPromiseArr.push((new TestCase(tstCase)).runTestCasePromise(this.cookie));
        }
        return casesPromiseArr;
    }

    logTestCasesRes(resArr) {
        resArr.forEach((res) => {
            if (res.status) {
                ++this.numPassed;
                logger.info(`\n        Test Case Succeed | "${res.name}"`);
            } else {
                ++this.numFailed;
                logger.error(`\n        Test Case Failed    | "${res.name}" | ${res.msg}`);
            }
        })
    }

    async runTestSuite() {
        try {
            this.cookie = await cookieManager.getCookieStr();
            expect(this.cookie, 'get empty cookie!').to.be.ok;
            let runRes = await Promise.all(this.runTestCases());
            this.logTestCasesRes(runRes);
            this.endTestSuite()
        } catch (err) {
            ++this.numFailed;
            this.endTestSuite();
            logger.error(`\n        Testing Suite: ${this.name} Run Failed! \n        ${err}`);
        }
    }
}

exports = module.exports = Suite;
