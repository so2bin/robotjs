/**
 * Test suite base class
 */
 'use strict';

 class Base{
    constructor(){
        this.numSuites = 0;
        this.numPassed = 0;
        this.numFailed = 0;
        this.numIgnored = 0;
        this.name = "DEFAULT_TEST_SUITE_NAME";
        this.cases = [];
        this.cookie = null;
    }
    befor(){}
    after(){}
 }

 module.exports = Base;