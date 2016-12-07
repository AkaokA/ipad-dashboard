
// route list: http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=ttc
// stops list (for route 91, for example): http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=ttc&r=91

var nextBusURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=ttc&stopId=3204";
var tableClassName = ".nextBusTable";
var secondsToRefresh = 15;

var parseTime = function(time) {
	var minutes = Math.floor(time / 60);
	var seconds = time % 60;
	
	if (seconds < 10) {
		seconds = '0'+seconds;
	}
	return minutes+":"+seconds;
}

var displayXML = function(xmlNode) {
	var predictionItems = xmlNode.getElementsByTagName("prediction");
	var predictionItemsArray = Array.prototype.slice.call(predictionItems, 0);
				
	predictionItemsArray.sort(function(a,b) {
	    return a.getAttribute("seconds") - b.getAttribute("seconds");
	});
	
	console.log(predictionItemsArray);
	
	// Iterate through the XML
	for (var i = 0; i < predictionItemsArray.length; i++) {
		var predictionItem = predictionItemsArray[i];

		var rawTime = predictionItem.getAttribute("seconds");
		var busNumber = predictionItem.getAttribute("vehicle");
		var eta = parseTime(rawTime);
		var status = '';
		var colorClass = '';
		
		// update status label for current row
		if (rawTime < 180) {
			status = 'Too Late';
			colorClass = 'red';
		} else if (rawTime < 360) {
			status = 'Leave Now';
			colorClass = 'amber'
		} else if (rawTime < 600) {
			status = 'Approaching';
			colorClass = 'grey'
		} else {
			status = '';
			colorClass = 'darkGrey'
		}
		
		// Create table row
		var busNumberColumn = '<div class="tableCell busNumberColumn">' + busNumber + '</div>'
		var etaColumn = '<div class="tableCell etaColumn">' + eta + '</div>'
		var statusColumn = '<div class="tableCell statusColumn">' + status + '</div>'
		
		var tableRow = '<div class="tableRow '+ colorClass +'">' + etaColumn + statusColumn + '</div>';

		$(tableClassName).append(tableRow);
	}
}

var waitAndRefresh = function() {
	var pollingRate = secondsToRefresh * 1000;
	setTimeout(function(){
		getNextBusData(nextBusURL);
	}, pollingRate);
}

// Get JSON from NextBus
var getNextBusData = function(url) {
	$.get(url)
	.done(function(xml) {
		console.log('XML loaded successfully.');
		$('.tableRow').remove();								
		displayXML(xml);
	})
	.fail(function(jqxhr, textStatus, error) {
		var err = textStatus + ', ' + error;
		console.log( "Request Failed: " + err);
	})
	.always(function() { 
		console.log( "complete" ); 
		waitAndRefresh();
	});
}

function parseXml(xml) {
	var dom = null;
	if (window.DOMParser) {
		try { 
			dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
		} 
		catch (e) { dom = null; }
	}
	else if (window.ActiveXObject) {
		try {
			dom = new ActiveXObject('Microsoft.XMLDOM');
			dom.async = false;
			if (!dom.loadXML(xml)) // parse error ..

				window.alert(dom.parseError.reason + dom.parseError.srcText);
		} 
		catch (e) { dom = null; }
	} else
		alert("cannot parse xml string!");
	return dom;
}

getNextBusData(nextBusURL);
