export function setDate(num) {  
    return Date.now() + num * 24 * 60 * 60 * 1000
}
    /*
    复制代码时间为正可以获得未来的时间，时间为负可以获得过去时间。
    举个例子
    12 个小时之前的时间 -> setDate(-.5)
    24 个小时之前的时间 -> setDate(-1)
    三天后的时间 -> setDate(3)
    */


   function debounce(func, wait) {
    let timeout;
    return function () {
        let context = this;
        let args = arguments;

        if (timeout) clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait);
    }
}

function throttle(func, wait) {
    let previous = 0;
    return function() {
        let now = Date.now();
        let context = this;
        let args = arguments;
        if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
        }
    }
}


function getTranslate(node,sty){//获取transform值
    var translates=document.defaultView.getComputedStyle(node,null).transform.substring(7);
    var result = translates.match(/\(([^)]*)\)/);// 正则()内容
    var matrix=result?result[1].split(','):translates.split(',');
    if(sty=="x" || sty==undefined){
        return matrix.length>6?parseFloat(matrix[12]):parseFloat(matrix[4]);
    }else if(sty=="y"){
        return matrix.length>6?parseFloat(matrix[13]):parseFloat(matrix[5]);
    }else if(sty=="z"){
        return matrix.length>6?parseFloat(matrix[14]):0;
    }else if(sty=="rotate"){
        return matrix.length>6?getRotate([parseFloat(matrix[0]),parseFloat(matrix[1]),parseFloat(matrix[4]),parseFloat(matrix[5])]):getRotate(matrix);
    }
}
function getRotate(matrix){
    var aa=Math.round(180*Math.asin(matrix[0])/ Math.PI);
    var bb=Math.round(180*Math.acos(matrix[1])/ Math.PI);
    var cc=Math.round(180*Math.asin(matrix[2])/ Math.PI);
    var dd=Math.round(180*Math.acos(matrix[3])/ Math.PI);
    var deg=0;
    if(aa==bb||-aa==bb){
        deg=dd;
    }else if(-aa+bb==180){
        deg=180+cc;
    }else if(aa+bb==180){
        deg=360-cc||360-dd;
    }
    return deg>=360?0:deg;
 
}

/* 第一个参数是元素，第二个是要获取x y z rotate这4个其一
好了，不管你是用translate3d还是translateX、translateY，都能获取到x y z
var nowRotate=getTranslate(document.getElementById(“id”),“x”);
console.log(nowRotate)

*/


const RandomColor = () => "#" + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, "0");
// const color = RandomColor();

const params = new URLSearchParams(location.search.replace(/\?/ig, "")); // location.search = "?name=young&sex=male"
// params.has("young"); // true
// params.get("sex"); // "male"


const FillZero = (num, len) => num.toString().padStart(len, "0");
// const num = FillZero(169, 5);
// num => "00169"


[].forEach.call($$("*"), dom => {
    dom.style.outline = "1px solid #" + (~~(Math.random() * (1 << 24))).toString(16);
});


/*
使用text-align-last对齐两端文本
要点：通过text-align-last:justify设置文本两端对齐


1px border

.onepx-border {
	margin-top: 10px;
	width: 200px;
	height: 80px;
	cursor: pointer;
	line-height: 80px;
	text-align: center;
	font-weight: bold;
	font-size: 50px;
	color: $red;
	&:first-child {
		margin-top: 0;
	}
}
.thin {
	position: relative;
	&::after {
		position: absolute;
		left: 0;
		top: 0;
		border: 1px solid $red;
		width: 200%;
		height: 200%;
		content: "";
		transform: scale(.5);
		transform-origin: left top;
	}
}

要点：通过pointer-events:none禁用事件触发(默认事件、冒泡事件、鼠标事件、键盘事件等)，
相当于<button>的disabled

*/
