function getQinMingJieDate(fullYear) {
  //清明节的日期是不固定的，规律是：闰年开始的前2年是4月4日，闰年开始的第3年和第4年是4月5日
  if(isLeapYear(fullYear) || isLeapYear(fullYear -1)){
      return '0404';
  }
  else{
      return '0405';
  }
}
//判断是否是闰年
function isLeapYear (Year) {
  if (((Year % 4)==0) && ((Year % 100)!=0) || ((Year % 400)==0)) {
      return (true);
  } else { return (false); }
}