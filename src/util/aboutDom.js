const isDescendant = (child, parent) => parent.contains(child);


const hasFocus = ele => (ele === document.activeElement);


const touchSupported = () => ('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);


const getSelectedText = () => window.getSelection().toString();


const insertAfter = (ele, anotherEle) => anotherEle.parentNode.insertBefore(ele, anotherEle.nextSibling);

// Or
const insertAfter = (ele, anotherEle) => anotherEle.insertAdjacentElement('afterend', ele);



const insertBefore = (ele, anotherEle) => anotherEle.parentNode.insertBefore(ele, anotherEle);

// Or
const insertBefore = (ele, anotherEle) => anotherEle.insertAdjacentElement('beforebegin', ele);


const insertHtmlAfter = (html, ele) => ele.insertAdjacentHTML('afterend', html);

const insertHtmlBefore = (html, ele) => ele.insertAdjacentHTML('beforebegin', html);

const replace = (ele, newEle) => ele.parentNode.replaceChild(newEle, ele);


