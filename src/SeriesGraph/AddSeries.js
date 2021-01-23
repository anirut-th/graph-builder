import RandomColor from "../common/RandomColor"
import * as d3 from "d3";

function AddSeries(plotArea, scaleX, scaleY, series) {
    let uid = series.uid;
    let color = series.color;
    let datas = JSON.parse(JSON.stringify(series.datas));

    datas = datas.sort(function(a, b){ return a.index - b.index });

    if(series.marker === null || series.marker === undefined || series.marker === "") {
        series.marker = {
            shape: "circle",
            size: 3,
            visible: true
        }
    }

    if(series.line === null || series.line === undefined || series.line === "") {
        series.line = {
            type: "solid",
            size: 2,
            visible: true
        }
    }

    let markerOpacity = 0;
    let lineOpacity = 0;
    if(series.line.visible === true) {
        lineOpacity = 1;
    }
    if(series.marker.visible === true) {
        markerOpacity = 1;
    }

    //plot data as line
    var valueline = d3.line()
        .defined(function (d) { return d.y !== null; })
        .x(function (d) { return scaleX(d.x); })
        .y(function (d) { return scaleY(d.y); });
    if (series.line.type === "solid") {
        plotArea.append('path')
            .attr("data-uid", uid)
            .attr("class", "dataline")
            .style("stroke-width", series.line.size)
            .style("stroke", color)
            .style("fill", "none")
            .attr("stroke-opacity", lineOpacity)
            .attr("d", valueline(datas));
    } else if (series.line.type === "dash") {
        plotArea.append('path')
            .attr("data-uid", uid)
            .attr("class", "dataline")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke", color)
            .style("stroke-width", series.line.size)
            .attr("stroke-opacity", lineOpacity)
            .style("fill", "none")
            .attr("d", valueline(datas));
    }

    //plot data as marker
    if (series.marker.shape === "circle") {
        plotArea.selectAll("circle[data-uid='" + uid + "']").data(datas).enter()
            .append("circle")
            .attr("data-uid", uid)
            .attr("class", "datapoint")
            .attr("fill", color)
            .attr("fill-opacity", markerOpacity)
            .attr("r", series.marker.size)
            .attr("cx", function (d) { return scaleX(d.x); })
            .attr("cy", function (d) { return scaleY(d.y); })
            .attr("dx", function (d) { return d.x; })
            .attr("dy", function (d) { return d.y; })
    }
}

export default AddSeries;