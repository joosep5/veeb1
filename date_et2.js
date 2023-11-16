exports.dateNowET = function() {
const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
  let timeNow = new Date();
  let dateNow = timeNow.getDate();
  let monthNow = timeNow.getMonth() + 1; // Lisame 1, kuna kuu numbrid on vahemikus 0-11
  let yearNow = timeNow.getFullYear();

  return dateNow + "." + monthNamesET[monthNow] + "." + yearNow;
}

let timeNow = new Date();{
let hoursNow = timeNow.getHours();
let minutesNow = timeNow.getMinutes();
let secondsNow = timeNow.getSeconds();
}

const timeNowET = function(){
let timeNow = new Date
return timeNow.getHours + "." + timeNow.getMinutes + "." + timeNow.getSeconds;
}

const timeOfDayET = function(){
	let dayPart = "suvaline aeg";
	const hourNow = new Date().get.hours();
	if(hoursNow > 6 && hourNow <= 11){
		dayPart = "hommik";
}
if(hoursNow >= 12 && hourNow <= 14){
		dayPart = "keskpäev";
}
if(hoursNow >= 14 && hourNow <= 18){
		dayPart = "pärastlõuna";
}
	if(hoursNow > 18){
		dayPart = "õhtu";
}
return dayPart;
}
