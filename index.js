// 兼容浏览器调试
window = window ? window : {}


var Tree = function(){
    var allNode = []
    var Node = function(parentNode,content){
        this.parentNode = parentNode
        this.childNode = []
        this.beginTag = content.beginTag
        this.endTag = content.endTag
        this.tagName = content.beginTag.tagName
        this.attr = {}
        this.beginTag.tagContent.forEach((item)=>{
            if(item == '/' || item == '') return
            var attrName = item.split('=')[0]
            var attrValue = item.split('=')[1]
            attrValue = attrValue.slice(1,attrValue.length-1)
            this.attr[attrName] = attrValue
        })
        this.addChildNode = function(childNode){
            this.childNode.push(childNode)
        }
        this.getAttribute = function(attrName){
            if(this.attr.hasOwnProperty(attrName)){
                return this.attr[attrName]
            } else {
                return null
            }
        }
        this.setAttribute = function(attrName,attrValue){
            this.attr[attrName] = attrValue
        }
        this.getElementsByTagName = function(tagname){
            var result = []
            var loop = function(root){
                root.childNode.forEach(function(item){
                    loop(item)
                    if(item.tagName == tagname){
                        result.push(item)
                    }
                })
            }
            loop(this)
            return result
        }
        this.getElementsByClassName = function(className){
            var result = []
            var loop = function(root){
                root.childNode.forEach(function(item){
                    loop(item)
                    if(item.attr.class == className){
                        result.push(item)
                    }
                })
            }
            loop(this)
            return result
        }
        this.getElementById = function(id){
            var result = []
            var loop = function(root){
                root.childNode.forEach(function(item){
                    loop(item)
                    if(item.attr.id == id){
                        result.push(item)
                    }
                })
            }
            loop(this)
            return result[0]
        }
        allNode.push(this)
    }
    this.head = null
    this.setHead = function(content){
        var n = new Node('head',content)
        this.head = n
        return n
    }
    this.appendNode = function(parentNode,content){
        if(this.head == null || parentNode == null){
            var n = this.setHead(content)
            return n
        }
        var node = new Node(parentNode,content)
        parentNode.addChildNode(node)
        return node
    }
    this.getAllNode = function(){
        return allNode
    }
    this.getElementsByTagName = function(tagname){
        var result = []
        allNode.forEach(function(item){
            if(item.beginTag.tagName == tagname){
                result.push(item)
            }
        })
        return result
    }
    this.getElementById = function(id){
        var result = []
        allNode.forEach(function(item){
            if(item.attr.id == id){
                result.push(item)
            }
        })
        return result
    }
    this.getElementsByClassName = function(className){
        var result = []
        allNode.forEach(function(item){
            if(item.attr.class == className){
                result.push(item)
            }
        })
        return result
    }
}
var createDomTree = function(tagStack){
    var ts = tagStack
    var parentNode = null
    var domtree = new Tree()
    var loop = function(){
        if(ts.length == 0) return
        var nowTag = ts.shift()
        // console.log(nowTag)
        if(nowTag.isSingleNode){
            // console.log('自闭合标签')
            domtree.appendNode(parentNode,{beginTag : nowTag,endTag:null})
            return loop()
        }
        if(nowTag.isTextNode){
            // console.log('文本标签')
            parentNode.innerText = nowTag.innerText
            return loop()
        }
        if(nowTag.isBeginTag){
            // console.log('开始标签 ')
            parentNode = domtree.appendNode(parentNode,{beginTag:nowTag,endTag:null})
        } else {
            // console.log('结束标签')
            parentNode.endTag = nowTag
            parentNode = parentNode.parentNode
        }
        return loop()
    }
    loop()
    window.domtree = domtree
    return domtree
}


