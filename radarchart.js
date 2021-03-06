

(function ( $ ) {

  $.fn.flipogram = function ( options ) {

    // Extend our default options with those provided.
    var settings = $.extend( {}, $.fn.flipogram.defaults, options );

    this.css({
      width: settings.width,
      height: settings.height
    });

    // Set up container SVG

    var $flipogramContainer = $(this)
    var d3RadarSvg = d3.select(this[0]).append('svg').attr('id', 'radarSvg');

    function initCenteredSvg(className) {
      var result = d3RadarSvg
        .append('svg')
        .attr('class', className)
        .attr('x', '50%')
        .attr('y', '50%');
      return result
    }

    //An array from 0 to the number of spokes
    var spokes = [];
    for (var i = 0; i < settings.data.labels.length; i++) {
      spokes.push(i);
    }

    // The values for each ring (i.e. level 1 == 0.2)
    // the `1` is to create a background for styling
    var ringRadii = [1];
    for (var i = 0; i < settings.ringsCount; i++) {
      ringRadii.push((i + 1) / settings.ringsCount)
    }

    // Set up measurements for drawing chart
    var diameterLimit = Math.min(this.width() * 2, this.height() * 2);
    var diameter = diameterLimit - (diameterLimit * settings.margin);
    var radius = (diameter / 2);
    var textRadius = (diameter + (diameter * 0.1)) / 2;
    var distanceBetweenSpokes = 2 * Math.PI / spokes.length;

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
          function (ringRadius) {
            var points = "";
            $.each(spokes, function(i, spoke){
              var x = ringRadius * radius * Math.cos(spoke * distanceBetweenSpokes);
              var y = ringRadius * radius * Math.sin(spoke * distanceBetweenSpokes);
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
          return radius * Math.cos(i * distanceBetweenSpokes);
        })
        .attr('y2', function (_, i) {
          return radius * Math.sin(i * distanceBetweenSpokes);
        })
    };

    var drawLabels = function () {
      //  Initialize Label container
      var labelContainer = initCenteredSvg('radarLabelContainer');

      // draw the labels
      labelContainer
        .append("svg:g")
        .selectAll(".radarLabel")
        .data(settings.data.labels)
        .enter()
        .append("svg:text")
        .attr('class', 'radarLabel')
        .attr('x', function (_, i) {
          return (textRadius * Math.cos(i * distanceBetweenSpokes));
        })
        .attr('y', function (_, i) {
          return (textRadius * Math.sin(i * distanceBetweenSpokes));
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
        .data(settings.data.values)
        .enter()
        .append("svg:polygon")
        .attr('class', function(_, i) {
          return 'radarOverlay' + i + ' radarOverlay';
        })
        .attr('id', function (_, i) { return "overlay-index-" + i })
        .attr('stroke', function (_, i) { return settings.colors[i] })
        .attr('fill',   function (_, i) { return settings.colors[i] })
        .attr('points', function (overlayData) {
          var points = "";
          $.each(overlayData, function (i, value) {
            var x = value * radius * Math.cos(i * distanceBetweenSpokes);
            var y = value * radius * Math.sin(i * distanceBetweenSpokes);
            points += x + "," + y + " ";
          });
          return points
        })
    };

    var drawLegend = function () {
      //create the container for the legend
      var legendContainer = d3.select($flipogramContainer[0])
        .append('div')
        .attr('id', 'radarLegend')
        .attr('class', 'radarLegend clearfix')

      //Create each entry for each overlay on the chart, append its label as a <p> tag
      //Add click event listener to hide the overlay that corresponds to each legend item
      legendContainer
        .selectAll('.radarLegend-item')
        .data(settings.data.categories)
        .enter()
        .append('div')
          .attr('class', 'radarLegend-item clearfix')
          .on('click', function(_, index){
            $('#overlay-index-' + index).toggleClass('hiddenOverlay');
            $(this).find('.radarLegend-title').children('button').toggleClass('hiddenButton');
          })
          .attr('style', function(){
            return 'width: ' + (100 / settings.data.categories.length) + '%;';
          })
          .append('p')
            .append('span')
              .text(function(text){return text})
              .attr('class', 'radarLegend-title')

      //Create a button matching the color of each overlay with the corresponding label
      legendContainer
        .selectAll('.radarLegend-title')
          .data(settings.colors)
          .append('button')
          .attr('style', function(color){ return 'background: ' + color + ';'})
    }

    function render() {
      console.log('rendering')
      drawSpokes();
      drawWebbing();
      drawLabels();
      drawOverlays();
      drawLegend();
    }

    render();
  };

  $.fn.flipogram.defaults = {
    // an empty graph
    data: {
      values: [],
      labels: [1,2,3,4,5,6,7,8,9,10,11,12],
      categories: []
    },
    colors: ["#87ceeb", "#fcd72a", "#ce0058", "#70c176"],
    margin: 0.7,
    ringsCount: 5,
    width: 825,
    height: 600
  }

}( jQuery ));
