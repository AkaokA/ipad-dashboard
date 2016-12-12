
// route list: http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=ttc
// stops list (for route 91, for example): http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=ttc&r=91

var nextBusURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=ttc&stopId=3204";
var itemsToDisplay = 3;

var parseTime = function(time) {
	var minutes = Math.floor(time / 60);
	var seconds = time % 60;
	
	if (seconds < 10) {
		seconds = '0'+seconds;
	}
	
  if (minutes < 10) {
		minutes = ''+minutes;
	}

	return minutes+"m "+seconds+"s";
}

// Get JSON from NextBus
var getNextBusData = function(url) {
	$.get(url)
	.done(function(data) {
		console.log('NextBus data Loaded.');
		$('.tableRow').remove();
	  
		parseData(data);
	})
	.fail(function(jqxhr, textStatus, error) {
		var err = textStatus + ', ' + error;
		console.log( "Request Failed: " + err);
	})
	.always(function() { 
// 		console.log( "complete" );
	});
}

var parseData = function(jsonData) {
	var predictionItems = jsonData.getElementsByTagName("prediction");
	var predictionItemsArray = Array.prototype.slice.call(predictionItems, 0);
				
	predictionItemsArray.sort(function(a,b) {
	    return a.getAttribute("seconds") - b.getAttribute("seconds");
	});
  // 	console.log(predictionItemsArray);
  
  updateBusTable(predictionItemsArray);
}

var updateBusTable = function(predictionItemsArray) {
	// Iterate through the XML
	for (var i = 0; i < itemsToDisplay; i++) {
		var predictionItem = predictionItemsArray[i];
    
		var rawTime = predictionItem.getAttribute("seconds");
		
		var busNumber = predictionItem.getAttribute("vehicle");
		var status = '';
		var colorClass = '';

		var eta = parseTime(rawTime);
		
		// update status label for current row
		if (rawTime < 180) {
			status = 'Too Late';
			colorClass = 'tooLateStatus';
		} else if (rawTime < 360) {
			status = 'Leave Now';
			colorClass = 'leaveNowStatus'
		} else if (rawTime < 540) {
			status = 'Approaching';
			colorClass = 'approachingStatus'
		} else {
			status = '—';
			colorClass = 'defaultStatus'
		}
		
		// Create table row
		var busNumberColumn = '<div class="tableCell busNumberColumn">' + busNumber + '</div>'
		var etaColumn = '<div class="tableCell etaColumn">' + eta + '</div>'
		var statusColumn = '<div class="tableCell statusColumn">' + status + '</div>'
		
		var tableRow = '<div class="tableRow '+ colorClass +'">' + etaColumn + statusColumn + '</div>';

		$(".nextBusTable").append(tableRow);	
  }
  console.log("table refreshed.");
}

$(document).ready(function(){
  getNextBusData(nextBusURL);
  setInterval(function(){
		getNextBusData(nextBusURL);
	}, 30000); // every 30 seconds
});
