function populateMenu(container, indexArray) {

	pane = $(container).find(".jspContainer").find(".jspPane");
	pane.html("");
	var api = $(container).data('jsp'); api.reinitialise();

	switch(container) {
		case "#continent":
			childContainer = "#subContinent";
			locationArray = cityData.continents;			
			
			$("#subContinent").find(".jspContainer").find(".jspPane").html("");
			$("#country").find(".jspContainer").find(".jspPane").html("");
			$("#region").find(".jspContainer").find(".jspPane").html("");
			$("#city").find(".jspContainer").find(".jspPane").html("");
			break;
		case "#subContinent":
			childContainer = "#country";
			locationArray = cityData.continents[indexArray[0]].subContinents;			
			
			$("#country").find(".jspContainer").find(".jspPane").html("");
			$("#region").find(".jspContainer").find(".jspPane").html("");
			$("#city").find(".jspContainer").find(".jspPane").html("");				
			break;				
		case "#country":
			childContainer = "#region";
			locationArray = cityData.continents[indexArray[0]].subContinents[indexArray[1]].countries;			
			
			$("#region").find(".jspContainer").find(".jspPane").html("");
			$("#city").find(".jspContainer").find(".jspPane").html("");						
			break;			
		case "#region":
			childContainer = "#city";
			locationArray = cityData.continents[indexArray[0]].subContinents[indexArray[1]].countries[indexArray[2]].regions;			
			
			$("#city").find(".jspContainer").find(".jspPane").html("");						
			break;	
		case "#city":
			locationArray = cityData.continents[indexArray[0]].subContinents[indexArray[1]].countries[indexArray[2]].regions[indexArray[3]].cities;
		
			break;
	}


	for (var curIndex in locationArray) {
		var childArray, childContainer;
		
		var curIndexArray = indexArray.slice(0);
		curIndexArray.push(curIndex);
	
		locationHeader = $("<h3/>").appendTo(pane); 
		$(locationHeader).css("display", "none");
		$(locationHeader).html(locationArray[curIndex].name + " [" + locationArray[curIndex].visits + "]");
		
		var fadeDelay = (curIndex < 5) ? curIndex * 100 : 500;
		if (curIndex == locationArray.length -1) {
			fadeCallback = function () { var api = $(container).data('jsp'); api.reinitialise(); };
		} else {
			fadeCallback = null;
		}
		
		$(locationHeader).delay(fadeDelay).fadeIn("slow", fadeCallback);
		
		$(locationHeader).data("container", childContainer);
		$(locationHeader).data("indexArray", curIndexArray);
		$(locationHeader).data("name", locationArray[curIndex].name);
		$(locationHeader).data("location", locationArray[curIndex].location);

		$(locationHeader).click( function() 
		{
		
			$(this).siblings().css("background", "transparent");
			$(this).css("background", "rgba(200, 54, 54, 0.2)");
			indexArray = $(this).data("indexArray");
		
			if (childContainer != null) {
				populateMenu($(this).data("container"), indexArray);			
			} else {

				// Populate City Display
				curLocation = $(this).data('location');
				curName = $(this).data('name');
				
				$("#content").fadeOut("fast", function() {
					$("#content").html("");
					$("#content").show();
					
					locationHeader = $("<h1>"+ curName +"</h1>").css("display","none").appendTo("#content");
					locationHeader.fadeIn();
					
					
					countryName = cityData.continents[indexArray[0]].subContinents[indexArray[1]].countries[indexArray[2]].name;
					regionName = cityData.continents[indexArray[0]].subContinents[indexArray[1]].countries[indexArray[2]].regions[indexArray[3]].name;
					
					geoName = (regionName != "Unknown" && regionName != curName ) ? regionName + ", " + countryName : countryName;
					wikiName = (regionName != "Unknown" && regionName != curName ) ? curName + " " + regionName : curName;
					
					
					// Fetch City Data
					
					geoHeader = $("<h2>"+geoName+"</h2>").css("display","none").appendTo("#content");
					dataBox = $("<div id='data'/>").appendTo("#content");					
					geoDiv = $("<div id='geo'/>").css("display","none").appendTo("#data");				
					weatherHeader = $("<h2>Weather</h2>").css("display","none").appendTo("#data");
					weatherDiv = $("<div id='weather'/>").css("display","none").appendTo("#data");	
					wikiHeader = $("<h2>Wikipedia</h2>").css("display","none").appendTo("#data");
					wikiDiv = $("<div id='wiki'/>").css("display","none").appendTo("#data");					
					
					var timeURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22http%3A%2F%2Fws.geonames.org%2Ftimezone%3Flat%3D"+curLocation[0]+"%26lng%3D"+curLocation[1]+"%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&debug=true&callback=?"; 
					//console.log(timeURL);
					$.getJSON(timeURL, function (data) {
	
						
						$("<span/>").html("<label>Coordinates:</label> " + curLocation[0] + "," + curLocation[1] + "<br/>").appendTo(geoDiv);	
						
						if (data.query.results != null) {
							$("<span/>").html("<label>Time Zone:</label> " + data.query.results.geonames.timezone.timezoneId + "<br/>").appendTo(geoDiv);
							localDate = data.query.results.geonames.timezone.time.split(" ")[0];
							localTime = data.query.results.geonames.timezone.time.split(" ")[1];
							$("<span/>").html("<label>Local Date:</label> " + localDate + "<br/>").appendTo(geoDiv);	
							$("<span/>").html("<label>Local Time:</label> <span class='clock'></span><br/>").appendTo(geoDiv);	
						
							$('.clock').jclock({ utc: true, utc_offset: data.query.results.geonames.timezone.dstOffset });
						
						}

						geoDiv.delay(200).slideDown();
					});
						geoHeader.slideDown(200);

					
					var weatherURL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.placefinder%20where%20text%3D%22"+curLocation[0]+"%2C"+curLocation[1]+"%22%20and%20gflags%3D%22R%22)&format=json"
					$.getJSON(weatherURL, function (data) {
			
						if (data.query.results != null) {						
							$(weatherDiv).append("<label>Temperature:</label> " + data.query.results.channel.item.condition.temp + "&deg; F<br/>");
							$(weatherDiv).append("<label>Conditions:</label> " + data.query.results.channel.item.condition.text + "<br/>");
							$(weatherDiv).append("<label>Sunrise:</label> " + data.query.results.channel.astronomy.sunrise + "<br/>");
							$(weatherDiv).append("<label>Sunset:</label> " + data.query.results.channel.astronomy.sunset + "<br/>");
							
							weatherHeader.slideDown();
							weatherDiv.delay(200).slideDown();
						}
					});				
					
					var wikiURL = "http://api.geonames.org/wikipediaSearchJSON?q="+wikiName+"&maxRows=5&username=superfad&callback=?"
					//console.log(wikiURL);
					$.getJSON(wikiURL, function (data) {
	
						if (data.geonames.length > 0 ) {
						
							for(geoIndex in data.geonames) {
								var curAnchor = $("<a>").attr("href","http://"+data.geonames[geoIndex].wikipediaUrl).text(data.geonames[geoIndex].title);
								$(wikiDiv).append(curAnchor);
								$(wikiDiv).append("<br/>");
								
								
							}
						
							wikiDiv.slideDown();
							wikiHeader.delay(200).slideDown();
						}
					});				
				
				});
				
				// Point to city
				
				curLat = curLocation[0];
				curLong = 180- curLocation[1];
	
				curLong *= Math.PI/180;
				curLat *= Math.PI/180;
				
				new TWEEN.Tween( pointerNav.rotation)
					.to( { z: curLat,y: -curLong}, 800)
					.easing( TWEEN.Easing.Quadratic.EaseOut)
					.start();
					
					
				if (pointerMaterial.opacity==0){
					new TWEEN.Tween( pointerParticles.scale)
						.to( {x: 1}, 800)
						.easing( TWEEN.Easing.Quadratic.EaseOut)
						.start();

					new TWEEN.Tween( pointerMaterial)
						.to( {opacity: .75}, 800)
						.easing( TWEEN.Easing.Quadratic.EaseOut)
						.start();					
									
				}

			}
		});

	}

}