var Tag = function(tagName){
    this.tagName = tagName
}
var SingleNode = function(tagName,tagContent){
    Tag.call(this,tagName)
    this.tagContent = tagContent
    this.isSingleNode = true
}
var BeginTag = function(tagName,tagContent,innerText){
    SingleNode.call(this,tagName,tagContent)
    this.isBeginTag = true
    this.isSingleNode = false
    this.innerText = innerText
}
var EngTag = function(tagName){
    Tag.call(this,tagName)
    this.isBeginTag = false
    this.isSingleNode = false
}
var TextNode = function(innerText){
    this.innerText = innerText
    this.isTextNode = true
}
var htmlParser = function(htmlString){
    htmlString = htmlString.replace('<!DOCTYPE html>','')
    var inTag = false
    var inInnerText = false
    var setState = function(state){
        switch(state){
            case 'IN_TAG':
                inTag = true
                inInnerText = false
                return
            case 'IN_INNERTEXT':
                inTag = false
                inInnerText = true
                return
            default:
                throw new Error('Unknow State')
        }
    }
    var isSingleNode = function(tagName){
        switch(tagName){
            case 'img':
                return true
            case 'meta':
                return true
            case 'br':
                return true
            case 'input':
                return true
            case 'link':
                return true
            case 'base':
                return true
            case 'hr':
                return true
            case 'col':
                return true
            case 'area':
                return true
            case 'source':
                return true
            case 'param':
                return true
            case 'object':
                return true
            case 'applet':
                return true
            case 'embed':
                return true
            case 'keygen':
                return true
            default :
                return false
        }
    }

    var htmlCharArr = htmlString.split('')
    var tag = ''
    var text = ''

    var tagStack = []

    while(htmlCharArr.length > 0){
        var char = htmlCharArr.shift()
        if(char == '<'){
            setState('IN_TAG')
            // console.log('now text - ',text)
            if(text.length == 0) continue
            var node = new TextNode(text)
            tagStack.push(node)
            text = ''
            continue
        }
        if(char == '>'){
            setState('IN_INNERTEXT')
            // console.log('now tag - ',tag)
            tag = tag.split(' ')
            var tagName = tag.shift()
            if(isSingleNode(tagName)){
                var node = new SingleNode(tagName,tag)
                tagStack.push(node)
                tag = ''
                continue
            }
            if(tagName.indexOf('/')>-1){
                var node = new EngTag(tagName)
                tagStack.push(node)
            } else {
                var node = new BeginTag(tagName,tag,'')
                tagStack.push(node)
            }
            tag = ''
            continue
        }
        if(inTag){
            tag+=char
        }
        if(inInnerText){
            text+=char
        }
    }
    // console.log(tagStack)
    return createDomTree(tagStack)
}

