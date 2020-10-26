const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

// diffDays(new Date('2014-12-19'), new Date('2020-01-01')) === 1839


const isBetween = (date, min, max) => (date.getTime() >= min.getTime() && date.getTime() <= max.getTime());


const formatYmd = date => date.toISOString().slice(0, 10);
// formatYmd(new Date()) returns `2020-05-06`


const extract = date => date.toISOString().split(/[^0-9]/).slice(0, -1);

// `extract` is an array of [year, month, day, hour, minute, second, millisecond]
// ["2020", "05", "18", "13", "33", "12", "073"]


const dayOfYear = date => Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

// Example
// dayOfYear(new Date(2020, 04, 16));      // 137


const getMonthName = date => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',' November', 'December'][date.getMonth()];


const daysInMonth = (month, year) => new Date(year, month, 0).getDate();


const getWeekday = date => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];


// // 获取年月的总天数
// const countDaysInMonth = (year, month) => {
//   var date = new Date();
//   date.setFullYear(year, month - 1, 0);
//   return date.getDate();
// }


/*
YYYY: full year (ex: 2018)
MM: month (ex: 04)
DD: day (ex: 01)
HH: hours (ex: 12)
mm: minutes (ex: 59)
ss: seconds (ex: 09)
ms: milliseconds (ex: 532)

*/

var dateRegex = /(?=(YYYY|YY|MM|DD|HH|mm|ss|ms))\1([:\/-]*)/g;
var timespan = {
  // 方法名 长度 月份[0, 11]
  YYYY: ['getFullYear', 4],
  YY: ['getFullYear', 2],
  MM: ['getMonth', 2, 1],
  DD: ['getDate', 2],
  HH: ['getHours', 2],
  mm: ['getMinutes', 2],
  ss: ['getSeconds', 2],
  ms: ['getMilliseconds', 3]
};

var timestamp = function(str, date, utc) {
  if (typeof str !== 'string') {
    date = str;
    str = 'YYYY-MM-DD';
  }

  if (!date) date = new Date();
  return str.replace(dateRegex, function(match, key, rest) {
    console.log('match: ', match , '   key: ' + key, '   rest: ' + rest)
    var args = timespan[key];
    var name = args[0];
    var chars = args[1];
    if (utc === true) name = 'getUTC' + name.slice(3);
    var val = '00' + String(date[name]() + (args[2] || 0));
    return val.slice(-chars) + (rest || '');
  });
};

timestamp.utc = function(str, date) {
  return timestamp(str, date, true);
};

export const ts = timestamp





