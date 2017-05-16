/********************
 * returned a js object after text parsed
 * include: URL, SEND, TEST attribution
 **/

exports.testCase1 = {
    NAME: "js test case example",
    URL: "/api/vbaike/knowledgelist",
    SEND: {
        "page": 1, // page
        "dataType": "online"
    },
    TEST: {
        "__must": ["author", "desc", "itemId"],
        "related": {
            "__must": ["title", "url"]
        }
    }
}
