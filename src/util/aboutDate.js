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
dayOfYear(new Date(2020, 04, 16));      // 137


const getMonthName = date => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',' November', 'December'][date.getMonth()];


const daysInMonth = (month, year) => new Date(year, month, 0).getDate();


const getWeekday = date => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];