var $dateElement = $(".timeDisplay");
var $weatherElement = $(".weatherDisplay");

var displayTime = function() {
  setTimeout(function(){
    var currentTime = new Date();
    var timeDisplayString = "";
    var minutesString = currentTime.getMinutes();
    
    if (currentTime.getMinutes() < 10) {
      minutesString = "0" + currentTime.getMinutes();
    }
    
    timeDisplayString = currentTime.getHours() + ":" + minutesString;
    
  	$dateElement.html(timeDisplayString);
  }, 500);
}

var getWeatherJSON = function(url) {
	$.get(url)
	.done(function(weatherData) {
		console.log('XML loaded successfully.');
    console.log(weatherData);
	})
	.fail(function(jqxhr, textStatus, error) {
		var err = textStatus + ', ' + error;
		console.log( "Request Failed: " + err);
	})
	.always(function() { 
		console.log( "complete" ); 
		// TODO: refresh with interval
	});
}

var displayWeather = function() {
  getWeatherJSON("https://api.darksky.net/forecast/56636eda0499cbe93fced92b3268b26a/37.8267,-122.4233")
}

$(document).ready(function(){
  displayTime();
  displayWeather();
});