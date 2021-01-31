import * as d3 from "d3"

function setFocusHidden(type, uid) {
    var getFocus = d3.select(uid);
    if (getFocus == null) return;
    if (type == "show") {
        getFocus.style("display", "inherit");
    }
    else {
        getFocus.style("display", "none");
    }
}

function setFocusTopic(posX, posY, yAxisType, uid, data) {
    if (data.x === null || data.y === null || data.x === "-" || data.y === "-") {
        return;
    }
    var getFocus = d3.select(".focus[data-uid='" + uid + "']");
    if (getFocus == null) return;
    getFocus.attr("transform", "translate(" + posX + "," + posY + ")");

    getFocus = d3.select(".legend-item[data-uid='" + uid + "'] .x-value");
    if (getFocus == null) return;
    getFocus.text(data.x.toFixed(4));
    
    if(yAxisType === "left") {
        getFocus = d3.select(".legend-item[data-uid='" + uid + "'] .y-left-value");
        if (getFocus == null) return;
        getFocus.text(data.y.toFixed(4));
    } else if (yAxisType === "right") {
        getFocus = d3.select(".legend-item[data-uid='" + uid + "'] .y-right-value");
        if (getFocus == null) return;
        getFocus.text(data.y.toFixed(4));
    }
}

function setFocus(plot_area, legend_area, uid, color, size) {
    if (size === "" || size === null || size === undefined || size < 0) {
        size = 3;
    }

    var focus = plot_area
        .append("g")
        .attr("data-uid", uid)
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", (size + 2))
        .attr("fill-opacity", 0.7)
        .style("fill", color);
    legend_area.append("text")
        .attr("class", "message")
        .attr("data-uid", uid)
        .attr("x", 25)
        .attr("y", 25)
        .style("font-size", 12)
}

export {
    setFocusHidden,
    setFocusTopic,
    setFocus
}
