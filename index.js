/******************************************
 *  webserver接口测试入口文件
 *  @helibb
 **/
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const config = require('config');

const executor = require('./driver/executor');
const MDParser = require('./parser/md/parser');
const JSParser = require('./parser/js/parser');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

async function start() {
    try {
        let resArr;
        switch (config.dataDocFormat) {
            case '.md':
                resArr = await MDParser.parserTestSuite(config.test_from_md.from_dir);
                break;
            case '.js':
                resArr = await JSParser.parserTestSuite(config.test_from_md.from_dir);
                break;
            default:
                throw new Error(`配置的测试数据文本类型出错 | ${config.dataDocFormat}`);
        }
        executor.run(resArr);
    } catch (err) {
        logger.error(err);
    }
}

start();
