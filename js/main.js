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
        translate = [width/2, height/2],
        active = d3.select(null),
        menu_height = 185,
        transform = ""
        blockTransform = false;
        // active_d = d3.select(null);

    var data = [];
    var countryNames;

    var svg;

    // ---------- MAP -------------

    var projection = d3.geo.mercator()
                            .scale(width/7)
                            .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);

    // ---------- SUNBURST -------------
    
    var formatNumber = d3.format(",d");

    var x = d3.scale.linear()
                        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
                        .range([0, radius]);

    var radius = Math.min((height - menu_height)/2 * 0.6, width/2 * 0.6);                   // Math.min(width, height) / 4
    var sunburst_radius = radius * radius * 2;

    var totalSize = 0;                  // Total size of all segments

    var partition = d3.layout.partition()
                        .size([2 * Math.PI, sunburst_radius])
                        .value(function(d) { return d.size; });

    var arc = d3.svg.arc()
                        .startAngle(function(d) { return d.x; })
                        .endAngle(function(d) { return d.x + d.dx; })
                        .innerRadius(function(d) { return Math.sqrt(d.y); })
                        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy) - 2; });


    // ------------- BEHAVIOUR --------------

    var drag = d3.behavior.drag()
                            .origin(function() { return {x: rotate[0], y: -rotate[1]}; })
                            .on("drag", function() {

                                if (!blockTransform) {
                                // rotate[0] += d3.event.x / 2;
                                // console.log(d3.event.x)
                                rotate[0] = d3.event.x;
                                translate[0] = width/2;

                                // translate[1] = height/2 + d3.event.y;
                                translate[1] += d3.event.y;
                                if (translate[1] > height) {
                                    translate[1] = height;
                                }
                                if (translate[1] < 0) {
                                    translate[1] = 0;
                                }
                                
                                projection.rotate(rotate).translate(translate);
                                path = d3.geo.path().projection(projection);

                                d3.selectAll("path")
                                            // .transition()
                                            // .delay(1000)
                                            // .duration(750)
                                            .attr("d", path);

                                        }

                            });  

    var zoom = d3.behavior.zoom()
                            .scaleExtent([1, 10])
                            .on("zoom", zoomed);

    // ------------- FLAGS --------------
    var sunburstFlag = false,
        focusFlag = false,
        countryAttacksFlag = false;

    var countryDetail;

    // ------------- SVG --------------

    svg = d3.select("body").append("svg")
                                .attr("id", "svg")
                            // .attr("width", width)
                            // .attr("height", height)
                            // .attr("preserveAspectRatio", "xMinYMin meet")
                            .attr("viewBox", "0 0 " + width + " " + height)
                            // .classed("svg-content-responsive", true)
                            //.on("click", reset)
                            // .call(drag)
                            // .call(zoom);
                            // 

    var g = svg.append("g")
                            .attr("id", "map_wrap")
                            .style("stroke-width", "1px")
                            .call(zoom)
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null)
                    .call(drag);

    g.append("rect").attr("width", "100%")
                    .attr("height", "100%")
                    .attr("opacity", "0")
                    

                      // .style("stroke-width", "2px").style("stroke", "black")

    var curves = svg.append("g")
                            .attr("class", "curves");
                            
    var sunburst_wrap = svg.append("g")                    
                            .attr("id", "sunburst_wrap")
                            .attr("transform", "translate(" + width/2 + "," + ((height - menu_height)/2) + ")");

    var sunburst;

    // ---------- COLOR SCHEMES -------------

    // color scheme for source ip's choroplet
    var choropleth_source = d3.scale.quantize()
                                .range(["rgb(199,233,192)", "rgb(161,217,155)",
                                "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);

    // color scheme for target ip's choroplet
    var choropleth_target = d3.scale.quantize()
                                .range(["rgb(252,187,161)", "rgb(252,146,114)", 
                                    "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);

    // color scheme for sunburst
    var color = d3.scale.category20c()
                                .domain(100);
    
    var defs = svg.append("defs")
    var pattern = defs.append("pattern")
            .attr({ id:"stripes", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(45)"})
     
     pattern.append("rect")
            .attr({ id:"color_a", width:"3", height:"6", transform:"translate(0,0)", fill:"#88AAEE" })
     pattern.append("rect")
            .attr({ id: "color_b", width:"3", height:"6", transform:"translate(3,0)", fill:"#000000" })
  

    // -------------------------------------------------------------------------

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
                                    d3.select(this).classed("attacker", true);
                                    return choropleth_source(result[0].attacked_sb);
                                }
                            }
                        })
                        // .style("fill-opacity", 0.8)
                        .attr("class", "country-boundary")
                        .on("click", clicked)
                        .on("contextmenu", rightclicked)
                        // .call(zoom)
                        // .on("mousedown.zoom", null)
                        // .on("touchstart.zoom", null)
                        // .on("touchmove.zoom", null)
                        // .on("touchend.zoom", null)
                        // .call(drag);
                        // .call(drag);



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

            // initFocus();
        })


        // zoomOn

    });

    
    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                    User Interactivity Functions                     //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    

    function clicked(d) {
        
        if (countryAttacksFlag && countryDetail == d.id) {
            unfocus();
            showChoroplet();
            countryAttacksFlag = false;
            countryDetail = "";
            return;
        }
        
        removeSunburst();
        if (active.node() === this) return unfocus();
        unfocus();

        active.classed("active", false);
        
        var activePath = d3.select("#" + d.id);
        if (!activePath.classed("victim") && !activePath.classed("attacker")) {     // or
            return;
        } 
        active = d3.select(this).classed("active", true);

        var res = $.grep(data, function(e) { return e.country == d.id});
        countryOfInterest = res[0];
        countryDetail = d.id;
        // --------------------------------------------------

        var participants = [];
        if (GeoMenu.getDisplayIP() == "source") {
            countryOfInterest.targets.countries.forEach(function(e) {
                participants.push(e.code);
            })
        } else {

            countryOfInterest.sources.countries.forEach(function(e) {
                participants.push(e.code);
            })
        }


        // --------------------------------------------------- Vytvor na to jednu funkci
        
        if (GeoMenu.getDisplayIP() == "source") {
            d3.selectAll(".attacker")
                                    .filter(function(e) { return e.id != d.id; })
                                    .classed("attacker", false)
                                    .style("fill", "#ccc");
    
            participants.forEach(function(e) {
                selected = d3.select("#" + e)
                                        .filter(function(e) { return e.id != d.id; })
                                        .classed("involved_victims", true)
                                        .style("fill", function(e) {
                                            result = $.grep(data, function(a) { return a.country == e.id; })
                                            if (result.length > 0) {
                                                    return choropleth_target(result[0].was_attacked);
                                            }
                                        })

            })
    
        } else {
            d3.selectAll(".victim")
                                    .filter(function(e) { return e.id != d.id; })
                                    .classed("victim", false)
                                    .style("fill", "#ccc");
        
                participants.forEach(function(e) {
                    selected = d3.select("#" + e)
                                        .filter(function(e) { return e.id != d.id; })
                                        .classed("involved_attacker", true)
                                        .style("fill", function(e) {
                                            result = $.grep(data, function(a) { return a.country == e.id; })
                                            if (result.length > 0) {
                                                    return choropleth_source(result[0].attacked_sb);
                                            }
                                        })
            })
        }

        if (($.grep(participants, function(e) { return e == d.id })).length > 0) {

            d3.select("#color_a").attr("fill", function(a) {
                result = $.grep(data, function(a) { return a.country == d.id; })
                return choropleth_source(countryOfInterest.attacked_sb);
            })

            d3.select("#color_b").attr("fill", function(a) {
                result = $.grep(data, function(a) { return a.country == d.id; })
                return choropleth_target(countryOfInterest.was_attacked);
            })

            active.style("fill", "url(#stripes)");
        }

        countryAttacksFlag = true;
    }
    
    function rightclicked(d) {
        d3.event.preventDefault();

        // in case there is no data for clicked country, return
        if (($.grep(data, function(e) { return e.country == d.id; })).length == 0) return;

        if (active.node() === this && d3.selectAll("#sunburst")[0].length == 1) {
            removeSunburst();
            unfocus();
            return;
        }
        removeSunburst();
        
        active.classed("active", false);
        active = d3.select(this).classed("active", true);
        
        createSunburst(d);
        focusOnCountry(d);
    }
    
    d3.select(window).on('resize', function() {
        width = $(window).width();
        height = $(window).height();
    });


    function displayTheWorld() {
        blockTransform = false;
        if (countryAttacksFlag) {
            showChoroplet();
            countryAttacksFlag = false;
            countryDetail = "";
        }

        active.classed("active", false);
        active = d3.select(null);
        
        transform = "";
        zoom.scale(1);
        zoom.translate([0, 0]);


        g.transition()
            .duration(750)
            .style("stroke-width", "1.5px")
            .attr("transform", transform);

        removeSunburst();
        // d3.selectAll("#sunburst").remove();
    }

    function initFocus() {
        
        var xMin = width,
            xMax = 0, 
            yMin = height, 
            yMax = 0,
            left, right, top, bottom,
            dx, dy, x, y;

        activeCountries = d3.selectAll(".country-boundary")
                                    .filter(function(d) {
                                        var result = $.grep(data, function(e){ return e.country == d.id; });
                                        if (result.length > 0 && GeoMenu.getDisplayIP() == "source") {
                                            return result[0].attacked_sb != 0;
                                        } else if (result.length > 0 && GeoMenu.getDisplayIP() == "target") {
                                            return result[0].was_attacked != 0;
                                        } else return false;
                                    }).each(function(d) {
                                        var bounds = path.bounds(d);
                                        // console.log(d.id);
                                        // console.log(bounds);
                                        if (bounds[0][0] < xMin) {  // left  
                                            xMin = bounds[0][0];
                                            left = d.id;
                                        }
                                        if (bounds[1][0] > xMax) {  // right  
                                            xMax = bounds[1][0];
                                            right = d.id;
                                        }
                                        if (bounds[0][1] < yMin) {  // top  
                                            yMin = bounds[0][1];
                                            top = d.id;
                                        }
                                        if (bounds[1][1] > yMax) {  // bottom  
                                            yMax = bounds[1][1];
                                            bottom = d.id;
                                        }
                                    })

        // console.log(xMin, xMax, yMin, yMax);
        // console.log(left, right, top, bottom);
       
        dx = xMax - xMin,       // right - left
        dy = yMax - yMin,       // bottom - top
        x = (xMax - xMin) / 2;  // (left - rigth) / 2
        if (yMin < 0) {
            y = yMax/2;
        } else {
            y = (yMin + yMax) / 2;  // (top - bottom) / 2
        }
        // console.log(dx, dy, x, y);


        scale = 1 / Math.max(dx / width, dy / (height - menu_height)),
        translate = [width / 2 - scale * x, height / 2 - scale * y]
        // console.log(scale, translate);

        g.transition()
                    .duration(750)
                    .style("stroke-width", 1.5 / scale + "px")
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        zoom.scale(scale);
        zoom.translate(translate);
    }

    function focusOnCountry(d) {
        blockTransform = true;

        // active.classed("active", false);
        // active = d3.select(this).classed("active", true);

        // Zoom on a clicked country
        var bounds = path.bounds(d),                // [[left, top], [right, bottom]]
            dx = bounds[1][0] - bounds[0][0],       // right - left
            dy = bounds[1][1] - bounds[0][1],       // bottom - top
            x = (bounds[0][0] + bounds[1][0]) / 2,  // (left - rigth) / 2
            y = (bounds[0][1] + bounds[1][1]) / 2,  // (top - bottom) / 2
            scale = .9 / Math.max(dx / width, dy / (height - menu_height)),
            translate = [width / 2 - scale * x, height / 2 - scale * y - menu_height / 2];
        console.log(scale, translate);
            

        // zoom.scale(scale);
        // zoom.translate(translate);

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

    // Reset to the last user transformation
    function unfocus() {
        blockTransform = false;

        active.classed("active", false);
        active = d3.select(null);

        g.transition()
            .duration(750)
            .style("stroke-width", "1.5px")
            .attr("transform", transform);
    };

    

    function zoomed() {
        if (!blockTransform) {
            transform = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
            // console.log(d3.select("#map_wrap").attr("transform"));
            // console.log(transform);
            g.attr("transform", transform);
        }
    };

    function sunburstClicked(d) {
        switch(d.depth) {
/*
        //     case 1:     // country
        //     case 2:     // attack type

        //         // d3.selectAll(".sunburst_strip").on("mouseover", null);
        //         var curr_children = d3.selectAll(".sunburst_strip")
        //                             .filter(function(a) {
        //                                 return (a.parent == d);
        //                             })
        //                             .on("mouseover", null);
        //         // d3.selectAll(".sunburst_strip")
        //         //                     .filter(function(a) {
        //         //                         return (a.parent == d);
        //         //                     })
        //         //                     .on("mouseover", null)
        //                             // .classed("invisible_strip", false);
        //         curr_children.style("visibility", "");

        //         curr_children.each("end", function() {
        //                                 d3.select(this).on("mouseover", sunburstMouseover)
        //                             });

        //         // d3.selectAll(".sunburst_strip").on("mouseover", sunburstMouseover);

        //         break;
*/
            case 3:     // ip
                console.log("Open event " + d.event_id);
                // console.log(d.event_id);


                break; 
        }

    }

    function sunburstMouseover(d) {

        var sequence = getAncestors(d);
        // console.log(sequence);
        
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

        // Expand the small segments ? 
        // console.log(d.dx, d.dy);
        // if (d.dx < 0.05) {
        //     console.log("dx")
        //     d.dx = 0.05;
        // }
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


    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                    Create Sunburst Visualization                    //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    function removeSunburst() {
        d3.selectAll("#sunburst").remove();
    }

    function createSunburst(d) {

        var clicked_country = ($.grep(data, function(e) { return e.country == d.id; }))[0];
        if (GeoMenu.getDisplayIP() == "source") {
            if (clicked_country.attacked_sb == 0) return;
        } else {
            if (clicked_country.was_attacked == 0) return;
        }

        blockTransform = true;

        sunburst = sunburst_wrap.append("g")
                            .attr("id", "sunburst");

        var result = $.grep(data, function(e) { return e.country == d.id; });
        
        if (result.length == 1) {
            sunburst_data = result[0];
        } else { 
            sunburst_data = null;
            return;
        }

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
                                    return color((d.children ? d : d.parent).name); 
                                })
                                // show only first level
                                // .style("visibility", function(d) {
                                //     if (d.depth != 1) return "hidden";
                                //     return "";
                                // })
                                .style("stroke-width", "1px")
                                .style("stroke", "white")
                                .style("opacity", 0.5)
                                // .classed("invisible_strip", function(d) {
                                //     if (d.depth != 1) return true;
                                //     return false;
                                // })
                                .on("click", sunburstClicked)
                                .on("mouseenter", sunburstMouseover);

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
            root = getSunburstData(d.targets.countries);

        } else {    // target
            root = getSunburstData(d.sources.countries);    // ziskej data o zdrojovych statech

        }

        // console.log(root);

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
                        size    : ip.count,
                        event_id: ip.event_id
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
    

    function showChoroplet() {
        d3.selectAll(".attacker").classed("attacker", false);
                d3.selectAll(".victim").classed("victim", false);

                g.selectAll("path")
                        .style("fill", function(d) {

                            var result;
                            if (GeoMenu.getDisplayIP() == "source") {
                                result = $.grep(data, function(a) { return a.country == d.id; })
                                if (result.length > 0) {
                                    if (result[0].attacked_sb != 0) { 

                                        d3.select(this).classed("attacker", true)
                                                       // .classed("displayed", true);

                                        return choropleth_source(result[0].attacked_sb);
                                    }
                                }
                            } else {
                                result = $.grep(data, function(a){ return a.country == d.id; });
                                if (result.length > 0) {
                                    if (result[0].was_attacked != 0) {

                                        d3.select(this).classed("victim", true)
                                                       // .classed("displayed", true);
                                        
                                        return choropleth_target(result[0].was_attacked);
                                    }
                                }
                            }
                        })
    }

    ///////////////////////////////////////////////////////////////////
    // --------- Event listeners + button functionality --------- // //
    ///////////////////////////////////////////////////////////////////

    $("#geo-menu").on('geomenuUpdate', function(e) {
        switch(e.detail) {
            case 'displayIP':

                showChoroplet();
                
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
        // console.log(data);
        initFocus();
    });

    $('#defaultDisplay').click(function() {
        displayTheWorld();
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
                var r = $.grep(curr_source_type.ips, function(e){ return e.ip == target_ip; });
                if (r.length == 0) {
                    curr_target_ip = createIP(target_ip, event_id);
                    curr_source_type.ips.push(curr_target_ip);
                } else if (r.length == 1) {
                    curr_target_ip = r[0];
                }
                // Update sums 
                curr_target_ip.count++;
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
                
                var r = $.grep(curr_target_type.ips, function(e){ return e.ip == source_ip; });
                if (r.length == 0) {
                    curr_source_ip = createIP(source_ip, event_id);
                    curr_target_type.ips.push(curr_source_ip);
                } else if (r.length == 1) {
                    curr_source_ip = r[0];
                }

                // Update sums 
                curr_source_ip.count++;
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
            event_id : ev_id,
            count    : 0
        }
        return ip;
    }


});


/*
    
    CURVES
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

/*
    Curves

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
