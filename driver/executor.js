'use strict';
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const co = require('co');
const config = require('config');
const Suite = require('./TestSuites');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

module.exports = {
    run
}

/**
 * execute test suits what is an array of test suite,
 * all the test suite will be executed asynchronously
 * @param  {[Array]} testSuiteArr
 * [
 *     {
 *         name: 'suite_1',
 *         cases: [
 *             {
 *                 URL: "xxx",
 *                 SEND: "xxx",
 *                 TEST: ....
 *             }
 *         ]
 *     }
 * ]
 * @return {[type]}              
 */
function run(testSuiteArr){
    if(testSuiteArr.length == 0){
        logger.warn('Test Suites is empty!')
        return;
    }
    for (let suite of testSuiteArr){
        try{
            runSuite(suite)
        }catch(err){
            logger.error(`Test suite ${suite.name} Corrupt!`, err);
        }
    }
}

/**
 * run a single test suite
 * @param  {[Suite]} testSuite 
 * @return {[type]}
 */
function runSuite(testSuite){
    logger.info(`Begin run test suite "${testSuite.name}"...`);
    let suite = new Suite({
        name: testSuite.name,
        before: testSuite.before,
        after: testSuite.after,
        cases: testSuite.cases
    });
    suite.runTestSuite();
}