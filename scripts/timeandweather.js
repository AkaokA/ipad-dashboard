var $dateElement = $(".timeDisplay");
var $weatherElement = $(".weatherDisplay");


var formatTime = function(time, showHours, showMinutes, showAMPM) {
  var timeDisplayString = "";
  var hoursString = time.getHours();
  var minutesString = time.getMinutes();
  var ampm = ""

  // hours
  if (showHours) {
    if (time.getHours() > 12) {
      hoursString = time.getHours() - 12;
      if (showAMPM) {
        ampm = "<span class='ampm'>PM</span>"
      }
    } else {
  	  if (time.getHours() == 0) {
  	  	hoursString = 12;
  	  }
      if (showAMPM) {
        ampm = "<span class='ampm'>AM</span>"
      }
    }
  } else {
    hoursString = "";
  }
  
  // minutes
  if (showMinutes) {
    if (time.getMinutes() < 10) {
      minutesString = "0" + time.getMinutes();
    }
  } else {
    minutesString = "";
  }
    
  // assemble string
  if (showHours && showMinutes) {
    timeDisplayString = hoursString + ":" + minutesString + ampm;
  } else {
    timeDisplayString = hoursString + minutesString + ampm;
  }
  
  return timeDisplayString;
}

var getTimePercent = function(time) {
  return ( (time.getHours() * 3600) + (time.getMinutes() * 60) + time.getSeconds() ) / 864;
}

var displayTime = function() {
  var currentTime = new Date();
  
	$dateElement.html(formatTime(currentTime, true, true, true));
	
	// position current time marker in forecast graph
	var currentTimePercent = getTimePercent(currentTime);
	$('.currentTimeMarker').css("left", currentTimePercent + "%");
	
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
  // get data
  var forecastDay = 0; // set to '0' for today's forecast; change to debug
  
  var maxTemp = Math.round(data.daily.data[forecastDay].apparentTemperatureMax);
  var minTemp = Math.round(data.daily.data[forecastDay].apparentTemperatureMin);
  var maxTempTime = new Date(data.daily.data[forecastDay].apparentTemperatureMaxTime * 1000);
  var minTempTime = new Date(data.daily.data[forecastDay].apparentTemperatureMinTime * 1000);
  var sunrise = new Date(data.daily.data[forecastDay].sunriseTime * 1000);
  var sunset = new Date(data.daily.data[forecastDay].sunsetTime * 1000);
  var precipProbability = Math.round(data.daily.data[forecastDay].precipProbability * 100);
  var precipType = data.daily.data[forecastDay].precipType;
  
  // display high/low temperatures
  $('.highTemp').html(maxTemp + "&deg;");
  $('.lowTemp').html(minTemp + "&deg;");
  $('.highTempTime').html(formatTime(maxTempTime, true, false, true));
  $('.lowTempTime').html(formatTime(minTempTime, true, false, true));
  
  $('.daylightIndicator').css("left", getTimePercent(sunrise) + "%");
  $('.daylightIndicator').css("right", 100 - getTimePercent(sunset) + "%");
  
  $('.tempDisplay.high').css("left", (maxTempTime.getHours() / 24 * 100) + "%");
  $('.tempDisplay.low').css("left", (minTempTime.getHours() / 24 * 100) + "%");
  
  // display weather summary
  $('.summary').html(data.daily.data[forecastDay].summary);
  
  if (precipType) {
    $weatherElement.find('.precip').html(precipProbability + "% chance of " + precipType + ". ");
  } else {
    $weatherElement.find('.precip').html("");
  }
  
  if (precipProbability >= 20) {
    if (precipType == "rain") {
      $(".precip").append("Consider your umbrella.")
      $(".precip").addClass("umbrella");
    }
  }
  
  // loop
  setTimeout(function() {
  	getWeatherJSON();
  }, 3600000);
}

$(document).ready(function(){
  displayTime();
  getWeatherJSON();
});