console.time('bp')
htmlParser(`
<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8' />
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="viewport" content="width=device-width,initial-scale=1, minimum-scale=1.0, maximum-scale=1, user-scalable=no"
    />
    <meta name="apple-mobile-web-app-title" content="妹子图" />
    <title>妹子图 - 每日分享高清美女图片</title>
    <meta name="keywords" content="妹子图,美女图片,性感美女,mm">
    <meta name="description" content="妹子图(m.mmjpg.com)每日分享最好看的性感美女图片、高清美女写真，做最好的美女网站！">
    <link href="images/style.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <div id="header">
        <ul class="topbar">
            <li class="logo">
                <a href="http://m.mmjpg.com">妹子图</a>
            </li>
            <li class="nav">
                <span>
                    <a href="http://m.mmjpg.com/hot">排行榜</a>
                </span>
                <span>
                    <a href="http://m.mmjpg.com/top">推荐</a>
                </span>
                <span>
                    <a href="http://m.mmjpg.com/more">标签</a>
                </span>
                <span id="viewsearch">搜索</span>
            </li>
        </ul>
        <div class="search" id="search">
            <form name="formsearch" id="formsearch" method="post" action="/search.php">
                <p>
                    <span>
                        <input type="text" name="searchkey" id="searchkey">
                        <i onClick="searchpic();"></i>
                    </span>
                </p>
            </form>
        </div>
    </div>
    <div>
        <ul class="article" id="article">
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1367">美女刘钰儿内衣写真大好春色若隐若现</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1367">
                        <img src="http://img.mmjpg.com/large/2018/1367.jpg" data-img="http://img.mmjpg.com/large/2018/1367.jpg"
                            alt="美女刘钰儿内衣写真大好春色若隐若现" />
                    </a>
                </div>
                <div class="info">
                    <span>3小时前 发布</span>
                    <span class="like">喜欢(33)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1366">女神周研希硕大的美胸视觉屏霸冲击</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1366">
                        <img src="http://img.mmjpg.com/large/2018/1366.jpg" data-img="http://img.mmjpg.com/large/2018/1366.jpg"
                            alt="女神周研希硕大的美胸视觉屏霸冲击" />
                    </a>
                </div>
                <div class="info">
                    <span>1天前 发布</span>
                    <span class="like">喜欢(127)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1365">大胸女神李宓儿给人不一样的视觉享受</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1365">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1365.jpg" alt="大胸女神李宓儿给人不一样的视觉享受"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>2天前 发布</span>
                    <span class="like">喜欢(59)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1364">宅男最爱!模特李唯一性感美臀写真图片</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1364">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1364.jpg" alt="宅男最爱!模特李唯一性感美臀写真图片"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-29 发布</span>
                    <span class="like">喜欢(322)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1363">清秀模特宅兔兔朦胧的身材极具诱惑力</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1363">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1363.jpg" alt="清秀模特宅兔兔朦胧的身材极具诱惑力"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-28 发布</span>
                    <span class="like">喜欢(212)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1362">娇艳俏丽的妹子尹菲私房内衣写真图片</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1362">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1362.jpg" alt="娇艳俏丽的妹子尹菲私房内衣写真图片"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-27 发布</span>
                    <span class="like">喜欢(139)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1361">美女周于希玉兔汹涌摧垮男人视觉防线</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1361">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1361.jpg" alt="美女周于希玉兔汹涌摧垮男人视觉防线"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-26 发布</span>
                    <span class="like">喜欢(367)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1360">温柔漂亮模特美瑜高耸的胸部夺人心目</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1360">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1360.jpg" alt="温柔漂亮模特美瑜高耸的胸部夺人心目"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-25 发布</span>
                    <span class="like">喜欢(47)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1359">温柔模特静静曼妙多姿的玉体不可错过</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1359">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1359.jpg" alt="温柔模特静静曼妙多姿的玉体不可错过"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-24 发布</span>
                    <span class="like">喜欢(236)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1358">娇艳妹子勾魂变化的姿势让人难以抗拒</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1358">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1358.jpg" alt="娇艳妹子勾魂变化的姿势让人难以抗拒"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-23 发布</span>
                    <span class="like">喜欢(276)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1357">气质美女蜜儿薄薄的衣衫包囊美好身材</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1357">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1357.jpg" alt="气质美女蜜儿薄薄的衣衫包囊美好身材"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-22 发布</span>
                    <span class="like">喜欢(232)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1356">美女周研希美乳丰臀惹火姿势性感撩人</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1356">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1356.jpg" alt="美女周研希美乳丰臀惹火姿势性感撩人"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-21 发布</span>
                    <span class="like">喜欢(344)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1355">童颜甜美女神思淇傲人的上围动人心脾</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1355">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1355.jpg" alt="童颜甜美女神思淇傲人的上围动人心脾"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-20 发布</span>
                    <span class="like">喜欢(243)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1354">女神尤妮丝诱人美胸勾魂翘臀难以忘记</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1354">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1354.jpg" alt="女神尤妮丝诱人美胸勾魂翘臀难以忘记"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-19 发布</span>
                    <span class="like">喜欢(213)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1353">小美女谢芷馨白里透红的娇躯引人注目</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1353">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1353.jpg" alt="小美女谢芷馨白里透红的娇躯引人注目"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-18 发布</span>
                    <span class="like">喜欢(255)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1352">极品甜美型的软妹子尹菲美臀诱人展现</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1352">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1352.jpg" alt="极品甜美型的软妹子尹菲美臀诱人展现"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-17 发布</span>
                    <span class="like">喜欢(358)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1351">娇俏巨乳妹子诱惑的娇躯立体呈现给你</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1351">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1351.jpg" alt="娇俏巨乳妹子诱惑的娇躯立体呈现给你"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-16 发布</span>
                    <span class="like">喜欢(128)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1350">妲己半透明内衣惹火装扮美胸呼之欲出</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1350">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1350.jpg" alt="妲己半透明内衣惹火装扮美胸呼之欲出"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-15 发布</span>
                    <span class="like">喜欢(640)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1349">大美女李宓儿白里透红的娇躯引人注目</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1349">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1349.jpg" alt="大美女李宓儿白里透红的娇躯引人注目"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-14 发布</span>
                    <span class="like">喜欢(144)</span>
                </div>
            </li>
            <li>
                <h2>
                    <a href="http://m.mmjpg.com/mm/1348">温柔唯美的美女小沫惊艳私房图别错过</a>
                </h2>
                <div class="pic">
                    <a href="http://m.mmjpg.com/mm/1348">
                        <img src="/images/loading.gif" data-img="http://img.mmjpg.com/large/2018/1348.jpg" alt="温柔唯美的美女小沫惊艳私房图别错过"
                        />
                    </a>
                </div>
                <div class="info">
                    <span>05-13 发布</span>
                    <span class="like">喜欢(336)</span>
                </div>
            </li>
        </ul>
    </div>
    <div class="page">
        <ul>
            <li class="pre">
                <i>上一页</i>
            </li>
            <li>第1页</li>
            <li class="next">
                <a href="/home/2">下一页</a>
            </li>
        </ul>
    </div>
    <div class="footer">
        <div class="tool">
            <span>
                <a href="http://www.mmjpg.com">去电脑版</a>
            </span>
            <span>
                <a href="/guestbook/">留言</a>
            </span>
        </div>
        <div class="copyright">Copyright &copy; 2018 妹子图 m.mmjpg.com</div>
    </div>
    <div id="topbtn" onClick="goscrolltop();"></div>
    <script type="text/javascript" src="images/mmjpg.js"></script>
</body>

</html>
`)
console.timeEnd('bp')

// 兼容浏览器调试
var exports = exports ? exports : {}
exports.htmlParser = htmlParser
