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
  // set up canvases
  var canvas = $(".forecastGraph")[0];
  canvas.width = $(".weatherDisplay").width() * 2;
  canvas.height = $(".weatherDisplay").height() * 2;

  var canvasWidth = $(".weatherDisplay").outerWidth();
  var canvasHeight = $(".weatherDisplay").outerHeight();

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  
  
  var ctx = canvas.getContext('2d');
  
  if (window.devicePixelRatio) {
    ctx.scale(window.devicePixelRatio,window.devicePixelRatio);
  }
  
  //config variables
  var hoursToDisplay = 18;
  var precipBarWidth = 32;
  var temperatureUpperBound = 30;
  var temperatureLowerBound = -15;

  // get data
  var dailyForecastData = data.daily.data;
  var hourlyForecastData = data.hourly.data;
  var forecastDay = 0; // set to '0' for today's forecast; change to debug
  var sunrise = new Date(dailyForecastData[forecastDay].sunriseTime * 1000);
  var sunset = new Date(dailyForecastData[forecastDay].sunsetTime * 1000);
  var currentTemperature = Math.round(data.currently.apparentTemperature) + "&deg;";  
  
  // draw 0-degree line
  var zeroDegreePercent = 1 - (0 - temperatureLowerBound) / (temperatureUpperBound - temperatureLowerBound);
  
  ctx.beginPath();
  ctx.moveTo(0, zeroDegreePercent * canvasHeight);
  ctx.lineTo(canvasWidth, zeroDegreePercent * canvasHeight);
  ctx.closePath();
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 2;
  ctx.stroke();
      
//   var cachedTemperature;
  
  for (var hour = 0; hour < hoursToDisplay; hour++) {
    var hourlyForecastTime = new Date(hourlyForecastData[hour].time * 1000);
    var timePercent = hour / hoursToDisplay;
    var timeXPos = Math.round(timePercent * canvasWidth);
    
    // draw precipitation graph
    var precipBarMax = 4;
    var precipBarPercent = 1 - (hourlyForecastData[hour].precipIntensity / precipBarMax); // for precipitation amount
    var precipBarYPos = Math.floor(precipBarPercent * canvasHeight);
    ctx.fillStyle = "rgba(0,118,255,0.5)";
    
    if (precipBarPercent < 1) {
      roundTopRect(ctx, timeXPos, precipBarYPos, precipBarWidth, canvasHeight - precipBarYPos, 4, true, false);
    }  

    // draw temperature graph
    var temperatureMarkerPrototype = "<div class='temperatureMarker'><div class='tempLabel'></div><div class='conditionImage'></div></div>"
    var hourlyTemperature = Math.round(hourlyForecastData[hour].apparentTemperature);
    var temperaturePercent = (0 - temperatureLowerBound + hourlyTemperature) / (temperatureUpperBound - temperatureLowerBound) * 100;
    $(".forecastGraph").append(temperatureMarkerPrototype);
    
    $(".temperatureMarker:last-child").css({
      "left": timePercent + "%",
      "bottom": temperaturePercent + "%"
    })
    
    $(".temperatureMarker:last-child .conditionImage").css("background-image", "url(images/weather-" + hourlyForecastData[hour].icon + ".png)");
        
    // only show temperature when it changes
/*
    if (hourlyTemperature != cachedTemperature) {
	    cachedTemperature = hourlyTemperature
			$(".temperatureMarker:last-child .tempLabel").append(hourlyTemperature + "&deg;");
    }
*/
        
    // draw hours legend
/*
    if (hourlyForecastTime.getHours() % 6 == 0) {
      var hourLabelText = formatTime(hourlyForecastTime, true, false, true);
      var hourLabelPrototype = "<div class='hourLabel'><div class='hourLabelText'>" + hourLabelText + "</div></div>"
      $(".hoursLegend").append(hourLabelPrototype);
      $(".hourLabel:last-child").css({
        "left": timePercent + "%"
      });
    }
*/
    
  }
    
/*
  $('.daylightIndicator').css("left", getTimePercent(sunrise) + "%");
  $('.daylightIndicator').css("right", 100 - getTimePercent(sunset) + "%");
*/

  // show current temperature
  $('.currentTemperature').html("");
  $(".currentTemperature").append("Feels like " + currentTemperature);

  // display weather summary
  $('.summary').html(data.hourly.summary);
}

function roundTopRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: 0, bl: 0}; // remove radius for bottom corners
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
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