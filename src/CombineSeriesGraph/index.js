import * as d3 from "d3";
import initializeOption from "./initializeOption";
import RenderTextFromHtml from "../common/RenderTextFromHtml";
import CreateAxis from "../common/CreateAxis";
import CreateLegend from "./CreateLegend";
import AddSeries from "./AddSeries";
import { log10, Distance } from "../common/MathService";
import * as Interactive from "./Interactive";

function CombineSeriesGraph(elementId, option) {
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
    let min_yleft = option.y_axis_left.min;
    let max_yleft = option.y_axis_left.max;
    let name_yleft = option.y_axis_left.name;
    let min_yright = option.y_axis_right.min;
    let max_yright = option.y_axis_right.max;
    let name_yright = option.y_axis_right.name;

    let scaleX = CreateAxis(min_x, max_x, padding.left, option.width - padding.right, option.x_axis.scale);
    let scaleYLeft = CreateAxis(min_yleft, max_yleft, option.height, padding.top, option.y_axis_left.scale);
    let scaleYRight = CreateAxis(min_yright, max_yright, option.height, padding.top, option.y_axis_right.scale);
    
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
    // Add the Y Axis left
    //=================================================
    let axisYLeft = graph.append("g")
    .attr("class", "axis")
    axisYLeft.call(d3.axisLeft(scaleYLeft));
    let yAxisLeftBbox = axisYLeft.node().getBBox();

    let yAxisLeftNameElement = graph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("style", "text-anchor:middle; dominant-baseline: hanging;")
    RenderTextFromHtml(yAxisLeftNameElement, name_yleft);
    let yAxisLeftNameBbox = yAxisLeftNameElement.node().getBBox();
    
    //=================================================
    // Add the Y Axis right
    //=================================================
    let axisYRight = graph.append("g")
    .attr("class", "axis")
    axisYRight.call(d3.axisRight(scaleYRight));
    let yAxisRightBbox = axisYLeft.node().getBBox();

    let yAxisRightNameElement = graph.append("text")
        .attr("transform", "rotate(90)")
        .attr("style", "text-anchor:middle; dominant-baseline: auto;")
    RenderTextFromHtml(yAxisRightNameElement, name_yright);
    let yAxisRightNameBbox = yAxisRightNameElement.node().getBBox();


    //=================================================
    //Arrange X and Y axis Position
    //=================================================
    // X Axis
    scaleX = CreateAxis(min_x, max_x, 
        padding.left + yAxisLeftNameBbox.height + yAxisLeftBbox.width, 
        option.width - padding.right - yAxisRightNameBbox.height - yAxisRightBbox.width, 
        option.x_axis.scale);
    axisX.call(d3.axisBottom(scaleX));
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

    // Y Left Axis
    scaleYLeft = CreateAxis(min_yleft, max_yleft, 
        option.height - xAxisBbox.height - xAxisNameBbox.height - padding.bottom, 
        padding.top + titleBbox.height, 
        option.y_axis_left.scale);
    axisYLeft.call(d3.axisLeft(scaleYLeft));
    translate = { 
        x: padding.left + yAxisLeftNameBbox.height + yAxisLeftBbox.width, 
        y: 0
    };
    axisYLeft.attr("transform", "translate("+ translate.x +"," + translate.y + ")");

    translate = { 
        x: padding.left,
        y: (option.height - padding.top - padding.bottom) / 2
    };
    yAxisLeftNameElement.attr("transform", "translate("+ translate.x +"," + translate.y + ") rotate(-90)");

    //Y Right Axis
    scaleYRight = CreateAxis(min_yright, max_yright, 
        option.height - xAxisBbox.height - xAxisNameBbox.height - padding.bottom, 
        padding.top + titleBbox.height, 
        option.y_axis_right.scale);
    axisYRight.call(d3.axisRight(scaleYRight));
    translate = { 
        x: option.width - padding.right - yAxisRightNameBbox.height - yAxisRightBbox.width, 
        y: 0
    };
    axisYRight.attr("transform", "translate("+ translate.x +"," + translate.y + ")");
    
    translate = { 
        x: option.width - padding.right,
        y: (option.height - padding.top - padding.bottom) / 2
    };
    yAxisRightNameElement.attr("transform", "translate("+ translate.x +"," + translate.y + ") rotate(90)");

    //=================================================
    // Add clip (Area to plot the graph)
    //=================================================
    let plottingClipBbox = {
        x: padding.left + yAxisLeftNameBbox.height + yAxisLeftBbox.width,
        y: padding.top + titleBbox.height,
        width: option.width - (padding.left + padding.right + yAxisLeftBbox.width + yAxisLeftNameBbox.height + yAxisRightBbox.width + yAxisRightNameBbox.height),
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
        if(option.series[i].y_axis === "left") {
            AddSeries(plotArea, scaleX, scaleYLeft, option.series[i]);
        } else if (option.series[i].y_axis === "right") {
            AddSeries(plotArea, scaleX, scaleYRight, option.series[i]);
        }
        
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

    for (let i in option.series) {
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
    yAxisLeftBbox = axisYLeft.node().getBBox();
    yAxisLeftNameBbox = yAxisLeftNameElement.node().getBBox();
    yAxisRightBbox = axisYRight.node().getBBox();
    yAxisRightNameBbox = yAxisRightNameElement.node().getBBox();

    let currentScaleX = scaleX;
    let currentScaleYLeft = scaleYLeft;
    let currentScaleYRight = scaleYRight;

    // let zoomX = d3.zoom()
    // .scaleExtent([.1, 5])  // This control how much you can unzoom (x0.01) and zoom (x100)
    // .on("zoom", function(){
    //     // recover the new scale
    //     let _scaleX = d3.event.transform.rescaleX(scaleX);

    //     // update axes with these new boundaries
    //     axisX.call(d3.axisBottom(_scaleX));
    //     for (let i in option.series) {
    //         d3
    //             .selectAll("circle[data-uid='" + option.series[i].uid + "']")
    //             .attr("cx", function (d) { return _scaleX(d.x); })
    //             .attr("cy", function (d) { return currentScaleYLeft(d.y); })
    //     }
    //     currentScaleX = _scaleX;
    // });
    
    // let zoomY = d3.zoom()
    // .scaleExtent([.1, 5])
    // .on("zoom", function(){
    //     // recover the new scale
    //     let _scaleY = d3.event.transform.rescaleY(scaleYLeft);

    //     graph.selectAll(".focus").style("display", "none");
    //     // update axes with these new boundaries
    //     axisYLeft.call(d3.axisLeft(_scaleY));
    //     for (let i in option.series) {
    //         d3
    //             .selectAll("circle[data-uid='" + option.series[i].uid + "']")
    //             .attr("cx", function (d) { return currentScaleX(d.x); })
    //             .attr("cy", function (d) { return _scaleY(d.y); })
    //     }
    //     currentScaleYLeft = _scaleY;
    // });

    let zoomXY = d3.zoom()
    .scaleExtent([.1, 5])
    .on("zoom", function(){
        // recover the new scale
        let _scaleX = d3.event.transform.rescaleX(scaleX);
        let _scaleYLeft = d3.event.transform.rescaleY(scaleYLeft);
        let _scaleYRight = d3.event.transform.rescaleY(scaleYRight);
        
        graph.selectAll(".focus").style("display", "none");

        // update axes with these new boundaries
        axisX.call(d3.axisBottom(_scaleX));
        axisYLeft.call(d3.axisLeft(_scaleYLeft));
        axisYRight.call(d3.axisRight(_scaleYRight));

        for (let i in option.series) {
            let _tempScaleY = null;
            if(option.series[i].y_axis === "left") {
                _tempScaleY = _scaleYLeft;
            } else if (option.series[i].y_axis === "right") {
                _tempScaleY = _scaleYRight;
            }

            let lineGenerator = d3.line()
                            .x(function (d) {
                                return _scaleX(d.x)
                            })
                            .y(function (d) {
                                return _tempScaleY(d.y)
                            });
                
            let definedData = option.series[i].datas.sort(function (a, b) { return a.index - b.index });
            let dataPath = lineGenerator(definedData);
            d3
                .selectAll("path[data-uid='" + option.series[i].uid + "']")
                .attr("d", dataPath)
                .attr("class", "dataline")

            d3
                .selectAll("circle[data-uid='" + option.series[i].uid + "']")
                .attr("cx", function (d) { return _scaleX(d.x); })
                .attr("cy", function (d) { return _tempScaleY(d.y); })
        }
        currentScaleYLeft = _scaleYLeft;
        currentScaleYRight = _scaleYRight;
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
    //                 .attr("width", yAxisLeftBbox.width + yAxisLeftNameBbox.height)
    //                 .attr("height", yAxisLeftBbox.height)
    //                 .attr("transform", "translate("+ padding.left +"," + (padding.top + titleBbox.height) + ")")
    //                 .on("mouseover", function() {
    //                     scaleYLeft = currentScaleYLeft;
    //                 })
    //                 .call(zoomY);

    //Create invisible panel for recieve mouse event
    let zoomXYPanel =  graph.append("rect")
                    .attr("fill-opacity", 0)
                    .attr("width", xAxisBbox.width)
                    .attr("height", yAxisLeftBbox.height)
                    .attr("clip-path", "url(#" + clipPathId + ")")
                    .attr("transform", "translate("+ xAxisBbox.x +"," + yAxisLeftBbox.y + ")")
                    .on("mousemove", function(){
                        let transform = d3.zoomTransform(graph.node());
                        let mousePos = transform.invert(d3.mouse(this));
                        let getX = mousePos[0] + xAxisBbox.x;
                        let getY = mousePos[1] + yAxisLeftBbox.y;

                        //graph.append("circle").attr("cx", getX).attr("cy", getY).attr("r", 3)

                        let nearestPoint = [];
                        for (let i in option.series) {
                            let _tempScaleY = null;
                            if(option.series[i].y_axis === "left") {
                                _tempScaleY = currentScaleYLeft;
                            } else if (option.series[i].y_axis === "right") {
                                _tempScaleY = currentScaleYRight;
                            }

                            let getData = option.series[i];
                            let _fpoint = getData.datas.sort(function (a, b) { 
                                let _getX = getX;
                                let _getY = getY;
                                let ax = a.x;
                                let ay = a.y;
                                let bx = b.x;
                                let by = b.y;
                                ax = currentScaleX(a.x);
                                ay = _tempScaleY(a.y);
                                bx = currentScaleX(b.x);
                                by = _tempScaleY(b.y);
                                let dist_a = Math.sqrt(Math.pow((_getX - ax), 2) + Math.pow((_getY - ay), 2));
                                let dist_b = Math.sqrt(Math.pow((_getX - bx), 2) + Math.pow((_getY - by), 2));
                                return dist_a - dist_b; 
                            });
                            let fpoint = _fpoint[0];
                            nearestPoint.push({
                                uid: getData.uid,
                                point: fpoint
                            });
                            let uid = getData.uid;
                            let getLine = d3.select(".datapoint[data-uid='" + uid + "']");
                            let getHiddenStatus = getLine.style("display");
                            if(getHiddenStatus !== "none") {
                                if(fpoint.x === null || fpoint.y === null) {
                                    Interactive.setFocusHidden("hide", ".focus[data-uid='" + uid + "']");
                                    Interactive.setFocusTextHidden(".legend-item[data-uid='" + uid + "'] .x-value");
                                    Interactive.setFocusTextHidden(".legend-item[data-uid='" + uid + "'] .y-left-value");
                                    Interactive.setFocusTextHidden(".legend-item[data-uid='" + uid + "'] .y-right-value");
                                } else {
                                    Interactive.setFocusHidden("show", ".focus[data-uid='" + uid + "']");
                                    Interactive.setFocusHidden("show", ".legend-item[data-uid='" + uid + "'] .x-value");
                                    Interactive.setFocusHidden("show", ".legend-item[data-uid='" + uid + "'] .y-left-value");
                                    Interactive.setFocusHidden("show", ".legend-item[data-uid='" + uid + "'] .y-right-value");
                                    Interactive.setFocusTopic(currentScaleX(fpoint.x), _tempScaleY(fpoint.y), getData.y_axis, uid, fpoint);
                                }
                            }
                        }
                    })
                    .call(zoomXY);
    return option;
}

export default CombineSeriesGraph;