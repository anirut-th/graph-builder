import * as d3 from "d3";
import initializeOption from "./initializeOption";
import RenderTextFromHtml from "../common/RenderTextFromHtml";
import CreateAxis from "../common/CreateAxis";
import CreateLegend from "./CreateLegend";
import AddSeries from "./AddSeries";
function ScatterGraph(elementId, option) {
    option = initializeOption(option);
    let padding = option.padding;

    console.log(option);
    
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


    scaleY = CreateAxis(min_y, max_y, 
        option.height - xAxisBbox.height - xAxisNameBbox.height - padding.bottom, 
        padding.top + titleBbox.height, 
        option.y_axis.scale);
    axisY.call(d3.axisLeft(scaleY));
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

    //Update Axis Bbox
    xAxisBbox = axisX.node().getBBox();
    xAxisNameBbox = xAxisNameElement.node().getBBox();
    yAxisBbox = axisY.node().getBBox();
    yAxisNameBbox = yAxisNameElement.node().getBBox();


    let zoomX = d3.zoom()
    .scaleExtent([.01, 100])  // This control how much you can unzoom (x0.01) and zoom (x100)
    .translateExtent([[-100, -100], [option.width, option.height]])
    .extent([[0, 0], [option.width, option.height]])
    .on("zoom", function(){
        // recover the new scale
        let newScaleX = d3.event.transform.rescaleX(scaleX);
        scaleX = newScaleX;

        // update axes with these new boundaries
        axisX.call(d3.axisBottom(newScaleX));//.ticks(max_x, formatTick));

        //hide focus
        graph.selectAll(".focus").style("display", "none");

        for (var i in option.series) {
            d3
                .selectAll("circle[data-uid='" + option.series[i].uid + "']")
                .attr("cx", function (d) { return scaleX(d.x); })
        }
    });
    console.log(xAxisBbox)
    let zoomPanelX =  graph.append("rect")
                    .attr("fill-opacity", 0)
                    .attr("width", xAxisBbox.width)
                    .attr("height", xAxisBbox.height + xAxisNameBbox.height)
                    .attr("transform", "translate("+ xAxisBbox.x +"," + (option.height - padding.bottom - xAxisBbox.height - xAxisNameBbox.height) + ")")
                    .call(zoomX);

    return option;


}
export default ScatterGraph;