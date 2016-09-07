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
    var attackTypes = [];
    var countryNames;

    var unknownAssignedTo = "";

    var svg;

    // ---------- MAP -------------
    var projection = d3.geo.mercator()
                            .scale(width/7)
                            .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);

    var lineFunction = d3.line()
                      .curve(d3.curveBasis)
                      .x(function(d) { return (d.x); })
                      .y(function(d) { return (d.y); });

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

    // on ESC, cancel the view 
    d3.select("body").on("keydown", function() {
                                    if (d3.event.keyCode == 27) { // Esc
                                        removeSunburst();
                                        showChoropleth();
                                        unfocus();
                                    }
                                })

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
                            // .classed("svg-content-responsive", true)
                            .attr("viewBox", "0 0 " + width + " " + height);

    var g = svg.append("g")
                        .attr("id", "map_wrap")
                        .style("stroke-width", "1px")
                        .call(drag)
                        .call(zoom)
                        .on({ "mousedown.zoom" : null, "touchstart.zoom": null,
                            "touchmove.zoom" : null, "touchend.zoom"  : null });

    g.append("rect").attr({ "width"  : "100%", "height" : "100%", "opacity": 0 });

    var lan = svg.append("g").attr({ "id" : "lanBubble" });

    var curves = svg.append("g").attr("class", "curves");
                            
    var sunburst_wrap = svg.append("g")                    
                            .attr("id", "sunburst_wrap")
                            .attr("transform", "translate(" + width/2 + "," + ((height - menu_height)/2) + ")");

    var sunburst;

    // ---------- COLOR SCHEMES + PATTERN -------------

    // color scheme for source ip's choroplet
    var choropleth_source = d3.scale.quantize()
                                .range(["rgb(199,233,192)", "rgb(161,217,155)",
                                "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);

    // color scheme for target ip's choroplet
    var choropleth_target = d3.scale.quantize()
                                .range(["rgb(252,187,161)", "rgb(252,146,114)", 
                                    "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);

    // color scheme for sunburst
    var color = d3.scale.category20c().domain(100);
    
    // striped pattern 
    var defs = svg.append("defs")
    var pattern = defs.append("pattern")
            .attr({ id:"stripes", width:"6", height:"6", patternUnits:"userSpaceOnUse", patternTransform:"rotate(45)"}) 
    pattern.append("rect")
            .attr({ id:"color_a", width:"3", height:"6", transform:"translate(0,0)", fill:"#88AAEE" })
    pattern.append("rect")
            .attr({ id: "color_b", width:"3", height:"6", transform:"translate(3,0)", fill:"#000000" })
  
    // ---------- LEGEND -------------
    var legend = svg.append("g")
                            .attr("id", "legend");
    legend.selectAll("rect")
                        .data(d3.range(5))
                        .enter()
                        .append("rect")
                        .attr({
                            "x" : function(d) { return width - (220 - d * 35); },
                            "y" : function(d) { return height - menu_height - 50; },
                            "width" : 35,
                            "height": 20
                        })
                        .style({ 
                            "fill" : function(d) { return choropleth_source.range()[d]; },
                            "stroke-width" : "1px",
                            "stroke" : "white"

                        })

    var legendMin = legend.append("text")
                        .attr({
                            "x" : function(d) { return width - (220); },
                            "y" : function(d) { return height - menu_height - 60; }
                        })
                        .style({
                            "text-anchor" : "start",
                            "font-size"   : "8pt",
                            "font-weight" : "bold",
                            "font-family" : "sans-serif"
                        });

    var legendMax = legend.append("text")
                        .attr({
                            "id": "legend_min",
                            "x" : function(d) { return width - (220 - 5 * 35); },
                            "y" : function(d) { return height - menu_height - 60; }
                        })
                        .style({
                            "text-anchor" : "end",
                            "font-size"   : "8pt",
                            "font-weight" : "bold",
                            "font-family" : "sans-serif"
                        });

    // -------------------------------------------------------------------------

    function initGeoMenu() {
        GeoMenu.setDisplayIP("source");
        GeoMenu.setDisplayCountryNames(false);
        GeoMenu.setShowAttacks(["INSTMSG", "COUNTRY"]);
    }

    // Vsechny udalosti
    var events = d3.json("data/Events500.txt", function(error, events) {

        readData(events);
        initGeoMenu();
        updateChoroplethDomains();

        return events;
    });

    function getCountryNames(callback) {
        countryNames = d3.json("data/countries.json", function(error, json) {
            if (error) return console.error(error);
            callback(json);
            return json;
        });
    }

    d3.json("data/world-50m-id.json", function(error, json) {
        if (error) return console.error(error);

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
                        .attr("class", "country-boundary")
                        .on("click", clicked)
                        .on("contextmenu", rightclicked)

/*      // LAN BUBBLE
            var lanRadius = 70;
            lan.append("circle")
                        // .attr("id", "LAN")
                        // .attr("d", d3.select("#LAN"))
                        .attr({
                            "r": lanRadius,
                            "cx": function() { return lanRadius + 100; },
                            "cy": function() { return height - menu_height - (lanRadius + 100); },
                            // "class" : "country-boundary"
                        })
                        .style({
                            "fill": "#ccc",
                            "stroke-width": "1px",
                            "stroke": "white"
                        })
            lan.append("text")
                        .text("LAN") // "unknown"
                        .attr({
                            "x": function() { return lanRadius + 100; },
                            "y": function() { return height - menu_height - (lanRadius + 88); }, //+95
                            "text-anchor": "middle",
                            "font-size": "25pt" // "18pt"
                        })
                        .style({
                            "fill":"white"
                        })
                        .on("mouserover", function() {
                            // d3.event.preventDefault();
                        })
*/

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

    });

    
    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                 User + Map Interactivity Functions                  //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////
    
    function clicked(d) {
        
        // pokud se jiz zobrazuji obeti/utocnici statu d, ukonci nahled
        if (countryAttacksFlag && countryDetail == d.id) {
            unfocus();
            removeSunburst();
            showChoropleth();
            countryAttacksFlag = false;
            countryDetail = "";
            d3.selectAll(".involved").classed("involved", false);
            
            removeCurves();

            return;
        }
        
        removeSunburst();
        // pokud se zobrazoval sunburst statu d, ukonci nahled i funkci 
        if (active.node() === this) return unfocus();

        unfocus();

        active.classed("active", false);
        
        // pokud se stat d nepodili na zadne udalosti, neni zobrazovat jaka data > ukonci funkci
        if (!d3.select(this).classed("victim") && !d3.select(this).classed("attacker")) {     // or
            return;
        } 

        // zobraz utocniky/obeti daneho statu a nastav stat na aktivni
        var countryOfInterest = ( $.grep(data, function(e) { return e.country == d.id}) )[0];

        countryDetail = d.id;
        active = d3.select(this).classed("active", true);

        var participants = [];
        if (GeoMenu.getDisplayIP() == "source") {
            countryOfInterest.targets.countries.forEach(function(e) { 
                e.attack_types.forEach(function(type) {
                    if (!contains(GeoMenu.getShowAttacks(), type.type_id)) { return; }
                    participants.push(e.code); 
                })
            })
            showInvolvedCountries("source", ".attacker", participants);
        } else {
            countryOfInterest.sources.countries.forEach(function(e) { 
                e.attack_types.forEach(function(type) {
                    if (!contains(GeoMenu.getShowAttacks(), type.type_id)) { return; }
                    participants.push(e.code); 
                })
             })

            showInvolvedCountries("target", ".victim", participants);
        }

        showCurves(d);
    }

    function rightclicked(d) {
        d3.event.preventDefault();

        // in case there is no data for clicked country, return
        var res = $.grep(data, function(e) { return e.country == d.id; }); 
        if (res.length == 0) { return; }
        else {
            if ( (GeoMenu.getDisplayIP() == "source" && res[0].attacked_sb_filter == 0) ||
                (GeoMenu.getDisplayIP() == "target" && res[0].was_attacked_filter == 0) ) {
                return;
            }
        }

        if (active.node() === this && d3.selectAll("#sunburst")[0].length == 1) {
            removeSunburst();
            unfocus();
            return;
        }
        removeSunburst();
        removeCurves();

        active.classed("active", false);
        active = d3.select(this).classed("active", true);
        
        createSunburst(d);
        focusOnCountry(d);
    }

    function zoomed() {
        if (!blockTransform) {
            transform = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
            g.attr("transform", transform);

            d3.selectAll(".curve").style("stroke-width", function() { return Math.min((2.5 / d3.event.scale), 1.5) + "px"} )
            curves.attr("transform", transform)
        }
    };


    // ----- SUNBURST Interactivity -----
    function sunburstClicked(d) {
        if (d.depth == 3) {
            console.log("Open event " + d.event_id);    
        }
    }

    function sunburstMouseover(d) {

        var sequence = getAncestors(d);
        
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


    // ----- show / remove -----
    function showChoropleth() {
        d3.selectAll(".attacker").classed("attacker", false);
        d3.selectAll(".victim").classed("victim", false);  
        removeCurves();

                d3.selectAll(".country-boundary")
                        .style("fill", function(d) {

                            var result;
                            if (GeoMenu.getDisplayIP() == "source") {
                                result = $.grep(data, function(a) { return a.country == d.id; })
                                if (result.length > 0) {
                                    if (result[0].attacked_sb_filter != 0) { 

                                        d3.select(this).classed("attacker", true)
                                                       // .classed("displayed", true);

                                        return choropleth_source(result[0].attacked_sb_filter);
                                    }
                                }
                            } else {
                                result = $.grep(data, function(a){ return a.country == d.id; });
                                if (result.length > 0) {
                                    if (result[0].was_attacked_filter != 0) {

                                        d3.select(this).classed("victim", true)
                                                       // .classed("displayed", true);
                                        
                                        return choropleth_target(result[0].was_attacked_filter);
                                    }
                                }
                            }
                        })

        updateLegend();
    }

    function showInvolvedCountries(_displayIP, _classSelector, _participants) {
        d3.selectAll(".involved").classed("involved", false);
        d3.selectAll(_classSelector)
                            .filter(function(e) { return e.id != countryDetail; })
                            .classed("attacker", false)
                            .classed("victim", false)
                            .style("fill", "#ccc");

        // Draw CHOROPLETH of attackers/victims of countryDetail
        _participants.forEach(function(e) {  
            selected = d3.select("#" + e)
                .filter(function(e) { return e.id != countryDetail; })
                .classed("involved", true)
                .style("fill", function(e) {
                    result = $.grep(data, function(a) { return a.country == e.id; })

                    if (result.length > 0) {
                        if (_displayIP == "source") {
                            res = $.grep(result[0].sources.countries, function(a) { return a.code == countryDetail; });
                            if (res.length > 0) { return choropleth_target(res[0].count); }
                        } else {
                            res = $.grep(result[0].targets.countries, function(a) { return a.code == countryDetail; });
                            if (res.length > 0) { return choropleth_source(res[0].count); }
                        }
                    }
                })
            })

        // If countryOfInterest attacks on itself, draw it striped
        if (($.grep(_participants, function(e) { return e == countryDetail })).length > 0) {
            countryOfInterest = ( $.grep(data, function(e) { return e.country == countryDetail}) )[0];

            d3.select("#color_a").attr("fill", function() {
                return choropleth_source(countryOfInterest.attacked_sb);
            })
            d3.select("#color_b").attr("fill", function() {
                return choropleth_target(countryOfInterest.was_attacked);
            })
            active.style("fill", "url(#stripes)");
        }

        countryAttacksFlag = true;
    }

    function showCurves(d) {
        lineData = prepareArcData(d);

        lineData.forEach(function(e) {
            curves.append("path")
                            .attr("d", lineFunction(e))
                            .attr("class", "curve")
                            .style({
                                "stroke"       : "#666666",
                                "stroke-width" : "1.5px",
                                "fill"         : "none"
                            })
        })
    }

    function removeCurves() {
        d3.selectAll(".curve").remove();
        active.classed("active", false);
        countryDetail = "";
    }
    
    // ----- update -----
    function updateChoroplethDomains() {
        choropleth_source.domain([
                            d3.min(data, function(d) { return d.attacked_sb_filter == 0 ? Number.MAX_VALUE : d.attacked_sb_filter; }),
                            d3.max(data, function(d) { return d.attacked_sb_filter == 0 ? Number.MIN_VALUE : d.attacked_sb_filter; }),
            ]);

        choropleth_target.domain([
                            d3.min(data, function(d) { return d.was_attacked_filter == 0 ? Number.MAX_VALUE : d.was_attacked_filter; }),
                            d3.max(data, function(d) { return d.was_attacked_filter == 0 ? Number.MIN_VALUE : d.was_attacked_filter; })
            ]);
    }

    function updateLegend() {
        legend.selectAll("rect")
            .style("fill", function(d) {
                if (GeoMenu.getDisplayIP() == "source") {
                    return choropleth_source.range()[d];
                } else {
                    return choropleth_target.range()[d];
                }    
            })

        legendMin.text(function() {
            if (GeoMenu.getDisplayIP() == "source") {
                    return choropleth_source.domain()[0];
                } else {
                    return choropleth_target.domain()[0];
                }
            })
    
        legendMax.text(function() {
            if (GeoMenu.getDisplayIP() == "source") {
                    return choropleth_source.domain()[1];
                } else {
                    return choropleth_target.domain()[1];
                }
            })
    }
    
    // Map display / zoom 
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

        dx = xMax - xMin,       // right - left
        dy = yMax - yMin,       // bottom - top
        x = (xMax - xMin) / 2;  // (left - rigth) / 2
        if (yMin < 0) {
            y = yMax/2;
        } else {
            y = (yMin + yMax) / 2;  // (top - bottom) / 2
        }


        scale = 1 / Math.max(dx / width, dy / (height - menu_height)),
        translate = [width / 2 - scale * x, height / 2 - scale * y]

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

    function displayTheWorld() {
        blockTransform = false;
        if (countryAttacksFlag) {
            showChoropleth();
            countryAttacksFlag = false;
            countryDetail = "";
            d3.selectAll(".involved").classed("involved", false);
            
            removeCurves();

        }

        active.classed("active", false);
        active = d3.select(null);
        
        translate = [width/2, height/2];
        projection.translate(translate);
                                path = d3.geo.path().projection(projection)
                                d3.selectAll("path")//.transition(500)
                                                    .attr("d", path);
        transform = "";
        g.transition()
            .duration(750)
            .style("stroke-width", "1.5px")
            .attr("transform", transform);
        zoom.scale(1);
        zoom.translate([0, 0]);

        removeSunburst();
    }


    d3.select(window).on('resize', function() {
        width = $(window).width();
        height = $(window).height();
    });


    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                    Create Sunburst Visualization                    //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////

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
        var nodes = partition.nodes(hierarchy);

        sunburst.append("circle").attr({
                                    "id"   : "sunburst_circle",
                                    "r"    : radius * 1.45,
                                    "fill" : "white"
                                })
                                .on("mouseleave", sunburstMouseleave);

        var sunburst_paths = sunburst.selectAll("path")
                                .data(nodes)
                                .enter()
                                .append("path")
                                .attr({
                                    "class"   : "sunburst_strip",
                                    "display" : function(d) { return d.depth ? null : "none"; },
                                    "d"       : arc
                                })
                                .style({
                                    "fill" : function(d) { return color((d.children ? d : d.parent).name); },
                                    "stroke-width": "1px",
                                    "stroke"      : "white",
                                    "opacity"     : 0.5
                                })
                                .on({
                                    "click"      : sunburstClicked,
                                    "mouseenter" : sunburstMouseover
                                });

        // Sunburst strip description
        sunburst.append("text").attr({ "id": "caption_country", "class": "caption", "dy": -40 })
        sunburst.append("text").attr({ "id": "caption_type", "class": "caption", "dy": -10 })
        sunburst.append("text").attr({ "id": "caption_ip", "class": "caption", "dy": 35 })
                            
        totalSize = sunburst_paths.node().__data__.value;
    }

    function removeSunburst() {
        d3.selectAll("#sunburst").remove();
    }

    function buildHierarchy(d) {
        var root;

        if (GeoMenu.getDisplayIP() == "source") {
            root = getSunburstData(d.targets.countries);

        } else {    // target
            root = getSunburstData(d.sources.countries);    // ziskej data o zdrojovych statech
        }
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
                children : []   // attack types
            }

            country.attack_types.forEach(function(type) {

                if (!contains(GeoMenu.getShowAttacks(), type.type_id)) { return; }

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

    function showCaption(sequence) {
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
    }

    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //               Event listeners + button functionality                //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////

    $("#geo-menu").on('geomenuUpdate', function(e) {
        switch(e.detail) {

            case 'displayIP':
                showChoropleth();
                break;

            case 'showNames':
                g.selectAll("text").attr("visibility", function(d) {
                        return GeoMenu.getDisplayCountryNames() ? "visible" : "hidden";
                    })
                break;

            case 'showAttacks':
                updateAttackCounts();
                updateChoroplethDomains();
                showChoropleth();
                break;
        }
    });
    
    $('#assignUnknown').click(function() {

        if (unknownAssignedTo) {
            var unknown = $.grep(data, function(e) { return e.country == "XXX"});
            if (unknown.length == 0 || unknown.length > 1) { return false; }

            subtractUnknownData(unknownAssignedTo);
            unknownAssignedTo = "ES";   // TO DO / Get chosen Country
        } else {
            unknownAssignedTo = "IE";   // TO DO / Get chosen Country
            
        }
        
        assignUnknownCountryTo(unknownAssignedTo);

    });

    function assignUnknownCountryTo(toCountry) {
        // Get UNKNOWN's Data if exist, otherwise Return 
        var unknown = $.grep(data, function(e) { return e.country == "XXX"});
        if (unknown.length == 0 || unknown.length > 1) { 
            unknownAssignedTo = "";
            return false; 
        }

        // Get toCountry's Data
        var res = $.grep(data, function(e) { return e.country == toCountry})
        var selectedCountry;
        if (res.length == 0) {
            selectedCountry = createCountryOverviewData(toCountry);
            data.push(selectedCountry);
        } else if (res.length == 1) {
            selectedCountry = res[0]; //console.log(res[0])
        } else { console.log("Weirdo"); }

        // console.log(unknown[0])
        mergeData(unknown[0], selectedCountry);

        showChoropleth();
    }

    function subtractUnknownData(fromCountryCode) {

        console.log("Sunbtract Unknown Data");

        // Get UNKNOWN's Data if exist, otherwise Return 
        var unknown = ($.grep(data, function(e) { return e.country == "XXX"}))[0];
        if (unknown.length == 0 || unknown.length > 1) { 
            unknownAssignedTo = "";
            return false;
        }

        // Get toCountry's Data
        var fromCountry = ($.grep(data, function(e) { return e.country == fromCountryCode}) )[0];
        // console.log(unknown.attacked_sb);

        if (unknown.attacked_sb > 0) {
            unknown.targets.countries.forEach(function(country) {
                var involved_country = ($.grep(fromCountry.targets.countries, function(e) { return e.code == country.code}))[0];
                // console.log("involved_country");
                // console.log(involved_country);
                // stejny
                country.attack_types.forEach(function(attack_type) {
                    var involved_attack_type = ($.grep(involved_country.attack_types, function(e){ return e.type_id == attack_type.type_id; }))[0];

                    attack_type.ips.forEach(function(ip) {
                        ip_index = involved_attack_type.ips.indexOf(ip);
                        // console.log(ip_index);
                        if (ip_index > -1) {
                            involved_attack_type.ips.splice(ip_index, 1)
                        }
                    })

                    involved_attack_type.count -= attack_type.count;
                })

                involved_country.count -= country.count;

            })
            fromCountry.attacked_sb -= unknown.attacked_sb;
            fromCountry.attacked_sb_filter -= unknown.attacked_sb_filter;
        }


        if (unknown.was_attacked > 0) {
            unknown.sources.countries.forEach(function(country) {
                var involved_country = ($.grep(fromCountry.sources.countries, function(e) { return e.code == country.code}))[0];
                // console.log("involved_country");
                // console.log(involved_country);
                // stejny
                country.attack_types.forEach(function(attack_type) {
                    var involved_attack_type = ($.grep(involved_country.attack_types, function(e){ return e.type_id == attack_type.type_id; }))[0];

                    attack_type.ips.forEach(function(ip) {
                        ip_index = involved_attack_type.ips.indexOf(ip);
                        // console.log(ip_index, ip.event_id);
                        if (ip_index > -1) {
                            involved_attack_type.ips.splice(ip_index, 1)
                        }
                    })

                    involved_attack_type.count -= attack_type.count;
                })

                involved_country.count -= country.count;

            })
            fromCountry.was_attacked -= unknown.was_attacked;
            fromCountry.was_attacked_filter -= unknown.was_attacked_filter;
        }
    }


    // first part and second part only differ in accessing targets or sources and adding to attacked_sb or was_attacked
    function mergeData(fromCountry, toCountry) {
        if (fromCountry.attacked_sb > 0) {
            fromCountry.targets.countries.forEach(function(country) {

                res = $.grep(toCountry.targets.countries, function(e) { return e.code == country.code});
                if (res.length == 0) {
                    // console.log("Country " + country.code + " does not exist")
                    upd_involved_country = createInvolvedCountry(country.code);
                    toCountry.targets.countries.push(upd_involved_country);
                    // create new involved country
                } else if (res.length == 1) {
                    upd_involved_country = res[0];
                } else { console.log("Weirdos"); }

                // console.log("upd_involved_country");
                // console.log(upd_involved_country);
                // console.log(fromCountry);
                // curr_involved_country
                
                country.attack_types.forEach(function(attack_type) {
                    res = $.grep(upd_involved_country.attack_types, function(e){ return e.type_id == attack_type.type_id; });
                    
                    if (res.length == 0) {
                        // console.log("Attack_type " + attack_type + " does not exist");
                        upd_attack_type = createType(attack_type.type_id);
                        upd_involved_country.attack_types.push(upd_attack_type);
                    } else if (res.length == 1) {
                        upd_attack_type = res[0];
                    } else { console.log("Weirdos") }
                    // console.log(upd_attack_type)

                    attack_type.ips.forEach(function (ip) {
                        // console.log(ip)
                        upd_attack_type.ips.push(ip);
                    })

                    upd_attack_type.count += attack_type.count;

                }) 

                upd_involved_country.count += country.count;
                console.log(upd_involved_country);

            })
            toCountry.attacked_sb_filter += fromCountry.attacked_sb_filter;
            toCountry.attacked_sb += fromCountry.attacked_sb;
        }

        if (fromCountry.was_attacked > 0) {
            fromCountry.sources.countries.forEach(function(country) {
                res = $.grep(toCountry.sources.countries, function(e) { return e.code == country.code});
                if (res.length == 0) {
                    // console.log("Country " + country.code + " does not exist")
                    upd_involved_country = createInvolvedCountry(country.code);
                    toCountry.sources.countries.push(upd_involved_country);
                    // create new involved country
                } else if (res.length == 1) {
                    upd_involved_country = res[0];
                } else { console.log("Weirdos"); }

                // console.log("upd_involved_country");
                // console.log(upd_involved_country);
                // console.log(fromCountry);
                // curr_involved_country
                
                country.attack_types.forEach(function(attack_type) {
                    res = $.grep(upd_involved_country.attack_types, function(e){ return e.type_id == attack_type.type_id; });
                    
                    if (res.length == 0) {
                        // console.log("Attack_type " + attack_type + " does not exist");
                        upd_attack_type = createType(attack_type.type_id);
                        upd_involved_country.attack_types.push(upd_attack_type);
                    } else if (res.length == 1) {
                        upd_attack_type = res[0];
                    } else { console.log("Weirdos") }
                    // console.log(upd_attack_type)

                    attack_type.ips.forEach(function (ip) {
                        // console.log(ip)
                        upd_attack_type.ips.push(ip);
                    })

                    upd_attack_type.count += attack_type.count;

                }) 

                upd_involved_country.count += country.count;
                toCountry.was_attacked_filter += fromCountry.was_attacked_filter;
                toCountry.was_attacked += fromCountry.was_attacked;
                // console.log(upd_involved_country);
            })
        }
        console.log(data)
        // fromCountry.forEach
    }

    $('#defaultDisplay').click(function() {

        displayTheWorld();
    });


    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //              Data preprocess, update and preparation                //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////

    function readData(events) {

        // GET SOURCES
        for (var i = 0; i < events.length; i++) {
            var event_id = events[i].id;
            var source_ip = events[i].source.ip;
            var source_state = events[i].source.country;
            var type = events[i].type;

            if ( ($.grep(attackTypes, function(e) { return e == type})).length == 0) {
                attackTypes.push(type);
            }

            // Get global data of source state
            var r = $.grep(data, function(e){ return e.country == source_state; });

            // create new overview data for the source_state
            var curr_source_data;
            if (r.length == 0) {
                curr_source_data = createCountryOverviewData(source_state);
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
                curr_source_data.attacked_sb_filter++;
                curr_source_type.count++;
                curr_attacked_state.count++;


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
                } else if (r.length == 1) {
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
                curr_target_type.count++;
                curr_target_data.was_attacked++;
                curr_target_data.was_attacked_filter++;
                curr_attacking_state.count++;
 
            }
        }
        console.log(data);
        console.log(attackTypes);
        GeoMenu.setShowAttacks(attackTypes);
    }

    function createCountryOverviewData(state_code) {
        var new_country_overview = {
            country             : state_code,
            attacked_sb         : 0,      // kolikrat utocil na nekoho
            attacked_sb_filter  : 0,      
            was_attacked        : 0,      // kolikrat na nej bylo utoceno
            was_attacked_filter : 0,      
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
            count        : 0,
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

    // On   F I L T E R I N G
    function updateAttackCounts() {

        console.log(" ---- Update Attack Counts ---- ")
        console.log(GeoMenu.getShowAttacks());

        data.forEach(function(country) {
            country.was_attacked_filter = 0;
            country.attacked_sb_filter = 0;

            country.sources.countries.forEach(function(source) {
                source.attack_types.forEach(function(attack_type) {
                    if ( contains(GeoMenu.getShowAttacks(), attack_type.type_id) ) {
                        country.was_attacked_filter += attack_type.count;
                    }
                })
            })

            country.targets.countries.forEach(function(target) {
                target.attack_types.forEach(function(attack_type) {
                    if ( contains(GeoMenu.getShowAttacks(), attack_type.type_id) ) {
                        country.attacked_sb_filter += attack_type.count;
                    }
                })
            })
        })

        // console.log(data);
    }

    // On   Display CURVES between attacker and victims
    function prepareArcData(d) {
        var lineData = [];

        var x1 = path.centroid(d)[0];
        var y1 = path.centroid(d)[1];

        d3.selectAll(".involved")
                            .each(function(d) {
                                var x3 = path.centroid(d)[0];
                                var y3 = path.centroid(d)[1];

                                var x2 = (x1 + x3) / 2;
                                var y2 = (y1 + y3) / 2 - 60;

                                var newLine = [];
                                newLine.push({ x: x1, y: y1 });
                                newLine.push({ x: x2, y: y2 });
                                newLine.push({ x: x3, y: y3 });

                                lineData.push(newLine);

                            })
        return lineData;
    }   


    /////////////////////////////////////////////////////////////////////////
    //                                                                     //
    //                      General helpful functions                      //
    //                                                                     //
    /////////////////////////////////////////////////////////////////////////

    function contains(array, obj) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    }


});