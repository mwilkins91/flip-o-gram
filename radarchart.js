const flipogram = {};


flipogram.getData = function() {
    //Sample Data - Re build 
    flipogram.dataValues = [
        [1.0, 0.9913793103448275, 0.8448275862068965, 0.8362068965517241, 0.7758620689655172, 0.7629310344827587, 0.7198275862068966, 0.7068965517241379, 0.6551724137931034, 0.4827586206896552, 0.4827586206896552, 0.47413793103448276],
        [0.3154913294797688, 0.25410404624277455, 0.09063583815028903, 0.0, 0.5202312138728323, 0.14462427745664738, 0.324393063583815, 1.0, 0.8698265895953757, 0.16832369942196532, 0.051791907514450876, 0.30520231213872834],
        [0.05102040816326531, 0.17346938775510207, 1.0, 0.0, 0.0, 0.7551020408163265, 0.0, 0.0, 0.0, 0.5714285714285715, 0.5714285714285715, 0.5612244897959184],
        [0.12315270935960591, 0.3793103448275862, 0.35467980295566504, 0.019704433497536946, 1.0, 0.2660098522167488, 0.07881773399014778, 0.2758620689655173, 0.4630541871921182, 0.04926108374384237, 0.3497536945812808, 0.18719211822660098]
    ];
    flipogram.dataTitles = ["Management Fundamentals", "Operations Optimization", "Help Desk / Service Desk", "AECOM Technology (ACM)", "HVAC Maintenance", "Disaster Planning", "Facilities Management", "Oscilloscopes", "Cost Control", "Event Management", "Mobile Device Management", "Commercial Perimeter Protection"];
    flipogram.dataCategories = ["All Items", "Items Receiving Traffic", "Newly Created Items", "Visitors"];
}

flipogram.prepVariables = function(whereToRender) {
 //**Customizable options
    flipogram.numberOfChartLevels = 5 //the number of lines that connect spokes
    flipogram.marginAroundChart = 0.7; 
    flipogram.colors =  ["#87ceeb", "#fcd72a", "#ce0058", "#70c176"] ;
    flipogram.rawSelector = whereToRender;
 //**Setup array variables
    flipogram.numberOfSpokes = []; //An array from 0 to the number of spokes on the wheel 
	    for (var i = 0; i < flipogram.dataTitles.length; i++) {
	        flipogram.numberOfSpokes.push(i);
	    }
    flipogram.chartLevelValues = []; //The values for each of the levels specified above (IE: level 1 = 0.2)
	    for (var i = 0; i < flipogram.numberOfChartLevels; i++) {
	        flipogram.chartLevelValues.push((i + 1) / flipogram.numberOfChartLevels)
	    }
 //**Set up D3 selectors
    flipogram.d3RadarDiv = d3.select(whereToRender);
    flipogram.d3RadarSvg = flipogram.d3RadarDiv.append('svg').attr('class', 'radarSvg').attr('id', 'radarSvg');
 //**Set up Jquery selectors
    flipogram.$radarDiv = $(whereToRender);
    flipogram.$RadarSvg = $('#radarSvg')
 //**Set up measurement variables for drawing chart
    var radarDivWidth = $(flipogram.$radarDiv).width();
    var radarDivHeight = $(flipogram.$radarDiv).height();
    var absoluteMaxDiameter = Math.min(radarDivWidth * 2, radarDivHeight * 2);
    flipogram.maximumChartDiameter = absoluteMaxDiameter - (absoluteMaxDiameter * flipogram.marginAroundChart);
    flipogram.radius = (flipogram.maximumChartDiameter / 2);
    flipogram.maximumTextDiameter = flipogram.maximumChartDiameter + (flipogram.maximumChartDiameter * 0.1);
    flipogram.xCenter = radarDivWidth / 2; 
    flipogram.yCenter = radarDivHeight / 2;
    flipogram.distanceBetweenSpokes = 2 * Math.PI / flipogram.numberOfSpokes.length;
}

flipogram.drawSpokes = function() {
 //**Initialize container for spokes, to center
    var spokeCenter = flipogram.d3RadarSvg.append('svg')
    	.attr('class', 'radarSpokeCenter')
    	.attr('x', '50%')
    	.attr('y', '50%');
 //**Initialize group to contain spokes
    var spokes = spokeCenter.append('svg:g')
    	.attr('class', 'radarSpoke');
 //**Initialize loop for each spoke of the chart
    spokes.selectAll('.spoke')
        .data(flipogram.numberOfSpokes)
        .enter()
        .append('svg:line').attr('class', function(index) {
            return ('radarLine' + index + ' radarLine');
        })
        .attr('x1', '0')
        .attr('y1', '0')
        .attr('x2', function(_, index) {
            console.log((2 * Math.cos(index * flipogram.distanceBetweenSpokes)))
            return (flipogram.maximumChartDiameter / 2 * Math.cos(index * flipogram.distanceBetweenSpokes)); 
        })
        .attr('y2', function(_, index) {
            return  (flipogram.maximumChartDiameter / 2 * Math.sin(index * flipogram.distanceBetweenSpokes)); 
        })
}

