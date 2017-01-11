var $dateElement = $(".timeDisplay");
var $weatherElement = $(".weatherDisplay");
var currentTime = new Date();

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
    } else if (time.getHours() == 12) {
      hoursString = 12;
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
  currentTime = new Date();
	$dateElement.html(formatTime(currentTime, true, true, true));
	
	// position current time marker in forecast graph
	var currentTimePercent = getTimePercent(currentTime);
	$('.currentTimeMarker').css("left", currentTimePercent + "%");
}

var getWeatherJSON = function() {
  $.ajax({
    type: "GET",
    url: "https://api.darksky.net/forecast/56636eda0499cbe93fced92b3268b26a/43.6906994,-79.3195922?units=ca", 
    dataType: "jsonp",
    crossDomain: true,
    success: function (data) {
      console.log("Dark Sky data loaded: ", data);
      updateWeatherDisplay(data);
    },
    error: function (xhr, ajaxOptions, thrownError) {
    }
  });	
}

var updateWeatherDisplay = function(data) {
  // get data
  var forecastDay = 0; // set to '0' for today's forecast; change to debug
  var dailyForecastData = data.daily.data;
  var hourlyForecastData = data.hourly.data;

  var sunrise = new Date(dailyForecastData[forecastDay].sunriseTime * 1000);
  var sunset = new Date(dailyForecastData[forecastDay].sunsetTime * 1000);
  var precipProbability = Math.round(dailyForecastData[forecastDay].precipProbability * 100);
  var precipType = dailyForecastData[forecastDay].precipType;
  
  $(".hourLabel").remove();
  $(".temperatureMarker").remove();
  $(".precipBar").remove();
  
  //config variables
  var hoursToDisplay = 24;
  var temperatureUpperBound = 30;
  var temperatureLowerBound = -15;
  var zeroPercent = (0 - temperatureLowerBound) / (temperatureUpperBound - temperatureLowerBound) * 100;
  
  $(".midline").css("bottom", zeroPercent + "%" );
  
  // show current temperature
  var currentTemperature = Math.round(data.currently.apparentTemperature) + "&deg;";
  $('.currentTemperature').html("");
  $(".currentTemperature").append("Feels like " + currentTemperature);
  
  var cachedTemperature = null;
  
  for (var hour = 0; hour < hoursToDisplay; hour++) {
    var hourlyForecastTime = new Date(hourlyForecastData[hour].time * 1000);
    var timePercent = hour / hoursToDisplay * 100;
    
    // draw precipitation graph
    var precipBarPrototype = "<div class='precipBar'></div>"
    var precipBarMax = 3;
    var precipBarPercent = (hourlyForecastData[hour].precipIntensity / precipBarMax) * 100; // for precipitation amount
    
    if (precipBarPercent > 0) {
      $(".precipitationGraph").append(precipBarPrototype)
      $(".precipBar:last-child").css({
        "left": timePercent + "%",
        "height": precipBarPercent + "%"
      });
    }  

    // draw temperature graph
    var temperatureMarkerPrototype = "<div class='temperatureMarker'><div class='tempLabel'></div><div class='tempDot'></div></div>"
    var hourlyTemperature = Math.round(hourlyForecastData[hour].apparentTemperature);
//     hourlyTemperature = -20;
    var temperaturePercent = (0 - temperatureLowerBound + hourlyTemperature) / (temperatureUpperBound - temperatureLowerBound) * 100;
    $(".forecastGraph").append(temperatureMarkerPrototype);
    
    $(".temperatureMarker:last-child").css({
      "left": timePercent + "%",
      "bottom": temperaturePercent + "%"
    })
    
    if (hourlyTemperature != cachedTemperature) {
	    cachedTemperature = hourlyTemperature
			$(".temperatureMarker:last-child .tempLabel").append(hourlyTemperature + "&deg;");
    } else {
	    $(".temperatureMarker:last-child .tempDot").addClass("small");
    }
        
    // draw hours legend
    if (hourlyForecastTime.getHours() % 6 == 0) {
      var hourLabelText = formatTime(hourlyForecastTime, true, false, true);
      var hourLabelPrototype = "<div class='hourLabel'><div class='hourLabelText'>" + hourLabelText + "</div></div>"
      $(".hoursLegend").append(hourLabelPrototype);
      $(".hourLabel:last-child").css({
        "left": timePercent + "%"
      });
    }
    
  }
    
/*
  $('.daylightIndicator').css("left", getTimePercent(sunrise) + "%");
  $('.daylightIndicator').css("right", 100 - getTimePercent(sunset) + "%");
*/
  
  // display weather summary
  $('.summary').html(data.hourly.summary);
}

$(document).ready(function(){
  displayTime();  
  setInterval(function() {
  	displayTime();
  }, 1000); // every second

  getWeatherJSON();
  setInterval(function() {
  	getWeatherJSON();
  }, 600000); // every ten minutes
});