var $dateElement = $(".timeDisplay");
var $weatherElement = $(".weatherDisplay");

var displayTime = function() {
  var currentTime = new Date();
  var timeDisplayString = "";
  var hoursString = currentTime.getHours();
  var minutesString = currentTime.getMinutes();
  var ampm = ""
  
  // bit of formatting
  
  if (currentTime.getHours() > 12) {
    hoursString = currentTime.getHours() - 12;
    ampm = "<span class='ampm'>PM</span>"
  } else {
    ampm = "<span class='ampm'>AM</span>"
  }
  
  if (currentTime.getMinutes() < 10) {
    minutesString = "0" + currentTime.getMinutes();
  }
  
  timeDisplayString = hoursString + ":" + minutesString + ampm;
	$dateElement.html(timeDisplayString);
	
	setTimeout(function() {
  	displayTime();
  }, 1000);
	
}

var getWeatherJSON = function() {
  $.ajax({
    type: "GET",
    url: "https://api.darksky.net/forecast/56636eda0499cbe93fced92b3268b26a/43.6906994,-79.3195922?units=ca", 
    dataType: "jsonp",
    crossDomain: true,
    success: function (data) {
      console.log(data);
      displayWeather(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
    }
  });	
}

var displayWeather = function(data) {
  var maxTemp = Math.round(data.daily.data[0].apparentTemperatureMax);
  var minTemp = Math.round(data.daily.data[0].apparentTemperatureMin);
  var precipProbability = Math.round(data.daily.data[0].precipProbability * 100);
  
  $weatherElement.find('.temps').html(maxTemp + "&deg; / " + minTemp + "&deg;");
  $weatherElement.find('.summary').html(data.daily.data[0].summary);
  $weatherElement.find('.precip').html(precipProbability + "% chance of " + data.daily.data[0].precipType + ".");
  
  setTimeout(function() {
  	getWeatherJSON();
  }, 3600000);
}

$(document).ready(function(){
  displayTime();
  getWeatherJSON();
});