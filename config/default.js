module.exports = {
    dataDocFormat: ".js",
    test_from_md: {
        from_dir: "/home/duoyi/Nodejs/robotjs/test",
        to_dir: ""
    },
    test_from_js: {
        from_dir: "",
        to_dir: ""
    },
    test_doc_dir: "",
    testlibs: [],
    logs: {
        appenders: [{
            layout: {
                type: 'pattern',
                pattern: "%[%r | %5.5p | %m%]%n"
            },
            category: "log_file",
            type: "datefile",
            filename: "./logs/log",
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd-hh.log",
            type: "console"
        }],
        // replaceConsole: true,
        levels: {
            log_file: "DEBUG"
        }
    },
    svrInfo: {
        url: "http://baike.baidu.com"
    },
    datakey: ""   // data key of response 
}
