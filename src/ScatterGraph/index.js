import * as d3 from "d3";
import initializeOption from "./initializeOption";
import RenderTextFromHtml from "../common/RenderTextFromHtml";
import CreateAxis from "../common/CreateAxis";
import CreateLegend from "./CreateLegend";
import AddSeries from "./AddSeries";
import { log10, Distance } from "../common/MathService";
import * as Interactive from "./Interactive";

function ScatterGraph(elementId, option) {
    let formatTick = function (d) {
        //var num = numeral(d);
        return d.toString();//num.format('0.0');
    };

    option = initializeOption(option);
    let padding = option.padding;
    
    //=================================================
    //Create graph object (holding entire graph)
    //=================================================
    let viewport = d3.select("#" + elementId)
        .append("svg")
        .attr("width", option.width)
        .attr("height", option.height)
    //    .attr("style", "background-color:#cccccc");

    let graph = viewport.append("g"); 
    //=================================================
    // Create title
    //=================================================
    let title = graph.append("text")
        .attr("transform", "translate(" + (option.width/2) + "," + (padding.top) + ")")
        .attr("style", "text-anchor:middle; dominant-baseline: hanging;");
    RenderTextFromHtml(title, option.title.text);
    title.attr("font-size", option.title.font_size);
    let titleBbox = title.node().getBBox();

    //=================================================
    // Create Scale for X, Y Axis (Use for convert between Screen position into Graph position)
    //=================================================
    let min_x = option.x_axis.min;
    let max_x = option.x_axis.max;
    let name_x = option.x_axis.name;
    let min_y = option.y_axis.min;
    let max_y = option.y_axis.max;
    let name_y = option.y_axis.name;

    let scaleX = CreateAxis(min_x, max_x, padding.left, option.width - padding.right, option.x_axis.scale);
    let scaleY = CreateAxis(min_y, max_y, option.height, padding.top, option.y_axis.scale);;
    
    //=================================================
    // Add the X Axis
    //=================================================
    let axisX = graph.append("g")
    .attr("class", "axis")
    axisX.call(d3.axisBottom(scaleX));
    let xAxisBbox = axisX.node().getBBox();

    let xAxisNameElement = graph.append("text")
        .attr("style", "text-anchor:middle; dominant-baseline: hanging;")
    RenderTextFromHtml(xAxisNameElement, name_x);
    let xAxisNameBbox = xAxisNameElement.node().getBBox();

    //=================================================
    // Add the Y Axis
    //=================================================
    let axisY = graph.append("g")
    .attr("class", "axis")
    axisY.call(d3.axisLeft(scaleY));
    let yAxisBbox = axisY.node().getBBox();

    let yAxisNameElement = graph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("style", "text-anchor:middle; dominant-baseline: hanging;")
    RenderTextFromHtml(yAxisNameElement, name_y);
    let yAxisNameBbox = yAxisNameElement.node().getBBox();
    

    //=================================================
    //Arrange X and Y axis Position
    //=================================================
    scaleX = CreateAxis(min_x, max_x, 
        padding.left + yAxisNameBbox.height + yAxisBbox.width, 
        option.width - padding.right, 
        option.x_axis.scale);
    if(option.x_axis.scale === "log") { 
        axisX.call(d3.axisBottom(scaleX).ticks(max_x, formatTick)); 
    }
    else { axisX.call(d3.axisBottom(scaleX)); }

    let translate = { 
        x: 0, 
        y: option.height - padding.bottom - xAxisBbox.height - xAxisNameBbox.height 
    };
    axisX.attr("transform", "translate("+ translate.x +"," + translate.y + ")");

    translate = { 
        x: (option.width - padding.left - padding.right) / 2, 
        y: option.height - padding.bottom - xAxisNameBbox.height 
    };
    xAxisNameElement.attr("transform", "translate("+ translate.x +"," + translate.y + ")");


    scaleY = CreateAxis(min_y, max_y, 
        option.height - xAxisBbox.height - xAxisNameBbox.height - padding.bottom, 
        padding.top + titleBbox.height, 
        option.y_axis.scale);
    if(option.y_axis.scale === "log") {
        axisY.call(d3.axisLeft(scaleY).ticks(max_y, formatTick));
    } else {
        axisY.call(d3.axisLeft(scaleY));
    }
    translate = { 
        x: padding.left + yAxisNameBbox.height + yAxisBbox.width, 
        y: 0
    };
    axisY.attr("transform", "translate("+ translate.x +"," + translate.y + ")");

    translate = { 
        x: -(option.height - padding.top - padding.bottom) / 2,
        y: padding.left
    };
    yAxisNameElement.attr("transform", "rotate(-90) translate("+ translate.x +"," + translate.y + ")");

    //=================================================
    // Add clip (Area to plot the graph)
    //=================================================
    let plottingClipBbox = {
        x: padding.left + yAxisNameBbox.height + yAxisBbox.width,
        y: padding.top + titleBbox.height,
        width: option.width - (padding.left + padding.right + yAxisBbox.width + yAxisNameBbox.height),
        height: option.height - (padding.top + padding.bottom + titleBbox.height + xAxisBbox.height + xAxisNameBbox.height)
    };
    let clipPathId = "plotting-clip" + elementId;
    graph.append("defs").append("clipPath")
        .attr("id", clipPathId)
        .append("rect")
        .attr("x", plottingClipBbox.x)
        .attr("y", plottingClipBbox.y)
        .attr("width", plottingClipBbox.width)
        .attr("height", plottingClipBbox.height);

    let plotArea = graph.append("g")
                .attr("class", "plot")
                .attr("clip-path", "url(#" + clipPathId + ")");

    let legends = [];
    for (let i in option.series) {
        option.series[i].uid = elementId + option.series[i].uid;
        AddSeries(plotArea, scaleX, scaleY, option.series[i]);
        
        if(option.series[i].name === "--no-display--") { continue; }
        legends.push({
            uid: option.series[i].uid,
            color: option.series[i].color,
            name: option.series[i].name
        });
    }

    //=================================================
    //Create Legend area
    //=================================================
    let legendArea = CreateLegend(viewport, graph, option, legends);
    let legentAreaBbox = legendArea.node().getBBox();

    for (var i in option.series) {
        Interactive.setFocus(
            plotArea,
            legendArea.select(".legend-item[data-uid='" + option.series[i].uid + "']"),
            option.series[i].uid,
            option.series[i].color,
            option.series[i].marker.size,
            elementId
        );
    }

    //Update Axis Bbox
    xAxisBbox = axisX.node().getBBox();
    xAxisNameBbox = xAxisNameElement.node().getBBox();
    yAxisBbox = axisY.node().getBBox();
    yAxisNameBbox = yAxisNameElement.node().getBBox();

    let currentScaleX = scaleX;
    let currentScaleY = scaleY;

    let zoomXY = d3.zoom()
    .scaleExtent([.1, 5])
    .on("zoom", function(){
        // recover the new scale
        let _scaleX = d3.event.transform.rescaleX(scaleX);
        let _scaleY = d3.event.transform.rescaleY(scaleY);
        
        graph.selectAll(".focus").style("display", "none");

        // update axes with these new boundaries
        if(option.x_axis.scale === "log") { 
            axisX.call(d3.axisBottom(_scaleX).ticks(max_x, formatTick)); 
        }
        else { axisX.call(d3.axisBottom(_scaleX)); }

        if(option.y_axis.scale === "log") {
            axisY.call(d3.axisLeft(_scaleY).ticks(max_y, formatTick));
        } else {
            axisY.call(d3.axisLeft(_scaleY));
        }


        for (var i in option.series) {
            d3
                .selectAll("circle[data-uid='" + option.series[i].uid + "']")
                .attr("cx", function (d) { return _scaleX(d.x); })
                .attr("cy", function (d) { return _scaleY(d.y); })
        }
        currentScaleY = _scaleY;
        currentScaleX = _scaleX;
    });

    // let zoomXPanel =  graph.append("rect")
    //                 .attr("fill-opacity", 0)
    //                 .attr("width", xAxisBbox.width)
    //                 .attr("height", xAxisBbox.height + xAxisNameBbox.height)
    //                 .attr("transform", "translate("+ xAxisBbox.x + "," + (option.height - padding.bottom - xAxisBbox.height - xAxisNameBbox.height) + ")")
    //                 .on("mouseover", function() {
    //                     scaleX = currentScaleX;
    //                 })
    //                 .call(zoomX);

    // let zoomYPanel =  graph.append("rect")
    //                 .attr("fill-opacity", 0)
    //                 .attr("width", yAxisBbox.width + yAxisNameBbox.height)
    //                 .attr("height", yAxisBbox.height)
    //                 .attr("transform", "translate("+ padding.left +"," + (padding.top + titleBbox.height) + ")")
    //                 .on("mouseover", function() {
    //                     scaleY = currentScaleY;
    //                 })
    //                 .call(zoomY);

    //Create invisible panel for recieve mouse event
    let zoomXYPanel =  graph.append("rect")
                    .attr("fill-opacity", 0)
                    .attr("width", xAxisBbox.width)
                    .attr("height", yAxisBbox.height)
                    .attr("clip-path", "url(#" + clipPathId + ")")
                    .attr("transform", "translate("+ xAxisBbox.x +"," + yAxisBbox.y + ")")
                    .on("mousemove", function(){
                        var transform = d3.zoomTransform(graph.node());
                        var mousePos = transform.invert(d3.mouse(this));
                        //var getX = __this.scaleX.invert(d3.mouse(this)[0]);
                        //var getY = __this.scaleY.invert(d3.mouse(this)[1]);
                        var getX = mousePos[0] + xAxisBbox.x; //__this.scaleX.invert(mousePos[0]);
                        var getY = mousePos[1] + yAxisBbox.y;//__this.scaleY.invert(mousePos[1]);
                        //getX = Math.round(getX * 10) / 10;
                        //graph.append("circle").attr("cx", getX).attr("cy", getY).attr("r", 3)
                        var nearestPoint = [];
                        for (var i in option.series) {
                            var getData = option.series[i];
                            var _fpoint = getData.datas.sort(function (a, b) { 
                                var _getX = getX;
                                var _getY = getY;
                                var ax = a.x;
                                var ay = a.y;
                                var bx = b.x;
                                var by = b.y;
                                ax = currentScaleX(a.x);
                                ay = currentScaleY(a.y);
                                bx = currentScaleX(b.x);
                                by = currentScaleY(b.y);
                                var dist_a = Math.sqrt(Math.pow((_getX - ax), 2) + Math.pow((_getY - ay), 2));
                                var dist_b = Math.sqrt(Math.pow((_getX - bx), 2) + Math.pow((_getY - by), 2));
                                return dist_a - dist_b; 
                            });
                            var fpoint = _fpoint[0];
                            nearestPoint.push({
                                uid: getData.uid,
                                point: fpoint
                            });
                            var uid = getData.uid;
                            var getLine = d3.select(".datapoint[data-uid='" + uid + "']");
                            var getHiddenStatus = getLine.style("display");
                            if(getHiddenStatus !== "none") {
                                if(fpoint.x === null || fpoint.y === null) {
                                    Interactive.setFocusHidden("hide", ".focus[data-uid='" + uid + "']");                
                                    Interactive.setFocusTextHidden(".legend-item[data-uid='" + uid + "'] .x-value");                
                                    Interactive.setFocusTextHidden(".legend-item[data-uid='" + uid + "'] .y-value");                
                                } else {
                                    Interactive.setFocusHidden("show", ".focus[data-uid='" + uid + "']");
                                    Interactive.setFocusHidden("show", ".legend-item[data-uid='" + uid + "'] .x-value");                
                                    Interactive.setFocusHidden("show", ".legend-item[data-uid='" + uid + "'] .y-value");      
                                    Interactive.setFocusTopic(currentScaleX(fpoint.x), currentScaleY(fpoint.y), getData.y_axis, uid, "", fpoint);
                                }
                            }
                        }
                    })
                    .call(zoomXY);
    return option;
}

export default ScatterGraph;