/**
 *   Markdown text parser  => consider .md text as a test suit
 *   Each test suit can contain more than one test case what must  comply with the following rules:
 *   *** URL ***
 *   ...
 *   *** SEND ***
 *   ```js
 *   js object
 *   ``` 
 *   *** TEST ***
 *   ```js
 *   json object
 *   ```
 *   ....
 */

'use strict';
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const log4js = require('log4js');
const co = require('co');
const config = require('../../config/default');
const def = require('../../def');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

const URL_STR = `*** URL ***`;
const SEND_STR = `*** SEND ***`;
const TEST_STR = `*** TEST ***`;
const JS_START = '```js';
const JS_END = '```';

let testObj = [];


/**********************************************************************/
class MDParser {
    constructor() {
        this.testObjDict = {
            cur: null
        };
        this.flags = { // read file flags
            url: false,
            send: false,
            test: false
        };
        this.testArr = []; // array of all test cases
    }

    /**
     * Return a test suites array what the member is calculated from a .md file and is also 
     * a array that consisted of many test cases.
     * The struct of test suite is like the following:
     * [
     *     {
     *         name: "suite_1",
     *         cases: [
     *             {
     *                 URL: "xxx",
     *                 SEND: {
     *                     // params
     *                 },
     *                 TEST: {
     *                     // keywords testing object
     *                 }
     *             }
     *         ]
     *     }
     * ]
     * 
     * @param  {string} fdir: folder of .md files
     * @return      
     */
    static async parserTestSuite(fdir) {
        let mdparser = new MDParser();

        let fReg = new RegExp(/\.md$/);
        let files = fs.readdirSync(fdir).filter((f) => fReg.test(f));
        if (!files.length) {
            throw new Error(`folder ${fdir} contains empty .md file`);
        }

        let testCasesArr = [];
        let fns = [];
        files.forEach((fname) => {
            let fp = path.join(fdir, fname);
            testCasesArr.push(mdparser.parseFile(fp));
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

    /**
     * asynchronously parse.md file, return a promise object which will return
     * the test cases array after runing
     * [
     *     {
     *         URL: "xxx",
     *         SEND: {
     *             // params
     *         },
     *         TEST: {
     *             // keywords testing object
     *         }
     *     }
     * ]
     * @param  {[type]} fp 
     * @return {[type]} 
     */
    parseFile(fp) {
        logger.info(`begin read file | ${fp}`);

        let that = this;
        return new Promise((resolve, reject) => {
            function onClose() {
                logger.info(`end read file | ${fp} | test case num: ${Object.keys(that.testObjDict).length - 1}`);  // - cur
                for (let k in that.testObjDict) {
                    if (k == 'cur') {
                        continue;
                    }
                    let o = that.testObjDict[k];
                    that.testArr.push({
                        URL: o.URL,
                        SEND: o.SEND,
                        TEST: o.TEST,
                        bIgnore: o.bIgnore
                    });
                }
                resolve(that.testArr);
            }

            let rl = readline.createInterface({
                input: fs.createReadStream(fp, 'utf-8')
            });
            rl.on('line', (line) => {
                try {
                    that.dealLine(line);
                } catch (err) {
                    rl.removeListener('close', onClose);
                    rl.close();
                    reject(err);
                }
            }).on('close', onClose);
        })
    }

    dealLine(line) {
        if (!line) {
            return;
        }
        // TEST
        if (line.indexOf(TEST_STR) != -1) {
            if (!this.testObjDict.cur || this.flags.send) {
                throw new Error('\n文本解析出错,请检查测试数据格式(保存TEST数据前SEND可能没有检测到)\n');
            }
            this.flags.test = true;
            this.testObjDict.cur.TEST = "";
            return
        }
        if (this.flags.test) {
            line = def.clearAnnotates(line);
            if (line.indexOf(JS_START) != -1) {
                return
            }
            if (line.indexOf(JS_END) != -1) {
                this.flags.test = false;
                // trans string to json
                try {
                    this.testObjDict.cur.TEST = JSON.parse(this.testObjDict.cur.TEST);
                } catch (err) {
                    throw new Error(`Test Case | ${this.testObjDict.cur.URL} | TEST is not JSON string!`);
                }
                return; // get send object
            }
            this.testObjDict.cur.TEST += line;
        }
        // SEND
        if (line.indexOf(SEND_STR) != -1) {
            if (!this.testObjDict.cur || this.flags.url) {
                throw new Error('\n文本解析出错,请检查测试数据格式(保存SEND数据前URL可能没有检测到)\n');
            }
            this.flags.send = true;
            this.testObjDict.cur.SEND = "";
            return
        }
        if (this.flags.send) {
            line = def.clearAnnotates(line);
            if (line.indexOf(JS_START) != -1) {
                return
            }
            if (line.indexOf(JS_END) != -1) {
                this.flags.send = false;
                // trans string to json
                try {
                    this.testObjDict.cur.SEND = JSON.parse(this.testObjDict.cur.SEND);
                } catch (err) {
                    throw new Error(`Test Case | ${this.testObjDict.cur.URL} | SEND is not JSON string!`);
                }
                return; // get send object
            }
            this.testObjDict.cur.SEND += line;
        }
        // URL   like: "`/sys/media`"
        if (line.indexOf(URL_STR) != -1) {
            // if the previous test case is not over, testObjDict.cur will not be null
            if (this.testObjDict.cur) {
                this.checkCurTestCaseObjEffective();
                this.testObjDict.cur = null;
            }
            this.flags.url = true;
            return
        }
        if (this.flags.url) {
            if (new RegExp(/`(.+)`/).test(line) == false) {
                return
            }
            this.flags.url = false;
            let URL = line.match(/`(.+)`/)[1];
            this.testObjDict[URL] = {
                URL,
                SEND: "",
                TEST: "",
                bIgnore: false
            };
            this.testObjDict.cur = this.testObjDict[URL];
        }
    }

    /**
     * check whther current test case obj: testCaseObj.cur is effective
     * @return {[type]}
     */
    checkCurTestCaseObjEffective() {
        let obj = this.testCaseObj.cur;
        logger.debug(obj);
        if (!obj.URL) {
            throw new Error('URL无效');
        }
        if (!obj.SEND) {
            throw new Error(`${obj.URL} | SEND无效`);
        }
        if (Object.keys(obj.SEND).length == 0) {
            logger.warn(`${obj.URL} | SEND为空`);
            return false;
        }
        if (!obj.TEST) {
            logger.warn(`${obj.URL} | TEST无效, 将不会被测试`);
            obj.bIgnore = true;
            return false;
        }
        if (Object.keys(obj.TEST).length == 0) {
            logger.warn(`${obj.URL} | TEST为空, 将不会被测试`);
            obj.bIgnore = true;
            return false;
        }
        return true;
    }
}


module.exports = MDParser;
