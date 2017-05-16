/**
 * define the variables
 */

module.exports.color = {
    ok: '\u221A',
    fail: '\u00D7',
    skip: '\u25cB'
}

module.exports.parseJson2Params = function(obj) {
    if (typeof obj != 'object') {
        throw 'error json object for function "parseJson2Params"';
    }
    let re = [];
    for (let k in obj) {
        re.push(`${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    }
    return re.join("&");
}

/**
 * clear all annotate string
 */
module.exports.clearAnnotates = function(lstr) {
    const annotateFlags = ['//', '#'];
    annotateFlags.forEach((ntFlg) => {
        if (lstr.indexOf(ntFlg) != -1) {
            lstr = lstr.replace(new RegExp(` ${ntFlg}.*`), "");
        }
    })
    return lstr;
}


/**
 * get item in object: obj for a ebeded key like: "key1.key2.key3"
 */
module.exports.getattr = function(obj, key) {
    if (!key) {
        return obj;
    }
    let sks = key.split('.');
    let data = obj;
    for (let k of sks) {
        if (!data[k]) {
            throw new Error(`getattr error: object has no key "${key}"`);
        }
        data = data[k];
    }
    return data;
}
