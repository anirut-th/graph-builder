import RenderTextFromHtml from "../common/RenderTextFromHtml";

function CreateLegend(viewport, graph, option, legendData) {
    let legendArea = graph.append("g").attr("class", "legend");
    let legendBbox = {};
    switch(option.legend.position) {
        case "bottom":
            legendBbox = {
                x: 0,
                y: option.height,
                width: option.width,
                height: 10
            }
            break;
        case "right":
            legendBbox = {
                x: option.width,
                y: option.padding.top,
                width: option.legend.width,
                height: 10
            }
            viewport.attr("width", option.width + option.legend.width + option.padding.right);
            break;
        default:
            legendBbox = {
                x: option.width,
                y: option.padding.top,
                width: option.legend.width,
                height: 10
            }
            break;
    }
    legendArea.attr("transform", "translate("+legendBbox.x+", "+legendBbox.y+")");

    let header = [ "Name", option.x_axis.name, option.y_axis.name];
    
    //create legends header
    // 30% width of first column
    // 70% share evenly for the rest column
    let firstColWidth = legendBbox.width * 0.30;
    let otherColWidth = (legendBbox.width * 0.70) / 2;

    let legendHeader = legendArea.append("g")
        .attr("id", "not-export")
        .attr("class", "legend-header");
    
    // Generate Header
    for (let i = 0; i < header.length; i++) {
        let _headerText = legendHeader
            .append("text")
            .style("dominant-baseline", "hanging")
            .attr("text-anchor", function (d, index) {
                if (i > 0) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr("font-weight", 700)
            .attr("x", function () {
                if (i > 0) {
                    return firstColWidth + (i * otherColWidth);
                } else {
                    return 0;
                }
            });
        RenderTextFromHtml(_headerText, header[i]);
    }

    //Generate Legend items.
    for (let i in legendData) {
        let legendItems = legendArea.append("g")
            .attr("class", "legend-item")
            .attr("transform", "translate(0, " + (20 + (i * 30)) + ")")
            .attr("data-uid", legendData[i].uid);

        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 10)
            .attr("width", 15)
            .attr("height", 15)
            .attr("data-uid", legendData[i].uid )
            .attr("data-color", legendData[i].color)
            .style("cursor", "pointer")
            .style("fill", legendData[i].color)

        let legendName = legendItems.append("text")
            .attr("x", 30)
            .attr("y", 12)
            .style("dominant-baseline", "hanging")
            .attr("class", "legend-name")
            .attr("data-uid", legendData[i].uid )
            .attr("data-color", legendData[i].color)
        RenderTextFromHtml(legendName, legendData[i].name);

        legendItems.append("text")
            .attr("id", "not-export")
            .attr("x", (firstColWidth + otherColWidth))
            .attr("y", 12)
            .attr("text-anchor", "end")
            .style("dominant-baseline", "hanging")
            .attr("class", "x-value")
            .text("-")
        legendItems.append("text")
            .attr("id", "not-export")
            .attr("x", (firstColWidth + (otherColWidth * 2)))
            .attr("y", 12)
            .attr("text-anchor", "end")
            .style("dominant-baseline", "hanging")
            .attr("class", "y-value")
            .text("-")
    }

    return legendArea;
}

export default CreateLegend;