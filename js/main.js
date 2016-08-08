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

    // color scheme for source ip's choroplet
    var choropleth_source = d3.scale.quantize()
                                .range(["rgb(199,233,192)", "rgb(161,217,155)",
                                "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);

    // color scheme for target ip's choroplet
    var choropleth_target = d3.scale.quantize()
                                .range(["rgb(252,187,161)", "rgb(252,146,114)", 
                                    "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);
    
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

    // Zdrojove IP adresy / utocnici
    var source = [];
    // Cilove IP adresy / obeti
    var target = {};
    // Vsechny udalosti
    

    var events = d3.json("data/Events500.txt", function(error, events) {
        // console.log(events);

        // ----------- sources --------------------------------------
        for (var i = 0; i < events.length; i++) {
            source_country = events[i].source.country;

            // to improve
            var included = false;
            for (var j = 0; j < source.length; j++) {
                if (source[j].country == source_country) {
                    included = true;
                    break;
                }
            }

            if (!included) {
                var new_entry = {};
                new_entry.country = source_country;
                new_entry.count = 1;
                source.push(new_entry);

            } else {
                // jQuery fnc
                var res = $.grep(source, function(e) { return e.country == source_country; });
                res[0].count++;
            }

        }

        choropleth_source.domain([
                            d3.min(source, function(d) { return d.count; }),
                            d3.max(source, function(d) { return d.count; })
            ]);

        // ---------- targets ----------------------------------------
        for (var i = 0; i < events.length; i++) {
            
        }



        return events;
    });

    d3.json("data/world-50m-id.json", function(error, json) {
        if (error) return console.error(error);

        g.selectAll("path")
                        .data(topojson.feature(json, json.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("id", function(d) {
                            return d.id;
                        })
                        .style("fill", function(d) {
                            var result = $.grep(source, function(e){ return e.country == d.id; });
                            if (result.length > 0) {
                                console.log(result[0].count);
                                return choropleth_source(result[0].count);
                            }
                            return "#ccc";
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
