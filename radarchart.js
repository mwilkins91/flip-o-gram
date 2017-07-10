const flipogram = {};


//colors = ["#87ceeb", "#fcd72a", "#ce0058", "#70c176"];

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

    flipogram.numberOfSpokes = []; //An array from 0 to the number of spokes on the wheel 
    for (var i = 0; i < flipogram.dataTitles.length; i++) {
        flipogram.numberOfSpokes.push(i);
    }

    flipogram.numberOfChartLevels = 5 //the number of lines that connect spokes

    flipogram.chartLevelValues = []; //The values for each of the levels specified above (IE: level 1 = 0.2)
    for (var i = 0; i < flipogram.numberOfChartLevels; i++) {
        flipogram.chartLevelValues.push((i + 1) / flipogram.numberOfChartLevels)
    }

    flipogram.d3RadarDiv = d3.select(whereToRender);
    flipogram.$radarDiv = $(whereToRender);

    flipogram.d3RadarSvg = flipogram.d3RadarDiv.append('svg').attr('class', 'radarSvg').attr('id', 'radarSvg');
    flipogram.$RadarSvg = $('#radarSvg')

    flipogram.marginAroundChart = 0.7; 
    var radarDivWidth = $(flipogram.$radarDiv).width();
    var radarDivHeight = $(flipogram.$radarDiv).height();
    var absoluteMaxDiameter = Math.min(radarDivWidth * 2, radarDivHeight * 2);
    flipogram.maximumChartDiameter = absoluteMaxDiameter - (absoluteMaxDiameter * flipogram.marginAroundChart);
    flipogram.radius = (flipogram.maximumChartDiameter / 2)
    flipogram.maximumTextDiameter = flipogram.maximumChartDiameter + (flipogram.maximumChartDiameter * 0.1)
    

    flipogram.xCenter = radarDivWidth / 2 
    flipogram.yCenter = radarDivHeight / 2 


    flipogram.distanceBetweenSpokes = 2 * Math.PI / flipogram.numberOfSpokes.length;

    flipogram.colors =  ["#87ceeb", "#fcd72a", "#ce0058", "#70c176"] ;
}

flipogram.drawSpokes = function() {
    var spokes = flipogram.d3RadarSvg.append('svg:g').attr('class', 'radarSpoke');
    

    spokes.selectAll('.spoke')
        .data(flipogram.numberOfSpokes)
        .enter()
        .append('svg:line').attr('class', function(index) {
            return ('radarLine' + index + ' radarLine');
        })
        .attr('x1', '50%')
        .attr('y1', '50%')
        .attr('x2', function(_, index) {
            console.log((2 * Math.cos(index * flipogram.distanceBetweenSpokes)))
            return flipogram.xCenter + (flipogram.maximumChartDiameter / 2 * Math.cos(index * flipogram.distanceBetweenSpokes)); 
        })
        .attr('y2', function(_, index) {
            return flipogram.yCenter + (flipogram.maximumChartDiameter / 2 * Math.sin(index * flipogram.distanceBetweenSpokes)); 
        })
}

flipogram.drawWebbing = function() {
	var radius = flipogram.radius;
	var webbingCenter = flipogram.d3RadarSvg.append('svg').attr('class', 'radarWebbingCenter').attr('x', '50%').attr('y', '50%'); //append svg for centering to allow center with x/y rather than translate (better for IE)
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
	var labels = flipogram.d3RadarSvg.append("svg:g"); //Append a <g> to the canvas <SVG> element
	labels.selectAll(".radarTitle")
		.data(flipogram.dataTitles)
		.enter()
		.append("svg:text").attr('class', 'radarTitle')
		.text(function(currentLabel) {
			return currentLabel
		})
		.attr('x', function(_, index){ //TODO, find way to dynamically calculate position
			return flipogram.xCenter + (flipogram.maximumTextDiameter / 2 * Math.cos(index * flipogram.distanceBetweenSpokes))
		})
		.attr('y', function(_, index) {
        	return flipogram.yCenter + (flipogram.maximumTextDiameter / 2 * Math.sin(index * flipogram.distanceBetweenSpokes)); 
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
	var overlays = flipogram.d3RadarSvg.append('svg').attr('class', 'radarOverlayCenter').attr('x', '50%').attr('y', '50%')
	overlays.selectAll(".overlay")
        .data(flipogram.dataValues)
        .enter()
        .append("svg:polygon").attr('class', function(_, index) {
        	return 'radarOverlay' + index + ' radarOverlay';
        })
        .attr("points",
            function(dataOverlay) {
                var strPoints = ""
                for (var i = 0; i < dataOverlay.length; i++) {
                    var x = dataOverlay[i] * radius * Math.cos(i * flipogram.distanceBetweenSpokes);
                    var y = dataOverlay[i] * radius * Math.sin(i * flipogram.distanceBetweenSpokes);
                    strPoints += x + "," + y + " ";
                }
                return strPoints;
            }
        )
        .attr("stroke", function(dataOverlay, idxOverlay) {
                return flipogram.colors[idxOverlay]
            }
        )
        .attr("stroke-width", "2px")
        .attr("stroke-opacity", 1)
        .attr("fill", function(dataOverlay, idxOverlay) {
                return flipogram.colors[idxOverlay]
            }
        )
        .attr("fill-opacity", 0.3)
        .attr("id", function(dataOverlay, idxOverlay) {
                return "overlay-index-" + idxOverlay.toString()
            }
        )
        .on("mouseover", function(){d3.select(this).style("fill-opacity", 0.8);})
        .on("mouseout", function(){d3.select(this).style("fill-opacity", 0.3);});
}

flipogram.render = function() {
    flipogram.drawSpokes(); // draws a line for each item in flipogram.numberOfSpokes, radiating out from the center of the chart.
    flipogram.drawWebbing();
    flipogram.drawTitles(); // draws the text at the end of each spoke.
    flipogram.drawDataOverlays();
}

flipogram.reDraw = function() {
	$(flipogram.$RadarSvg).remove();
	flipogram.init('#flipogram')

}

flipogram.init = function(whereToRender) {
    console.time('Radarchart Generated in:')
    if (d3.select(whereToRender).empty()) {
        console.error('Flipogram: Your selector found nothing, nowhere to render! Check flipogram.init(<selector>)');
    } else {
        flipogram.getData(); //Gets data from DB (currently, dummy data.)
        flipogram.prepVariables(whereToRender); //sets up variables for use in chart generation based on data obtained in getData();
        flipogram.render(); //Renders chart using setup from above
    }
    console.timeEnd('Radarchart Generated in:')
}


$(function() { //doc ready 
    flipogram.init('#flipogram') //go!
})
