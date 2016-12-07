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

var getWeatherJSON = function() {
  $.ajax({
    type: "GET",
    url: "https://api.darksky.net/forecast/56636eda0499cbe93fced92b3268b26a/43.6906994,-79.3195922?units=ca", 
    dataType: "jsonp",
    crossDomain: true,
    success: function (data) {
      console.log(data)
      
      var maxTemp = Math.round(data.daily.data[0].apparentTemperatureMax);
      var minTemp = Math.round(data.daily.data[0].apparentTemperatureMin);
      var precipProbability = Math.round(data.daily.data[0].precipProbability * 100);
      
      $weatherElement.find('.temps').html(maxTemp + "&deg; / " + minTemp + "&deg;");
      $weatherElement.find('.summary').html(data.daily.data[0].summary);
      $weatherElement.find('.precip').html(precipProbability + "% chance of " + data.daily.data[0].precipType + ".");
    },
    error: function (xhr, ajaxOptions, thrownError) {
    }
  });	
}

$(document).ready(function(){
  displayTime();
  getWeatherJSON()
});