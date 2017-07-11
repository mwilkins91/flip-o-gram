
var flipogram = function (data) {

  //$ = jQuery;

  var config = {
    node: '#flipogram'
  };

  // Customizable options
  var numberOfRings = 5; //the number of rings
  var marginAroundChart = 0.7;
  var colors = ["#87ceeb", "#fcd72a", "#ce0058", "#70c176"];

  //An array from 0 to the number of spokes
  var spokes = [];
  for (var i = 0; i < data.labels.length; i++) {
    spokes.push(i);
  }

  // The values for each ring (i.e. level 1 == 0.2)
  // the `1` is to create a background for styling
  var ringRadii = [1];
  for (var i = 0; i < numberOfRings; i++) {
    ringRadii.push((i + 1) / numberOfRings)
  }

  // Set up measurements for drawing chart
  var $radarDiv = $(config.node);
  var absoluteMaxDiameter = Math.min($radarDiv.width() * 2, $radarDiv.height() * 2);
  var maximumChartDiameter = absoluteMaxDiameter - (absoluteMaxDiameter * marginAroundChart);
  var radius = (maximumChartDiameter / 2);
  var maximumTextDiameter = maximumChartDiameter + (maximumChartDiameter * 0.1);
  var distanceBetweenSpokes = 2 * Math.PI / spokes.length;


  // Set up container SVG
  var d3RadarSvg = d3.select(config.node).append('svg').attr('id', 'radarSvg');

  function initCenteredSvg(className) {
    var result = d3RadarSvg
      .append('svg')
      .attr('class', className)
      .attr('x', '50%')
      .attr('y', '50%');
    return result
  }

  var drawWebbing = function () {
    //  Initialize container for webbing
    var webbingContainer = initCenteredSvg('radarWebbingContainer');

    // draw the webbing
    webbingContainer
      .append("svg:g")
      .attr('class', 'radarWebbing')
      .selectAll(".radarWeb")
      .data(ringRadii)
      .enter()
        .append("svg:polygon")
        .attr('class', function (_, i) {
          return 'radarWeb' + i + ' radarWeb';
        })
        //create a spoke-ring for each fraction in ringRadii
        .attr("points",
          function (value) {
            var points = "";
            $.each(spokes, function(i, spoke){
              var x = value * radius * Math.cos(spoke * distanceBetweenSpokes);
              var y = value * radius * Math.sin(spoke * distanceBetweenSpokes);
              points += x + "," + y + " ";
            });
            return points;
          }
        )
  };

  var drawSpokes = function () {
    // Initialize container for spokes, to center
    var spokeContainer = initCenteredSvg('radarSpokeContainer');

    // build spokes
    spokeContainer
      .append('svg:g')
      .attr('class', 'radarSpoke')
      .selectAll('.spoke')
      .data(spokes)
      .enter()
      .append('svg:line')
      .attr('class', function (i) {
        return 'radarLine' + i + ' radarLine';
      })
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', function (_, i) {
        return maximumChartDiameter / 2 * Math.cos(i * distanceBetweenSpokes);
      })
      .attr('y2', function (_, i) {
        return maximumChartDiameter / 2 * Math.sin(i * distanceBetweenSpokes);
      })
  };

  var drawLabels = function () {
    //  Initialize Label container
    var labelContainer = initCenteredSvg('radarLabelContainer');

    // draw the labels
    labelContainer
      .append("svg:g")
      .selectAll(".radarLabel")
      .data(data.labels)
      .enter()
        .append("svg:text")
        .attr('class', 'radarLabel')
        .attr('x', function (_, i) {
          return (maximumTextDiameter / 2 * Math.cos(i * distanceBetweenSpokes))
        })
        .attr('y', function (_, i) {
          return (maximumTextDiameter / 2 * Math.sin(i * distanceBetweenSpokes));
        })
        // position of text relative to spokes
        .attr("text-anchor", function (_, i) {
          if (Math.cos(i * distanceBetweenSpokes) > 0.01) {
            return "start";
          }
          else if (Math.abs(Math.cos(i * distanceBetweenSpokes)) <= 0.01) {
            return "middle";
          }
          else { // if cosine is strictly smaller than -0.1
            return "end"
          }
        })
        // vertical anchor point relative to spokes
        .attr("alignment-baseline", function (_, i) {
          if (Math.sin(i * distanceBetweenSpokes) > 0.1) {
            return "baseline";
          }
          else if (Math.abs(Math.sin(i * distanceBetweenSpokes)) <= 0.1) {
            return "middle";
          }
          else { // if sine is strictly smaller than -0.1
            return "hanging"
          }
        })
        .text(function (label) { return label });
  };

  var drawOverlays = function () {
    // init overlay container
    var overlaysContainer = initCenteredSvg('radarOverlayContainer');

    // Initialize loop for each individual overlay layer
    overlaysContainer
      .selectAll(".overlay")
      .data(data.values)
      .enter()
        .append("svg:polygon")
        .attr('class', function(_, i) {
          return 'radarOverlay' + i + ' radarOverlay';
        })
        .attr('id', function (_, i) { return "overlay-index-" + i })
        .attr('points', function (overlayData) {
          var points = "";
          $.each(overlayData, function (i, value) {
            var x = value * radius * Math.cos(i * distanceBetweenSpokes);
            var y = value * radius * Math.sin(i * distanceBetweenSpokes);
            points += x + "," + y + " ";
          });
          return points
        })

        // could this be done with css?
        .attr('stroke', function (_, i) { return colors[i] })
        .attr('fill',   function (_, i) { return colors[i] })
  };

  function render() {
    drawWebbing();
    drawSpokes();
    drawLabels();
    drawOverlays();
  }

  render();

  //redraw stuff should probably be done outside of this so that we keep this module pure (eg not querying the dom except for graphing)

  // function redraw() {
  //   $('#radarSvg').remove();
  //   render();
  // }
  //
  // return exposedFunctions = {
  //   'redraw': redraw
  // }
};
