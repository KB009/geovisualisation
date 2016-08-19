/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Zkontroluj jestli neprepisuji event_id


/* global d3 */

$(window).load(function () {
    //canvas resolution
    var width = $(window).width(),
        height = $(window).height(),
        rotate = [0,0],
        active = d3.select(null),
        // active_d = d3.select(null);
        menu_height = 185,
        transform = "",
        radius = 150;   // Math.min(width, height) / 4

    var data = [];

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

    var curves = svg.append("g")
                            .attr("class", "curves");
                            
    var caption;

/*
    // svg.append
    // .attr("stroke", "yellow")
    // .attr("stroke-width", "3px");

    // svg.selectAll('path')
    //                 .data(lineData)
    //                 .enter().append('path')
   // .attr('d', function(d) { return line(d.p); })
   // .attr('stroke-width', function(d) { return d.w; })
   // .attr('stroke', function(d) { return d.c; });

    //The data for our line
    // var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
    //               { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
    //               { "x": 80,  "y": 5},  { "x": 100, "y": 60}];
 
    //  //This is the accessor function we talked about above
    //  var lineFunction = d3.svg.line()
    //                           .x(function(d) { return d.x; })
    //                           .y(function(d) { return d.y; })
    //                          .interpolate("");

    // svg.append("path")
    //             .attr("d", lineFunction(lineData))
    //             .attr("stroke", "blue")
    //             .attr("stroke-width", 2)
    //             .attr("fill", "none");
*/

    var countryNames;


    // Vsechny udalosti
    var events = d3.json("data/Events500.txt", function(error, events) {

        readData(events);

        choropleth_source.domain([
                            d3.min(data, function(d) { return d.attacked_sb; }),
                            d3.max(data, function(d) { return d.attacked_sb; })
            ]);

        choropleth_target.domain([
                            d3.min(data, function(d) { return d.was_attacked; }),
                            d3.max(data, function(d) { return d.was_attacked; })
            ]);

        return events;
    });

    function getCountryNames(callback) {
        countryNames = d3.json("data/countries.json", function(error, json) {
            if (error) return console.error(error);
            // console.log("INSIDE");
            // console.log(json["A1"]);

            callback(json);

        // ``  console.log("H " +  json['A1']);
            return json;

        });
    }

    d3.json("data/world-50m-id.json", function(error, json) {
        if (error) return console.error(error);

        // countryNames = d3.json("data/countries.json", function(error, json) {
        //     if (error) return console.error(error);
        //     console.log("INSIDE");
        //     console.log(json);

        // // ``  console.log("H " +  json['A1']);
        //     return json;

        // });


        getCountryNames(function(names) {

            g.selectAll("path")
                        .data(topojson.feature(json, json.objects.countries).features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("id", function(d) {
                            return d.id;
                        })
                        .style("fill", function(d) {
                            var result = $.grep(data, function(e){ return e.country == d.id; });
                            if (result.length > 0) {
                                if (result[0].attacked_sb != 0) { 
                                    return choropleth_source(result[0].attacked_sb);
                                }
                            }
                        })
                        .attr("class", "coutry-boundary")
                        .on("click", clicked)
                        .on("contextmenu", rightclicked);


            g.selectAll("text")
                            .data(topojson.feature(json, json.objects.countries).features)
                            .enter()
                            .append("text")
                            .text(function(d) {
                                return names[String(d.id)];
                            })
                            .attr("x", function(d) {
                                return path.centroid(d)[0];
                            })
                            .attr("y", function(d) {
                                return path.centroid(d)[1];
                            })
                            .attr("text-anchor", "middle")
                            .attr("font-size", "6pt")
                            .attr("font-family", "sans-serif")
                            .attr("visibility", "hidden");



/*
            var line = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                // .x(function(d) { return path.centroid(d)[0]; })
                // .y(function(d) { return path.centroid(d)[1]; })
                .curve(d3.curveBasis);

            var lineData = [
                        {x: 300, y: 500},
                        {x: 800, y: 300},
                        {x: 1300, y: 500}
                        ]
            

            curves.selectAll("path")
                            .data([1])
                                    // .data(lineData)
                            .enter()
                            .append("path")
                            .attr("class", "curves")
                            .attr("d", function(d) { 
                                return line(lineData); 

                            })
                            // .attr("x", function(d) {
                            //     return path.centroid(d)[0];
                            // })
                            // .attr("y", function(d) {
                            //     return path.centroid(d)[1];
                            // })
                            .style("stroke-width", "2px")
                            .style("stroke", "black")
                            .style("fill", "none");
*/                                    

        })
 
        
    });

    


    
    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                    User Interactivity Functions                     //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    
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

    
    function rightclicked(d) {
        createSunburst(d);
    }

    function sunburstClicked(d) {
        console.log(d, d.parent);
    }

    function sunburstMouseover(d) {

        var sequence = getAncestors(d);
        console.log(sequence);
        
        showCaption(sequence);

        // Fade all the segments
        d3.selectAll(".sunburst_strip")
                                .style("opacity", 0.3);

        // Highlight only those that are an ancestor of the current segment.
        d3.selectAll(".sunburst_strip")
                                .filter(function(a) {
                                    return (sequence.indexOf(a) >= 0);
                                  })
                                .style("opacity", 1);

        d3.selectAll(".caption").style("visibility", "");
    }

    function sunburstMouseleave(d) {
        d3.selectAll(".caption").style("visibility", "hidden");
        d3.selectAll(".sunburst_strip").style("opacity", 1)

    }

    function showCaption(sequence) {
        // sequence.forEach(function(e) {
            // console.log(e.name);
            if (sequence[0]) d3.select("#caption_country").text(sequence[0].name);
            if (sequence[1]) {
                d3.select("#caption_type").text(sequence[1].name);
            } else {
                d3.select("#caption_type").text("");
            }
            if (sequence[2]) {
                d3.select("#caption_ip").text(sequence[2].name);
            } else {
                d3.select("#caption_ip").text("");
            }
        // })
    }

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
    function getAncestors(node) {
      var path = [];
      var current = node;
      while (current.parent) {
        path.unshift(current);
        current = current.parent;
      }
      return path;
    }

    // jbostok
    function initializeBreadcrumbTrail() {
      // Add the svg area.
      var trail = d3.select("#sequence").append("svg:svg")
          .attr("width", width)
          .attr("height", 50)
          .attr("id", "trail");
      // Add the label at the end, for the percentage.
      trail.append("svg:text")
        .attr("id", "endlabel")
        .style("fill", "#000");
    }


    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                    Create Sunburst Visualization                    //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    function createSunburst(d) {
        var sunburst = svg.append("g")                    
                            .attr("class", "sunburst")
                            .attr("transform", "translate(" + width/2 + "," + (height/2) + ")");

        var formatNumber = d3.format(",d");

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c()
                                .domain(20);
        // Total size of all segments; we set this later, after loading the data.
        var totalSize = 0;

        var sunburst_radius = radius * radius * 2;
        var partition = d3.layout.partition()
                            .size([2 * Math.PI, sunburst_radius])
                            // .size([2 * Math.PI, 100])
                            .value(function(d) { return d.size; });

        var arc = d3.svg.arc()
            // .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            // .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            // .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            // .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy) - 2; });

        d3.event.preventDefault();

        var result = $.grep(data, function(e) { return e.country == d.id; });
        
        if (result.length == 1) {
            sunburst_data = result[0];
        } else { 
            sunburst_data = null;
            return;
        }
        // console.log(sunburst_data); 

        var hierarchy = buildHierarchy(sunburst_data);
        // console.log("hierarchy");
        // console.log(hierarchy);

        var nodes = partition.nodes(hierarchy);
        // console.log("nodes");
        // console.log(nodes);
        sunburst.append("circle")
                                .attr("id", "sunburst_circle")
                                .attr("r", radius * 1.45)
                                .attr("fill", "white")
                                .on("mouseleave", sunburstMouseleave);

        var sunburst_paths = sunburst.selectAll("path")
                                .data(nodes)
                                .enter()
                                .append("path")
                                .attr("class", "sunburst_strip")
                                .attr("display", function(d) { return d.depth ? null : "none"; })
                                .attr("d", arc)
                                .style("fill", function(d) {
                                    // if (!d.depth) return "white";
                                    return color((d.children ? d : d.parent).name); 
                                })
                                .style("stroke-width", "1px")
                                .style("stroke", "white")
                                .style("opacity", 0.5)
                                .on("click", sunburstClicked)
                                .on("mouseover", sunburstMouseover);

        sunburst.append("text")
                                .attr("id", "caption_country")
                                .attr("class", "caption")
                                .attr("dy", -40);

        sunburst.append("text")
                                .attr("id", "caption_type")
                                .attr("class", "caption")
                                .attr("dy", -10);
        
        sunburst.append("text")
                                .attr("id", "caption_ip")
                                .attr("class", "caption")
                                .attr("dy", 35);


        totalSize = sunburst_paths.node().__data__.value;

    }

    function buildHierarchy(d) {
        
        var root;

        if (GeoMenu.getDisplayIP() == "source") {
            root = getSunburstData(d.sources.countries);

        } else {    // target
            root = getSunburstData(d.targets.countries);

        }

        console.log(root);

        return root;
    }

    function getSunburstData(countries) {

        var root = {
            name: "root",
            children: []
        };

        countries.forEach(function(country) { 

            new_country_child = {
                name     : country.code,
                // size :
                children : []   // attack types
            }

            country.attack_types.forEach(function(type) {

                new_attack_child = { 
                    name     : type.type_id,
                    size     : type.count,
                    children : []   // ip + event_id
                }

                type.ips.forEach(function(ip) {

                    new_ip = {
                        name    : ip.ip,
                        size    : 1
                    }

                    new_attack_child.children.push(new_ip);
                });

                new_country_child.children.push(new_attack_child);
            });

            root.children.push(new_country_child);
        })

        return root;
    }
    // --------------------------------------------------------------------------------
    

    ///////////////////////////////////////////////////////////////////
    // --------- Event listeners + button functionality --------- // //
    ///////////////////////////////////////////////////////////////////

    $("#geo-menu").on('geomenuUpdate', function(e) {
        switch(e.detail) {
            case 'displayIP':

                g.selectAll("path")
                        .style("fill", function(d) {
                            var result;

                            if (GeoMenu.getDisplayIP() == "source") {
                                result = $.grep(data, function(e) { return e.country == d.id; })
                                if (result.length > 0) {
                                    if (result[0].attacked_sb != 0) { 
                                        return choropleth_source(result[0].attacked_sb);
                                    }
                                }
                            } else {
                                result = $.grep(data, function(e){ return e.country == d.id; });
                                if (result.length > 0) {
                                    if (result[0].was_attacked != 0) {
                                        return choropleth_target(result[0].was_attacked);
                                    }
                                }
                            }
                        })
                break;

            case 'showNames':

                console.log("Show names: ");
                g.selectAll("text")
                    .attr("visibility", function(d) {
                        if (GeoMenu.getDisplayCountryNames()) {
                            return "visible";
                        } else {
                            return "hidden";
                        }
                    })

                break;
            case 'showAttacks':

                break;
        }
    });

    $('#assignUnknown').click(function() {

    });

    $('#defaultDisplay').click(function() {
        transform = "";
        reset();
    });


    ///////////////////////////////////////////////////////////////
    // ------------------- DATA PREPROCESS --------------------- //
    ///////////////////////////////////////////////////////////////

    function readData(events) {

        // GET SOURCES
        for (var i = 0; i < events.length; i++) {
            var event_id = events[i].id;
            var source_ip = events[i].source.ip;
            var source_state = events[i].source.country;
            var type = events[i].type;

            // Get global data of source state
            var r = $.grep(data, function(e){ return e.country == source_state; });

            // create new overview data for the source_state
            if (r.length == 0) {
                var curr_source_data = createCountryOverviewData(source_state);
                data.push(curr_source_data);

            // get data for the source_state
            } else if (r.length == 1) {
                curr_source_data = r[0];
            } 

            // GET TARGETS
            for (var j = 0; j < events[i].targets.length; j++) {
                var target_ip = events[i].targets[j].ip;
                var target_state = events[i].targets[j].country;

                // ----------- NEW ENTRY FOR THE SOURCE STATE -------------

                // Get the target state
                r = $.grep(curr_source_data.targets.countries, function(e){ return e.code == target_state; });
                if (r.length == 0) {
                    curr_attacked_state = createInvolvedCountry(target_state);
                    curr_source_data.targets.countries.push(curr_attacked_state);
                } else if (r.length == 1) {
                    curr_attacked_state = r[0];
                }
                
                // Get the attack type
                var r = $.grep(curr_attacked_state.attack_types, function(e){ return e.type_id == type; });
                if (r.length == 0) {
                    curr_source_type = createType(type);
                    curr_attacked_state.attack_types.push(curr_source_type);
                } else if (r.length == 1) {
                    curr_source_type = r[0];
                }

                // Add IP addr
                var new_target_ip = createIP(target_ip, event_id);
                curr_source_type.ips.push(new_target_ip);

                // Update sums 
                curr_source_data.attacked_sb++;
                curr_source_type.count++;


                // ----------- NEW ENTRY FOR THE TARGET STATE -------------
                 
                // Get global data of target state
                
                var r = $.grep(data, function(e){ return e.country == target_state; });
                if (r.length == 0) {
                    curr_target_data = createCountryOverviewData(target_state);
                    data.push(curr_target_data);
                } else if (r.length == 1) {
                    curr_target_data = r[0];
                } 

                // Get corresponding attacking state
                r = $.grep(curr_target_data.sources.countries, function(e){ return e.code == source_state; });
                if (r.length == 0) {
                    curr_attacking_state = createInvolvedCountry(source_state);
                    curr_target_data.sources.countries.push(curr_attacking_state);
                } else if (r.length == 0) {
                    curr_attacking_state = r[0];
                }

                // Get corresponding attack type
                r = $.grep(curr_attacking_state.attack_types, function(e){ return e.type_id == type; });
                if (r.length == 0) {
                    curr_target_type = createType(type);
                    curr_attacking_state.attack_types.push(curr_target_type);
                } else if (r.length == 1) {
                    curr_target_type = r[0];
                }
                
                // Add IP addr
                new_source_ip = createIP(source_ip, event_id);
                curr_target_type.ips.push(new_source_ip);

                // Update sums
                curr_target_data.was_attacked++;
                curr_target_type.count++;
 
            }
        }
        console.log(data);
    }

    function createCountryOverviewData(state_code) {
        var new_country_overview = {
            country       : state_code,
            attacked_sb   : 0,      // kolikrat utocil na nekoho
            was_attacked  : 0,      // kolikrat na nej bylo utoceno
            sources: {              // zdrojove staty, ktere nan utocili
                countries: []
            },
            targets: {              // cilove staty / na ktere utoci
                countries: []
            }
        }
        return new_country_overview;
    }

    function createInvolvedCountry(state_code) {
        var new_involved_country = {
            code         : state_code,
            attack_types : []
        }
        return new_involved_country;
    }

    function createType(type) {
        var new_type = {
            type_id  : type,
            count    : 0,
            ips      : []
        }
        return new_type;
    }

    function createIP(ip_addr, ev_id) {
        var ip = {
            ip       : ip_addr,
            event_id : ev_id
        }
        return ip;
    }


});
