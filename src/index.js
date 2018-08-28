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


// 兼容浏览器调试
exports.htmlParser = htmlParser
