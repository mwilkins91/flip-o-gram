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

    flipogram.marginAroundChart = 0.6; 

    flipogram.D3RadarDiv = d3.select(whereToRender);
    flipogram.$radarDiv = $(whereToRender);

    flipogram.D3RadarSvg = flipogram.D3RadarDiv.append('svg').attr('class', 'radarSvg').attr('id', 'radarSvg');
    flipogram.$RadarSvg = $('#radarSvg')
}

flipogram.drawSpokes = function() {
    var distanceBetweenSpokes = 2 * Math.PI / flipogram.numberOfSpokes.length;
    var spokes = flipogram.D3RadarSvg.append('svg:g').attr('class', 'radarSpoke');
    var radarDivWidth = $(flipogram.$radarDiv).width();
    var radarDivHeight = $(flipogram.$radarDiv).height();
    var maximumChartDiameter = Math.min(radarDivWidth * 2, radarDivHeight * 2);
    maximumChartDiameter = maximumChartDiameter - (maximumChartDiameter * flipogram.marginAroundChart);

    spokes.selectAll('.spoke')
        .data(flipogram.numberOfSpokes)
        .enter()
        .append('svg:line').attr('class', function(index) {
            return ('radarLine' + index + ' radarLine');
        })
        .attr('x1', '50%')
        .attr('y1', '50%')
        .attr('x2', function(_, index) {
            console.log((2 * Math.cos(index * distanceBetweenSpokes)))
            return 'calc(50% + ' + (maximumChartDiameter / 2 * Math.cos(index * distanceBetweenSpokes)) + ')' //xCentre + widthChart / 2 * Math.cos(index * distanceBetweenSpokes); 
        })
        .attr('y2', function(_, index) {
            return 'calc(50% + ' + (maximumChartDiameter / 2 * Math.sin(index * distanceBetweenSpokes)) + ')' //xCentre + widthChart / 2 * Math.cos(index * distanceBetweenSpokes); 
        })
}

flipogram.drawLabels = function() {
console.log('labels')

}

flipogram.render = function() {
    var distanceBetweenSpokes = 2 * Math.PI / flipogram.numberOfSpokes;
    var radarDivWidth = $(flipogram.$radarDiv).width();
    var radarDivHeight = $(flipogram.$radarDiv).height();
    var maximumChartDiameter = Math.min(radarDivWidth * 2, radarDivHeight * 2);

    flipogram.drawSpokes(); // draws a line for each item in flipogram.numberOfSpokes, radiating out from the center of the chart.
    flipogram.drawLabels(); // draws the text at the end of each spoke.
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
