/*********
 * .js text parser => one .js text is a test suite
 *  one js test can contain many test cases, every test case must 
 *  comply with the following rules:
 *  exports.testcase_1 = {
 *      URL: "xxxx",
 *      SEND: {
 *          ...
 *      },
 *      TEST: {
 *          ....
 *      }
 *  }
 **/

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const co = require('co');
const config = require('config');
const expect = require('chai').expect;
const def = require('../../def');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

class JSParser {
    constructor() {
        this.testObjectDict = {
                cur: null
            },
            this.flags = { // read file flags
                url: false,
                send: false,
                test: false
            }
    }

    /**
     * return an array of file unit test suites, where each file can contain many test cases,
     * the format of file unit array:
     * [
     *     {
     *         "name": "suite_1",
     *         "cases": [
     *             {
     *                 "URL": "xxx",
     *                 "SEND": {....}
     *                 "TEST": {....}
     *             }
     *         ]
     *     }
     * ]
     * @param  {string} fdir 
     * @return {}      
     */
    static async parserTestSuite(fdir) {
        let jsparser = new JSParser();

        let fReg = new RegExp(/\.js$/);
        let files = fs.readdirSync(fdir).filter((f) => fReg.test(f));
        if (!files.length) {
            throw new Error(`folder ${fdir} contains empty .js file`);
        }

        let testCasesArr = [];
        let fns = [];
        files.forEach((fname) => {
            let fp = path.join(fdir, fname);
            testCasesArr.push(jsparser.parseFile(fp));
            fns.push(fname);
        })
        let resSuiteArr = await Promise.all(testCasesArr);
        let testSuites = [];
        resSuiteArr.forEach((suite, idx) => {
            testSuites.push({
                name: fns[idx],
                cases: suite
            })
        });
        return testSuites;
    }

    parseFile(fpath) {
        logger.info('begin read file | ', fpath);

        let fObj = require(fpath);
        return new Promise((resolve, reject) => {
            let testArr = [];
            for (let key in fObj) {
                expect(fObj[key].URL).to.be.ok;
                expect(fObj[key].SEND).to.be.ok;
                expect(fObj[key].TEST).to.be.ok;
                let obj = {
                    URL: fObj[key].URL,
                    SEND: fObj[key].SEND,
                    TEST: fObj[key].TEST
                }
                testArr.push(obj);
            }
            resolve(testArr);
        })
    }
}

module.exports = JSParser;
