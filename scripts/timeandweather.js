var $dateElement = $(".timeDisplay");
var $weatherElement = $(".weatherDisplay");
var currentTime = new Date();

// colors
var blueColorTransparent = "rgba(0,118,255,0.5)";
var greyColor       = "#A4AAB3";
var greyColorDark   = "#444";
var greyColorLight  = "#C7C7CD";

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

var canvasBottomMargin = 4;
var canvasWidth = $(".weatherDisplay").outerWidth();
var canvasHeight = $(".weatherDisplay").outerHeight() - canvasBottomMargin;

var setupCanvas = function($canvasElement) {
  // set up canvases
  var canvas = $canvasElement[0];
  var ctx = canvas.getContext('2d');
  
  // retina support
  if (window.devicePixelRatio) {
    scaleFactor = window.devicePixelRatio;
  } else {
    scaleFactor = 1;
  }
  
  // scaleFactor = 1; // override scale factor
  
  // increase dimensions of canvas if retina
  canvas.width = canvasWidth * scaleFactor;
  canvas.height = canvasHeight * scaleFactor;  
  
  // set size of canvas to the intended size
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";  
  
  // scale canvas contents to fit actual size
  ctx.scale(scaleFactor,scaleFactor);
  
  // clear the graphs before drawing
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  return ctx;
}

var updateWeatherDisplay = function(data) {
  //config variables
  var hoursToDisplay = 18;
  var precipBarWidth = 32;
  var temperatureUpperBound = 30;
  var temperatureLowerBound = -15;
  var iconSize = 24;
  
  var precipitationCtx = setupCanvas( $(".precipitationGraph") );
  var forecastCtx = setupCanvas( $(".forecastGraph") );
  
  // get data
  var dailyForecastData = data.daily.data;
  var hourlyForecastData = data.hourly.data;
  var forecastDay = 0; // set to '0' for today's forecast; change to debug
  var sunrise = new Date(dailyForecastData[forecastDay].sunriseTime * 1000);
  var sunset = new Date(dailyForecastData[forecastDay].sunsetTime * 1000);
  var currentTemperature = Math.round(data.currently.apparentTemperature) + "&deg;";  
  
  // draw 0-degree line
  var zeroDegreePercent = 1 - (0 - temperatureLowerBound) / (temperatureUpperBound - temperatureLowerBound);
  var zeroDegreeYPos = zeroDegreePercent * canvasHeight;
  forecastCtx.beginPath();
  forecastCtx.moveTo(0, zeroDegreeYPos);
  forecastCtx.lineTo(canvasWidth, zeroDegreePercent * canvasHeight);
  forecastCtx.strokeStyle = greyColorDark;
  forecastCtx.lineWidth = 2;
  forecastCtx.stroke();
  
  // begin drawing temperature line
  forecastCtx.beginPath();
  
  var icons = [];

  for (var hour = 0; hour < hoursToDisplay; hour++) {
    var hourlyForecastTime = new Date(hourlyForecastData[hour].time * 1000);
    var timePercent = hour / hoursToDisplay;
    var timeXPos = Math.round(timePercent * canvasWidth);
    
    // draw precipitation graph
    var precipBarMax = 4;
    var precipBarPercent = hourlyForecastData[hour].precipIntensity / precipBarMax; // for precipitation amount
    var precipBarYPos = Math.floor((1 - precipBarPercent) * canvasHeight);
    precipitationCtx.fillStyle = blueColorTransparent;
    
    if (precipBarPercent <= 1) {
      drawRoundTopRect(precipitationCtx, timeXPos, precipBarYPos, precipBarWidth, canvasHeight - precipBarYPos, 4, true, false);
    }  

    // draw temperature graph
    var hourlyTemperature = Math.round(hourlyForecastData[hour].apparentTemperature);
    var temperaturePercent = (0 - temperatureLowerBound + hourlyTemperature) / (temperatureUpperBound - temperatureLowerBound);
    var temperatureYPos = Math.floor((1 - temperaturePercent) * canvasHeight);
    
    if (hour == 0) {
      forecastCtx.moveTo(timeXPos + precipBarWidth/2, temperatureYPos);
    } else {
      forecastCtx.lineTo(timeXPos + precipBarWidth/2, temperatureYPos);
    }
    
    // create and draw condition icons
    icons[hour] = new Image();
    icons[hour].src = "images/weather-" + hourlyForecastData[hour].icon + ".png";
    icons[hour].addEventListener("load", drawConditionIcon.bind(icons[hour], forecastCtx, timeXPos, temperatureYPos, precipBarWidth, iconSize), false);
    
    // TODO: draw temperature labels
    forecastCtx.font = '24px adelle-sans-1';
    forecastCtx.textAlign = "center";
    forecastCtx.fillStyle = "#ffffff";
    forecastCtx.fillText(hourlyTemperature, timeXPos + precipBarWidth/2, temperatureYPos - 20);
    
    // draw hours legend
    if (hourlyForecastTime.getHours() % 3 == 0) {
      var hourLabelText = formatTime(hourlyForecastTime, true, false, true);
      var hourLabelPrototype = "<div class='hourLabel'><div class='hourLabelText'>" + hourLabelText + "</div></div>"
      $(".hoursLegend").append(hourLabelPrototype);
      $(".hourLabel:last-child").css({
        "left": timePercent * 100 + "%"
      });
    }
  }
  
  // finish drawing temperature line
  forecastCtx.strokeStyle = greyColorLight;
  forecastCtx.lineCap = "round";
  forecastCtx.lineJoin = "round";
  forecastCtx.lineWidth = 4;
  forecastCtx.stroke();

  // TODO: draw daylight indicator


  // show current temperature
  $('.currentTemperature').html("");
  $(".currentTemperature").append("Feels like " + currentTemperature);

  // display weather summary
  $('.summary').html(data.hourly.summary);
}

var drawConditionIcon = function(ctx, timeXPos, temperatureYPos, precipBarWidth, iconSize) {
  ctx.drawImage(this, timeXPos + precipBarWidth/2 - iconSize/2, temperatureYPos - iconSize/2, iconSize, iconSize);
}

var drawRoundTopRect = function(ctx, x, y, width, height, radius, fill, stroke) {
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