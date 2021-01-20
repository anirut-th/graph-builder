function RenderTextFromHtml(element, text) {

    var basefontsize = element.attr("font-size");

    if (basefontsize !== null && basefontsize !== undefined) {
        var fontsize = basefontsize * 0.6;
        text = text.replace(/<sup>/g, "<tspan font-size=" + fontsize + " baseline-shift='super'>");
        text = text.replace(/<sub>/g, "<tspan font-size=" + fontsize + " baseline-shift='sub'>");
    } else {
        text = text.replace(/<sup>/g, "<tspan font-size=9 baseline-shift='super'>");
        text = text.replace(/<sub>/g, "<tspan font-size=9 baseline-shift='sub'>");
    }

    text = text.replace(/<[/]sup>/g, "</tspan>");
    text = text.replace(/<[/]sub>/g, "</tspan>");

    text = "<tspan>" + text + "</tspan>";

    element.html(text);
}

export default RenderTextFromHtml;