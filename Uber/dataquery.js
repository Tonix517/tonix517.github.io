var latlngs = [];
var markers = [];
var titles = [];

function clearRec()
{
	latlngs = [];	
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
	titles = [];
}

//	Put one marker on the map
function addMarker(omap, latlng, title)
{
	var latlng = new google.maps.LatLng(latlng.lat, latlng.lng);  	
    latlngs.push(latlng);  		
	
	for(var i = 1; i < latlngs.length; i ++)
	{		
		var marker = new google.maps.Marker({
		  position: latlngs[i], 
		  map: omap,		  
		  animation: google.maps.Animation.DROP
	    });
		markers.push(marker);
		
		titles.push(title);
		
		var infow = new google.maps.InfoWindow();				
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
			  infow.setContent(titles[i]);
			  infow.open(map, marker);
			}
		  })(marker, i));
	}
}

//	Get LatLng by address name
function getOfficialAddress(title, location, map)
{
/*
	//	Another way to do it
	var geocoder = new google.maps.Geocoder();
	  geocoder.geocode( { 'address': location}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {		  
		  var latlng = {lat: results[0].geometry.location.lat, 
							lng: results[0].geometry.location.lng};						
		  addMarker(map, latlng, title);
		} else {
		  //alert('Geocode was not successful for the following reason: ' + status);
		}
	  });
*/
	
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{		
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	  {		  	  
		  var ret = xmlhttp.responseText;
		  var obj = JSON.parse(ret);		  
		  		  
		  if(obj.results[0] != null)
		  {			
			var latlng = {lat: obj.results[0].geometry.location.lat, 
							lng: obj.results[0].geometry.location.lng};						
			addMarker(map, latlng, title);
		  }
	  }
	}	
	if (location.indexOf('(') != -1)
	{
		location = location.substring(location.indexOf('(') + 1, location.indexOf(')'));		
	}
	var sec = location.replace(/\s+/g, '+') + "+San+Francisco+CA";
	//	http://maps.google.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&sensor=false
	var qstr = "http://maps.google.com/maps/api/geocode/json?address=" + sec + "&sensor=false";			
	xmlhttp.open("GET",qstr,true);
	xmlhttp.send();
}

//	Get a list of titles for autocomplete
function loadTitles()
{	
	var pre = $('#mname').val();
	if (pre == "" || pre == null)
	{
		dataList.clear();
		return;
	}
	
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{		
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	  {		  	  			  
		  var parsed = JSON.parse(xmlhttp.responseText);
		  
		  var dataList = $("#titles");
		  dataList.empty();
		  
		  for(var i=0, len=parsed.length; i<len; i++) {
			var opt = $("<option></option>").attr("value", parsed[i]);			
			dataList.append(opt);
		  }
		  dataList.show();
	  }
	}	
		
	var url = "http://sfmovie4tony.appspot.com/autocomplete?prefix="+pre;
	
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

//	Get a list of movies by prefix
function loadData(prefix, map)
{	
	var xmlhttp;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	}
	else
	{// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function()
	{		
	  if (xmlhttp.readyState==4 && xmlhttp.status==200)
	  {		  	  
		  var entries = xmlhttp.responseText.split("<br>");		  		  
		  entries.pop(); // remove null
		  
		  var text = "";		  
		  for (var i = 0; i < entries.length; i++) {			
			var input = entries[i].split(":");
			var title = input[0];
			var location = input[1];
			text += title + " @ " + location + "<br>";
			getOfficialAddress(title, location, map);
		  }		  
		//document.getElementById("log").innerHTML=text;
	  }
	}	
	var url = "http://sfmovie4tony.appspot.com/";
	if(prefix != "")
	{
		url += "?prefix="+prefix;
	}
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}