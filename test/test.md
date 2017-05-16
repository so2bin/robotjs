# baidu.com

## md test

*** URL ***
> `/api/vbaike/knowledgelist`

*** SEND ***
```js
{
    "page": 1,        // page
    "dataType": "online"
}
```

*** RESULT ***
```js
[
    {
        "author":"du小力",      // test
        "desc":"其实9月1日已经算好的了，民国的时候8月1日开学，暑假只有一个月。",
        "itemId":16634,
        "link":"https://baike.baidu.com/tashuo/browse/content?id=60005a46c752716713e12e23",
        "publishTime":1494403775,
        "pv":48071,
        related:[
            {
                "title":"校历",
                "url":"http://baike.baidu.com/item/%E6%A0%A1%E5%8E%86"
            }
        ]
    }
]
```

*** TEST ***
```js
{
    "__must":["author", "desc", "itemId"],
    "related": {
        "__must": ["title", "url"]
    }
}
```