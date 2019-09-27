!function(doc, win) {

    let getId = (id) => {
        return doc.getElementById(id)
    }

    let getClass = (cls) => {
        return doc.getElementsByClassName(cls)
    }

    let log = (...rest) => {
        console.log(...rest)
    }

    window._ = {
        getId, getClass, log
    }

}(document, window, undefined);