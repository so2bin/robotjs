/*********************************
 * the keywords parser and tester
 **/
const log4js = require('log4js');
const expect = require('chai').expect;
const config = require('config');
const util = require('util');

const libs = require('../testlibs');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

exports = module.exports = keywordsTest;

const STR_DATA_KEY = "msg"; // the effective data key of response from requesting
const kw_re = /^__(.+)/; // the regular expression foe keywords


function keywordsTest(response, testCase) {
    expect(testCase, 'test case can not be empty').not.to.be.empty;
    let kwTester = new KWTester(response, testCase);
    kwTester.parserKeyword(kwTester.curObj, testCase.TEST, kwTester.kw);
}

/*************************************************************/
class KWTester {
    constructor(response, testCase) {
        this.testCase = testCase;
        this.curObj = response;
        this.kwsObj = testCase.TEST;
        this.kw = STR_DATA_KEY;
    }

    /**
     * kerwords formart:
     * __keyword: ["k1", "k2"] or __keyword: [{....}]
     * the value of keyword must be a array, the member of array can be string or object 
     * what is decided by the implementation of keyword
     *
     * parsse keyword and execute keyword-function with data,
     * keys that find curObj and start with "__" are considered as a keyword
     * and the other is considered as the real key of data
     * 
     * @param  {[object]} curObj  
     * @param  {[obejct]} testObj 
     * @param  {[string]} curKW   
     * @return {[type]}
     */
    parserKeyword(curObj, testObj, curKW) {
        let that = this;
        curKW = curKW || this.kw;
        if (util.isArray(curObj)) {
            for (let obj in curObj) {
                this.parserKeyword(obj, testObj, curKW);
            }
        } else if (util.isObject(curObj)) {
            this.parseObject(curObj, testObj, curKW);
        }
    }

    parseObject(curObj, testObj, curKW) {
        for (let key in testObj) {
            // if is keyword, testing all the keywords in array
            if (kw_re.test(key)) {
                let keyFunc = key.match(kw_re)[1];
                expect(libs).to.have.any.keys(keyFunc);
                testObj[key].forEach((tMem) => {
                    // return current test case after one keywrod testing failed
                    try {
                        libs[keyFunc](curObj, tMem);
                    } catch (e) {
                        e.message = `${curKW} | ${key} | ${e.message}`;
                        throw e;
                    }
                })
            } else {
                // key is the real key of testObj
                // store the curObj
                let tmpObj = curObj;
                curObj = curObj[key];
                // if curObj is array, traversal all the values
                if (util.isArray(curObj)) {
                    if (curObj.length == 0) {
                        logger.warn(`Array is []: ${this.testCase.URL} | ${curKW} | ${key}`);
                    }
                    curObj.forEach((obj) => {
                        that.parserKeyword(obj, testObj[key], key);
                    })
                } else {
                    that.parserKeyword(curObj, testObj[key], key);
                }
                // restore the curObj
                curObj = tmpObj;
            }
        }
    }
}
