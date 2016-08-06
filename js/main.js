/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3 */

$(window).load(function () {
    //canvas resolution
    var width = $(window).width(),
        height = $(window).height(),
        rotate = [0,0],
        active = d3.select(null);
        // active_d = d3.select(null);
        menu_height = 185;
        transform = "";
        

    var projection = d3.geo.mercator()
                            .scale(width/7)
                            .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);
    
    var drag = d3.behavior.drag()
                            .origin(function() { return {x: rotate[0], y: -rotate[1]}; })
                            .on("drag", function() {

                                rotate[0] = d3.event.x;
                                projection.rotate(rotate);
                                path = d3.geo.path().projection(projection);

                                d3.selectAll("path").attr("d", path);

                            });  

    var zoom = d3.behavior.zoom()
                            .scaleExtent([0.5, 10])
                            .on("zoom", zoomed);

    var svg = d3.select("body").append("svg")
                            // .attr("width", width)
                            // .attr("height", height)
                            // .attr("preserveAspectRatio", "xMinYMin meet")
                            .attr("viewBox", "0 0 " + width + " " + height)
                            // .classed("svg-content-responsive", true)
                            //.on("click", reset)
                            .call(drag)
                            .call(zoom);
    
    

    var g = svg.append("g")
                            .attr("id", "map_wrap")
                            .style("stroke-width", "1px");

    
    events = d3.json("data/Events-few.txt", function(error, events) {
        console.log(events);
        return events;
    });

    d3.json("data/world-50m-id.json", function(error, uk) {
        if (error) return console.error(error);

        g.selectAll("path")
                        .data(topojson.feature(uk, uk.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("id", function(d) {
                            return d.id;
                        })
                        .attr("class", "coutry-boundary")
                        .on("click", clicked);
    });

    function clicked(d) {
        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);
        // active_d = d;

        // Zoom on a clicked country
        var bounds = path.bounds(d),                // [[left, top], [right, bottom]]
            dx = bounds[1][0] - bounds[0][0],       // right - left
            dy = bounds[1][1] - bounds[0][1],       // bottom - top
            x = (bounds[0][0] + bounds[1][0]) / 2,  // (left - rigth) / 2
            y = (bounds[0][1] + bounds[1][1]) / 2,  // (top - bottom) / 2
            scale = .9 / Math.max(dx / width, dy / (height - menu_height)),
            translate = [width / 2 - scale * x, height / 2 - scale * y - menu_height / 2];
            
        var g_width = document.getElementById("map_wrap").getBBox().width;
        // console.log("Country bb: " + dx + " map_wrap bb: " + 0.9 * g_width);
        // console.log("Bound box: " + dx + " right: " + bounds[1][0] + " left: " + bounds[0][0]);
          // console.log("right " + bounds[1][0] + " inverted: " + projection.invert([bounds[1][0], bounds[0][1]]));
          // console.log("left " + bounds[0][0] + " inverted: " + projection.invert([bounds[0][0], bounds[0][1]] ));

        g.transition()
                    .duration(750)
                    .style("stroke-width", 1.5 / scale + "px")
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }
    
    d3.select(window).on('resize', function() {
        width = $(window).width();
        height = $(window).height();
    });

    // Go to default display / the whole world
    function reset() {
        active.classed("active", false);
        active = d3.select(null);
        active_d = d3.select(null);

        g.transition()
            .duration(750)
            .style("stroke-width", "1.5px")
            .attr("transform", transform);
    };

    function zoomed() {
        transform = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
        g.attr("transform", transform);
    };
    
/*
// canvas resolution
  var width = $(window).width() - 20,
      height = $(window).height() - 20;
 
  // projection-settings for mercator    
var projection = d3.geo.albers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(6000)
    .translate([width / 2, height / 2]);
 
  // defines "svg" as data type and "make canvas" command
  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);
 
  // defines "path" as return of geographic features
  var path = d3.geo.path()
      .projection(projection);
 
  // group the svg layers 
  var g = svg.append("g");
 
  // load data and display the map on the canvas with country geometries 
  d3.json("data/world.json", function(error, world) {
  if (error) return console.error(error);
  console.log(world);
  

  svg.append("path")
      .datum(topojson.feature(world, world.objects.places))
      .attr("d", d3.geo.path().projection(d3.geo.mercator()));
//});
 
  svg.selectAll(".subunit")
    .data(topojson.feature(world, world.objects.unit))
  .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .attr("d", path);  
});*/

});
