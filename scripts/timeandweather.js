var $dateElement = $(".timeDisplay");

setTimeout(function(){
  var currentTime = new Date();
  var timeDisplayString = "";
  var minutesString = currentTime.getMinutes();
  
  if (currentTime.getMinutes() < 10) {
    minutesString = "0" + currentTime.getMinutes();
  }
  
  timeDisplayString = currentTime.getHours() + ":" + minutesString;
  
	$dateElement.append(timeDisplayString);
}, 500);

console.log("hey?");