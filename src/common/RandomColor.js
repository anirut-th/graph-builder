function RandomColor() {
    var varters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += varters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export default RandomColor;