# js-parse-html
#### 一个简单的HTML解析器

提供在node中的html解析功能，用于爬虫程序的开发。
使用了简单常见的操作方式，类似于chrome等浏览器提供的DOM操作API。

## 如何使用

安装

```
$ npm i js-parse-html
```

在你的主程序中，例如：

`./server.js`
```js
var htmlParser = require('js-parse-html')
var html =
`
    <p class="p1">
        这是一个p标签
        <a href="http://skipper.fun" class="link">skipper首页</a>
    </p>
`
var doc = htmlParser(html)

var p1 = doc.getElementsByClassName('p1')[0]
p1.getAttribute('class')                    //"p1"

var a = p1.getElementsByTagName('a')[0]     //"a"
a.getAttribute('class')                     //"link"

//一切都很DOM
```
## 优势
* 使用了线性生成DOM树，测试解析377行html仅需约`20ms`「版本 66.0.3359.181（正式版本） （64 位）in MF839」

## 注意

因为工作量还不够，现在标签不允许直接使用属性访问标签属性，需要使用getAttribute方法，例如：
```js
//错误
var a = doc.getElementsByClassName('link')[0]
a.href //undefined

//正确
a.getAttribute('href')
```

## 已知bug
* `meta viewport` 无法解析
* 间隔的文本无法解析
