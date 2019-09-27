

let app = _.getId('app'), app2 = _.getId('app2')

let appName = app.nodeName, appValue = app.nodeValue;
// _.log(appName, appValue, document.getElementsByTagName('h1')[0].nodeValue)

function log(...rest) {
    _.log(...rest)
}

// log(app.childNodes[0], app.childNodes.item(1))


// log(app.nextSibling, app.parentNode, app.previousSibling)
// log(app2.nextSibling,  app2.previousSibling)

let con = _.getClass('content')[0]
// log(_.getClass('content')[0].nextSibling, _.getClass('content')[0].previousSibling)
// log(app2.firstChild.ownerDocument)

// let res = app.appendChild(app.childNodes[0])
// log(res)


// app2.insertBefore(con, null)

// app2.replaceChild(con, app2.firstChild)


var element = document.createElement("div");
element.className = "message";
var textNode = document.createTextNode("Hello world!");
element.appendChild(textNode);
var anotherTextNode = document.createTextNode("Yippee!");
element.appendChild(anotherTextNode);
document.body.appendChild(element);
// alert(element.childNodes.length);    //2
element.normalize();
// alert(element.childNodes.length);    //1
// alert(element.firstChild.nodeValue);
// "Hello world!Yippee!"

