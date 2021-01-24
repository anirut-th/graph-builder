import * as d3 from "d3";
function CreateAxis(valMin, valMax, posMin, posMax, scale) {
    if(scale === "linear") {
        let axis = d3.scaleLinear()
                        .domain([valMin, valMax])
                        .range([posMin, posMax]);
        return axis;
    } else if (scale === "log") {
        let axis = d3.scaleLog()
                        .domain([Math.pow(10, valMin), Math.pow(10, valMax + 1)])
                        .range([posMin, posMax]).base(10);
        return axis;
    } else {
        return null;
    }
}

export default CreateAxis;