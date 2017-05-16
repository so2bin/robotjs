const chai = require('chai');
const util = require('util');
const log4js = require('log4js');
const config = require('config');

log4js.configure(config.logs);
const logger = log4js.getLogger('log_file');

/**
 * curObj[tKey] is true
 */
module.exports.true_exp = function(curObj, tKey) {
    chai.expect(curObj).to.not.be.false;
    // calculate the js expression
    // repace the parameters in expression with curObj[key]
    let locExp = tKey.toString().replace(/\$/g, 'this.');
    let reExp = (function() {
        return eval(locExp) }.bind(curObj))();
    chai.expect(reExp, `${tKey} | (${JSON.stringify(curObj)})`).to.be.ok;
}

/**
 * {exp1: "$v1*$v2", exp2: "$v3+5", prec: 0.01}
 * judge abs(exp1 - exp2) < prec
 */
module.exports.equal = function(curObj, tObj) {
    chai.expect(curObj).to.not.be.false;
    // calculate the js expression
    // repace the parameters in expression with curObj[key]
    let locExp1 = tObj.exp1.toString().replace(/\$/g, 'this.');
    let locExp2 = tObj.exp2.toString().replace(/\$/g, 'this.');
    let value1 = (function() {
        return eval(locExp1) }.bind(curObj))();
    let value2 = (function() {
        return eval(locExp2) }.bind(curObj))();
    // only judge when the value is effective Number
    if (util.isNumber(value1) && util.isNumber(value2)) {
        chai.expect(Math.abs(value1 - value2)).to.be.below(parseFloat(tObj.proc));
    }
}

/**
 * curObj[tKey] != 0
 */
module.exports.not_zero = function(curObj, tKey) {
    chai.expect(curObj).to.not.be.false;
    chai.expect(curObj, tKey).to.has.any.keys(tKey);
    chai.expect(parseFloat(curObj[tKey]) != 0, tKey).to.be.ok;
}


/**
 * curObj[tKey] is true
 */
module.exports.must = function(curObj, tKey) {
    try {
        chai.expect(curObj).to.be.ok;
        chai.expect(curObj).to.has.any.keys(tKey);
    } catch (err) {
        logger.warn('"__must" verify failed | ',curObj, tKey);
        throw err;
    }
}

/**
 * curObj[tKey] >= 0
 */
module.exports.not_negative = function(curObj, tKey) {
    try {
        chai.expect(curObj).to.be.ok;
        char.expect(curObj).to.has.any.keys(tKey);
        // only judge when the value is number
        if (util.isNumber(curObj[tKey])) {
            chai.expect(curObj[tKey], tKey).to.be.at.least(0);
        } else {
            throw new Error(`NOT NUMBER | ${typeof(curObj[tKey])}`);
        }
    } catch (err) {
        logger.warn(curObj, tKey);
        throw err;
    }
}

/**
 * curObj[tKey] > 0
 */
module.exports.positive = function(curObj, tKey) {
    try {
        chai.expect(curObj).to.be.ok;
        char.expect(curObj).to.has.any.keys(tKey);
        // only judge when the value is number
        if (util.isNumber(curObj[tKey])) {
            chai.assert.isAbove(curObj[tKey], 0);
        } else {
            throw new Error(`NOT NUMBER | ${typeof(curObj[tKey])}`);
        }
    } catch (err) {
        logger.warn(curObj, tKey);
        throw err;
    }
}

/**
 * curObj[tKey] not empty
 */
module.exports.not_empty = function(curObj, tKey) {
    try {
        chai.assert.isString(tKey);
        chai.expect(curObj).to.be.ok;
        char.expect(curObj[tKey], tKey).to.not.be.empty;
    } catch (err) {
        logger.warn(curObj, tKey);
        throw err;
    }
}


/**
 * tObj: {arr: keyName, sum: sumKey, less: lessValue}
 * sum the specified key: tObj[sum] of array: curObj[tObj[arr]],
 * and the summed value must less than tObj.less
 *
 * if the type of array's member is not Object, the sumKey should be tOjb[sum] = null
 * and we will sum the value of array's members directly
 *
 * samples:
 * 1.
 *     curObj = {allList: [{time: "2012/12/02", reg: 10, reg_rate: 0.2}, ...]}
 *     __array_sum_less: [
 *         {"arr": "allList", "sum": "reg_rate", "less": 100.0}   // tObj
 *     ]
 * 2.
 *     curObj = {allList: [1,2,3,4, ...]}
 *     __array_sum_less : [
 *         {"arr": "allList", "less": 100.0}
 *     ]
 * 
 * @param {object} curObj [the object that contained the test array]
 * @param {object} tObj [{arr: keyName, sum: sumKey, less: lessValue}]
 */
module.exports.array_sum_less = function(curObj, tObj) {
    chai.assert.isObject(curObj, 'current object must be "Object" type');
    chai.assert.isObject(tObj, 'current testing object must be "Object" type');
    chai.expect(curObj, 'currect object can not be empty').to.not.be.empty;
    chai.expect(curObj, 'currect testing object can not be empty').to.not.be.empty;

    chai.expect(curObj).to.has.any.keys(tObj.arr,
        `currecnt object has not containned array key: ${tObj.arr}`);
    let array = curObj[tObj.arr];
    chai.assert.isArray(array, 'the testing data is not "Array" type');
    let less = tObj.less;
    chai.assert.isNumber(less, 'the "tObj.less" must be number');

    if (array.length) {
        let sum = tObj.sum;
        let arrSum = 0;
        // sum is null, the member of array should be a calculation value instead of a "Object" value
        if (!sum) {
            chai.assert.isNumber(array[0], 'the type of array member nust be a number');
            array.map((o) => { arrSum += o });
        } else {
            array.forEach((o) => {
                chai.assert.isNumber(o[sum], `the type of array member key in obejct: ${sum} must be number`);
                arrSum += o[sum];
            })
        }
        chai.expect(parseFloat(arrSum), `Sum of Array[${sum}] less than ${less} wrong`).to.be.at.most(parseFloat(less));
    }
}
