function ConvertColorRgbStringToHex(rgb) {
    rgb = rgb.replace("rgb", "");
    rgb = rgb.replace("(", "");
    rgb = rgb.replace(")", "");
    rgb = rgb.split(",");
    var r = parseInt(rgb[0]).toString(16);
    var g = parseInt(rgb[1]).toString(16);
    var b = parseInt(rgb[2]).toString(16);

    if (r.length < 2) {
       r = "0" + r;
    }
    if (g.length < 2) {
       g = "0" + g;
    }
    if (b.length < 2) {
       b = "0" + b;
    }

    return "#" + r + g + b;
}

export default ConvertColorRgbStringToHex;