flipogram.drawWebbing = function() {
	var radius = flipogram.radius;
 //**Initialize container for the 'web' svg
	var webbingCenter = flipogram.d3RadarSvg.append('svg')
		.attr('class', 'radarWebbingCenter')
		.attr('x', '50%')
		.attr('y', '50%'); 
 //** Initialize loop for each layer of the 'web'
	var webbing = webbingCenter.append("svg:g").attr('class', 'radarWebbing'); //positions the spoke-rings in the center of the chart (should be refactored to %)
    webbing.selectAll(".radarWeb")
        .data(flipogram.chartLevelValues)
        .enter()
        .append("svg:polygon").attr('class', function(_, index) {
        	return 'radarWeb' + index +' radarWeb';
        }) //create a spoke-ring for each fraction of 1 in arrayLevels
        .attr("points",
            function(chartLevelValue) {
                var strPoints = ""
                for (var spoke = 0; spoke < flipogram.numberOfSpokes.length; spoke++) {
                    var x = chartLevelValue * radius * Math.cos(spoke * flipogram.distanceBetweenSpokes);
                    var y = chartLevelValue * radius * Math.sin(spoke * flipogram.distanceBetweenSpokes);
                    strPoints += x + "," + y + " ";
                }
                return strPoints;
            }
        )
}

flipogram.drawTitles = function() {
 //**Initialize Title container
	var titleCenter = flipogram.d3RadarSvg.append('svg')
		.attr('class', 'radarTitleCenter')
		.attr('x', '50%')
		.attr('y', '50%');
 //**Initialize loop for each individual title
	var titles = titleCenter.append("svg:g"); //Append a <g> to the canvas <SVG> element
	titles.selectAll(".radarTitle")
		.data(flipogram.dataTitles)
		.enter()
		.append("svg:text").attr('class', 'radarTitle')
		.text(function(currentLabel) {
			return currentLabel
		})
		.attr('x', function(_, index){ 
			return (flipogram.maximumTextDiameter / 2 * Math.cos(index * flipogram.distanceBetweenSpokes))
		})
		.attr('y', function(_, index) {
        	return (flipogram.maximumTextDiameter / 2 * Math.sin(index * flipogram.distanceBetweenSpokes)); 
        })
        .attr("text-anchor", function(_, i) { //where the anchor point should be based on position of text relative to spokes
                if (Math.cos(i * flipogram.distanceBetweenSpokes) > 0.01) {
                    return "start";
                }
                else if (Math.abs(Math.cos(i * flipogram.distanceBetweenSpokes)) <= 0.01) {
                    return "middle";
                }
                else { // if cosine is strictly smaller than -0.1
                    return "end"
                }
            }
        )
        .attr("alignment-baseline", function(_, i) { //vertical anchor point relative to spokes
                if (Math.sin(i * flipogram.distanceBetweenSpokes) > 0.1) {
                    return "baseline";
                }
                else if (Math.abs(Math.sin(i * flipogram.distanceBetweenSpokes)) <= 0.1) {
                    return "middle";
                }
                else { // if sine is strictly smaller than -0.1
                    return "hanging"
                }
            }
        )
}

flipogram.drawDataOverlays = function() {
	var radius = flipogram.radius;
 //**Initialize overlay container
	var overlays = flipogram.d3RadarSvg.append('svg')
		.attr('class', 'radarOverlayCenter')
		.attr('x', '50%')
		.attr('y', '50%');
 //**Initialize loop for each individual overlay layer
	overlays.selectAll(".overlay")
        .data(flipogram.dataValues)
        .enter()
        .append("svg:polygon").attr('class', function(_, index) {
        	return 'radarOverlay' + index + ' radarOverlay';
        })
        .attr("points", function(dataOverlay) {
                var strPoints = ""
                for (var i = 0; i < dataOverlay.length; i++) {
                    var x = dataOverlay[i] * radius * Math.cos(i * flipogram.distanceBetweenSpokes);
                    var y = dataOverlay[i] * radius * Math.sin(i * flipogram.distanceBetweenSpokes);
                    strPoints += x + "," + y + " ";
                }
                return strPoints;
            })
        .attr("stroke", function(dataOverlay, index) {
                return flipogram.colors[index]
            })
        .attr("fill", function(dataOverlay, index) {
                return flipogram.colors[index]
            })
        .attr("id", function(dataOverlay, index) {
                return "overlay-index-" + index.toString()
            })
}

flipogram.drawLegend = function() {
	console.log('TODO: draw tables')
}

flipogram.render = function() {
    flipogram.drawSpokes(); // draws a line for each item in flipogram.numberOfSpokes, radiating out from the center of the chart.
    flipogram.drawWebbing();
    flipogram.drawTitles(); // draws the text at the end of each spoke.
    flipogram.drawDataOverlays();
    flipogram.drawLegend();
}

flipogram.reDraw = function() { //TODO: refactor into a more efficient redraw function
	$(flipogram.$RadarSvg).remove();
	window.removeEventListener("resize", flipogram.reDraw);
	flipogram.init(flipogram.rawSelector);
}

flipogram.init = function(whereToRender) {
    console.time('Radarchart Generated in:')
    if (d3.select(whereToRender).empty()) {
        console.error('Flipogram: Your selector found nothing, nowhere to render! Check flipogram.init(<selector>)');
    } else {
        flipogram.getData(); //Gets data from DB (currently, dummy data.)
        flipogram.prepVariables(whereToRender); //sets up variables for use in chart generation based on data obtained in getData();
        flipogram.render(); //Renders chart using setup from above
        window.addEventListener("resize", flipogram.reDraw);
    }
    console.timeEnd('Radarchart Generated in:')
}


$(function() { //doc ready 
    flipogram.init('#flipogram') //go!
})
