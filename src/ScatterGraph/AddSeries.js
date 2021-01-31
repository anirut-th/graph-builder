import RandomColor from "../common/RandomColor"

function AddSeries(plotArea, scaleX, scaleY, series) {
    let uid = series.uid;
    let color = series.color;
    let datas = JSON.parse(JSON.stringify(series.datas));

    if(series.marker === null || series.marker === undefined || series.marker === "") {
        series.marker = {
            shape: "circle",
            size: 3
        }
    }

    //plot data
    if (series.marker.shape === "circle") {
        plotArea.selectAll("circle[data-uid='" + uid + "']").data(datas).enter()
            .append("circle")
            .attr("data-uid", uid)
            .attr("class", "datapoint")
            .attr("fill", color)
            .attr("r", series.marker.size)
            .attr("cx", function (d) { return scaleX(d.x); })
            .attr("cy", function (d) { return scaleY(d.y); })
            .attr("dx", function (d) { return d.x; })
            .attr("dy", function (d) { return d.y; })
            .on("click", function(d) {
                console.log(d);
            })
    }
}

export default AddSeries;