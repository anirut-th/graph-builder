import * as d3 from "d3";
import * as THREE from "three";
import * as dat from "dat.gui";
import * as d3chromatic from "d3-scale-chromatic";
import ConvertColorRgbStringToHex from "../common/ConvertColorRgbStringToHex";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls";
import { CSS3DRenderer, CSS3DObject } from "../../node_modules/three/examples/jsm/renderers/CSS3DRenderer";
import { CSS2DRenderer, CSS2DObject } from "../../node_modules/three/examples/jsm/renderers/CSS2DRenderer";
//CSS2DRenderer
//OrbitControls

function SurfaceGraph(elementId, option) {
    let frustumSize = option.camera_option.frustum_size;
    let aspect = option.width / option.height;
    let width = option.width;
    let height = option.height;
    let scene = new THREE.Scene();
    let legendScene = new THREE.Scene();
    let camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0, 2000);
    let legendCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0, 2000);

    let mainElement = document.getElementById(elementId);

    //Renderer for 3d surface
    let renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        antialias: true
    });
    renderer.localClippingEnabled = true;

    //Renderer for text label
    let labelRenderer = new CSS2DRenderer({
        preserveDrawingBuffer: true
    });
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    mainElement.appendChild(labelRenderer.domElement);

    //Use to camera control (zoom, pan, rotate)
    let controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.screenSpacePanning = true;
    if (option.iscontour && option.iscontour === true) {
        controls.enableRotate = false;
    }
    renderer.setSize(width, height);
    mainElement.appendChild(renderer.domElement); 

    animate()

    let geometry, material;

    let marginTop = "0em";
    let marginRight = "0em";
    let marginBottom = "0em";
    let marginLeft = "0em";

    let tickMarginTop = "0em";
    let tickMarginRight = "0em";
    let tickMarginBottom = "0em";
    let tickMarginLeft = "0em";
    //===============================================================
    //Create X-Axis (Label-based Axis)
    //===============================================================
    let xAxisParam = option.x_axis;
    if (xAxisParam.visible === null || xAxisParam.visible === undefined) { xAxisParam.visible = true; }
    if (xAxisParam.name_margin) {
        marginTop = xAxisParam.name_margin.top;
        marginRight = xAxisParam.name_margin.right;
        marginBottom = xAxisParam.name_margin.bottom;
        marginLeft = xAxisParam.name_margin.left;
    }
    if (xAxisParam.tick_margin) {
        tickMarginTop = xAxisParam.tick_margin.top;
        tickMarginRight = xAxisParam.tick_margin.right;
        tickMarginBottom = xAxisParam.tick_margin.bottom;
        tickMarginLeft = xAxisParam.tick_margin.left;
    }

    let xCount = xAxisParam.tick_array.length;
    material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(xCount - 1, 0, 0));
    let line = new THREE.Line(geometry, material);
    scene.add(line);

    //X-Axis name
    let axislabelDiv = document.createElement('div');
    axislabelDiv.className = 'label dark-gray';
    axislabelDiv.textContent = xAxisParam.name;
    axislabelDiv.style.marginTop = marginTop;
    axislabelDiv.style.marginRight = marginRight;
    axislabelDiv.style.marginBottom = marginBottom;
    axislabelDiv.style.marginLeft = marginLeft;
    axislabelDiv.style.fontSize = '1.2em';
    let axisLabel = new CSS2DObject(axislabelDiv);
    if (option.iscontour === true) {
        axisLabel.position.set(xCount / 2, 0, 0);
    } else {
        axisLabel.position.set(xCount / 2, 0, 0);
    }
    if (xAxisParam.name_position) {
        axisLabel.position.set(xAxisParam.name_position.x, xAxisParam.name_position.y, xAxisParam.name_position.z);
    }
    line.add(axisLabel);

    //Add ticklabel Label on x-axis
    if (option.showticklabel && option.showticklabel.x === true) {
        for (let i = 0; i <= xCount; i += xAxisParam.tick_size) {
            let lebelDiv = document.createElement('div');
            lebelDiv.className = 'label dark-gray';
            lebelDiv.textContent = xAxisParam.tick_array[i];
            lebelDiv.style.marginTop = tickMarginTop;
            lebelDiv.style.marginRight = tickMarginRight;
            lebelDiv.style.marginBottom = tickMarginBottom;
            lebelDiv.style.marginLeft = tickMarginLeft;
            let tickLabel = new CSS2DObject(lebelDiv);
            if (option.iscontour === true) {
                tickLabel.position.set(i, 0, 0);
            } else {
                tickLabel.position.set(i, 0, 1);
            }
            line.add(tickLabel);
        }
    }
    //===============================================================

    marginTop = "0em";
    marginRight = "0em";
    marginBottom = "0em";
    marginLeft = "0em";
    tickMarginTop = "0em";
    tickMarginRight = "0em";
    tickMarginBottom = "0em";
    tickMarginLeft = "0em";
    //===============================================================
    //Create Y-Axis (Value-based Axis)
    //===============================================================
    let yAxisParam = option.y_axis;
    if (yAxisParam.visible === null || yAxisParam.visible === undefined) { yAxisParam.visible = true; }
    if (yAxisParam.name_margin) {
        marginTop = yAxisParam.name_margin.top;
        marginRight = yAxisParam.name_margin.right;
        marginBottom = yAxisParam.name_margin.bottom;
        marginLeft = yAxisParam.name_margin.left;
    }
    let upperlength = (yAxisParam.scale * yAxisParam.max);
    let lowerlength = (yAxisParam.scale * yAxisParam.min);
    let yMiddle = (upperlength + lowerlength) / 2;

    if (yAxisParam.visible === true) {
        material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, lowerlength, 0));
        geometry.vertices.push(new THREE.Vector3(0, upperlength, 0));
        let line = new THREE.Line(geometry, material);
        scene.add(line);

        //Y-Axis name
        axislabelDiv = document.createElement('div');
        axislabelDiv.className = 'label dark-gray';
        axislabelDiv.textContent = yAxisParam.name;
        axislabelDiv.style.marginTop = marginTop;
        axislabelDiv.style.marginRight = marginRight;
        axislabelDiv.style.marginBottom = marginBottom;
        axislabelDiv.style.marginLeft = marginLeft;
        axislabelDiv.style.fontSize = '1.2em';
        axislabelDiv.style.transform = 'rotate(90deg)';
        axisLabel = new CSS2DObject(axislabelDiv);
        axisLabel.position.set(0, upperlength, 0);
        line.add(axisLabel);

        //Add tick label on y-axis
        if (option.showticklabel && option.showticklabel.y === true) {
            for (let i = yAxisParam.min; i <= yAxisParam.max; i += yAxisParam.tick_size) {
                let val = i * yAxisParam.scale;
                let lebelDiv = document.createElement('div');
                lebelDiv.className = 'label dark-gray';
                lebelDiv.textContent = i.toFixed(2);
                lebelDiv.style.marginLeft = '-1.5em';
                let tickLabel = new CSS2DObject(lebelDiv);
                tickLabel.position.set(0, val, 0);
                line.add(tickLabel);
            }
        }
    }
    //===============================================================

    marginTop = "0em";
    marginRight = "0em";
    marginBottom = "0em";
    marginLeft = "0em";
    //===============================================================
    //Create Z-Axis (Label-based Axis)
    //===============================================================
    let zAxisParam = option.z_axis;
    if (zAxisParam.visible === null || zAxisParam.visible === undefined) { zAxisParam.visible = true; }
    if (zAxisParam.name_margin) {
        marginTop = zAxisParam.name_margin.top;
        marginRight = zAxisParam.name_margin.right;
        marginBottom = zAxisParam.name_margin.bottom;
        marginLeft = zAxisParam.name_margin.left;
    }
    if (zAxisParam.tick_margin) {
        tickMarginTop = zAxisParam.tick_margin.top;
        tickMarginRight = zAxisParam.tick_margin.right;
        tickMarginBottom = zAxisParam.tick_margin.bottom;
        tickMarginLeft = zAxisParam.tick_margin.left;
    }
    let zCount = zAxisParam.tick_array.length;
    geometry = new THREE.Geometry();
    material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    geometry.vertices.push(new THREE.Vector3(xCount - 1, 0, 0));
    geometry.vertices.push(new THREE.Vector3(xCount - 1, 0, -zCount));
    line = new THREE.Line(geometry, material);
    scene.add(line);
    //Axis name
    axislabelDiv = document.createElement('div');
    axislabelDiv.className = 'label dark-gray';
    axislabelDiv.style.marginTop = marginTop;
    axislabelDiv.style.marginRight = marginRight;
    axislabelDiv.style.marginBottom = marginBottom;
    axislabelDiv.style.marginLeft = marginLeft;
    axislabelDiv.textContent = zAxisParam.name;
    axislabelDiv.style.fontSize = '1.2em';
    axisLabel = new CSS2DObject(axislabelDiv);
    axisLabel.position.set(xCount, 0, -zCount / 2);
    if (zAxisParam.name_position) {
        axisLabel.position.set(zAxisParam.name_position.x, zAxisParam.name_position.y, zAxisParam.name_position.z);
    }
    line.add(axisLabel);

    //Add ticklabel Label on z-axis
    if (option.showticklabel && option.showticklabel.z === true) {
        for (let i = 0; i <= xCount; i += xAxisParam.tick_size) {
            let lebelDiv = document.createElement('div');
            lebelDiv.className = 'label dark-gray';
            lebelDiv.textContent = zAxisParam.tick_array[i];
            lebelDiv.style.marginTop = tickMarginTop;
            lebelDiv.style.marginRight = tickMarginRight;
            lebelDiv.style.marginBottom = tickMarginBottom;
            lebelDiv.style.marginLeft = tickMarginLeft;
            let tickLabel = new CSS2DObject(lebelDiv);
            tickLabel.position.set(xCount, 0, -i);
            line.add(tickLabel);
        }
    }
    //===============================================================

    //===============================================================
    //Create GUI
    //===============================================================
    let guioptions = {
        top: function () {
            camera.position.z = -zCount / 2;
            camera.position.x = xCount / 2;
            camera.position.y = 200;
            controls.target = new THREE.Vector3(xCount / 2, 0, -zCount / 2);
        },
        front: function () {
            camera.position.z = 200;
            camera.position.x = xCount / 2;
            camera.position.y = yMiddle;
            controls.target = new THREE.Vector3(xCount / 2, yMiddle, 0);
        },
        side: function () {
            camera.position.z = -zCount / 2;
            camera.position.x = 200;
            camera.position.y = yMiddle;
            controls.target = new THREE.Vector3(0, yMiddle, -zCount / 2);
        }
    };

    let gui = new dat.GUI({ autoPlace: false, width: 70 });
    gui.add(guioptions, 'top');
    gui.add(guioptions, 'front');
    gui.add(guioptions, 'side');
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.left = "15";
    gui.domElement.style.width = "40px";
    let guiContainer = document.getElementById(elementId);
    guiContainer.appendChild(gui.domElement);

    //============================================================
    // Config Camera
    //============================================================
    let camera_option = option.camera_option;
    if(option.iscontour === true) {
        camera.position.z = -zCount / 2;
        camera.position.x = xCount / 2;
        camera.position.y = 200;
        controls.target = new THREE.Vector3(xCount / 2, 0, -zCount / 2);
    } else {
        if (camera_option === null || camera_option === undefined) {
            camera.position.z = 1;
            camera.position.y = 1;
            camera.position.x = 1;
            controls.target = new THREE.Vector3(0, 0, 0);
        } else {
            camera.position.z = camera_option.init_pos.z;
            camera.position.y = camera_option.init_pos.y;
            camera.position.x = camera_option.init_pos.x;

            if (camera_option.lookat_pos === null || camera_option.lookat_pos === undefined) {
                camera.position.z = 200;
                camera.position.x = xCount / 2;
                camera.position.y = yMiddle;
                controls.target = new THREE.Vector3(xCount / 2, yMiddle, 0);
            } else {
                controls.target = new THREE.Vector3(camera_option.lookat_pos.x, camera_option.lookat_pos.y, camera_option.lookat_pos.z);
            }
        }
    }

    //===============================================================
    //Create grid line
    //===============================================================
    if (option.showgrid === true) {
        for (let i = 0; i <= xCount; i += 1) {
            geometry = new THREE.Geometry();
            material = new THREE.LineBasicMaterial({ color: 0xdddddd, opacity: 0.4, transparent: true });
            geometry.vertices.push(new THREE.Vector3(i, 0, 0));
            geometry.vertices.push(new THREE.Vector3(i, 0, -zCount));
            line = new THREE.Line(geometry, material);
            scene.add(line);
        }
        for (let i = 0; i <= zCount; i += 1) {
            geometry = new THREE.Geometry();
            material = new THREE.LineBasicMaterial({ color: 0xdddddd, opacity: 0.4, transparent: true });
            geometry.vertices.push(new THREE.Vector3(0, 0, -i));
            geometry.vertices.push(new THREE.Vector3(xCount, 0, -i));
            line = new THREE.Line(geometry, material);
            scene.add(line);
        }

        for (let i = yAxisParam.min; i <= yAxisParam.max; i += yAxisParam.tick_size) {
            geometry = new THREE.Geometry();
            material = new THREE.LineBasicMaterial({ color: 0xdddddd, opacity: 0.7, transparent: true });
            geometry.vertices.push(new THREE.Vector3(0, i * yAxisParam.scale, 0));
            geometry.vertices.push(new THREE.Vector3(0, i * yAxisParam.scale, -zCount));
            line = new THREE.Line(geometry, material);
            scene.add(line);

            geometry = new THREE.Geometry();
            material = new THREE.LineBasicMaterial({ color: 0xdddddd, opacity: 0.7, transparent: true });
            geometry.vertices.push(new THREE.Vector3(0, i * yAxisParam.scale, -zCount));
            geometry.vertices.push(new THREE.Vector3(xCount, i * yAxisParam.scale, -zCount));
            line = new THREE.Line(geometry, material);
            scene.add(line);
        }
    }

    let color = option.color;
    let materialArray = [];
    let legend_data = [];


    if (option.color === null || option.color === undefined || option.color === "") {
        if (option.data_category !== null && option.data_category !== undefined && option.data_category.length > 0) {
            let colormap = d3.scaleSequential([yAxisParam.min, yAxisParam.max], d3.interpolateSpectral);
            //let color_step = colormap.length / option.data_category.length
            for (let c in option.data_category) {
                //let cat_color = colormap[Math.floor(c * color_step)];
                let cat_lower = option.data_category[c].lower;
                let cat_upper = option.data_category[c].upper;

                cat_lower = cat_lower - 1e-7;

                let cat_name = option.data_category[c].name;
                let cat_color = ConvertColorRgbStringToHex(colormap(cat_lower));

                materialArray.push(new THREE.MeshBasicMaterial({
                    color: parseInt(cat_color.replace("#", "0x")),
                    side: THREE.DoubleSide,
                    opacity: 1,
                    //transparent: true,
                    clippingPlanes: [
                        new THREE.Plane(new THREE.Vector3(0, 1, 0), -cat_lower * yAxisParam.scale),
                        new THREE.Plane(new THREE.Vector3(0, -1, 0), cat_upper * yAxisParam.scale),
                    ],
                    clipShadows: true,
                    clipIntersection: false,
                    //stencilWrite: true,
                    //stencilRef: 0,
                    //stencilFunc: THREE.NotEqualStencilFunc,
                    //stencilFail: THREE.ReplaceStencilOp,
                    //stencilZFail: THREE.ReplaceStencilOp,
                    //stencilZPass: THREE.ReplaceStencilOp,
                }));

                legend_data.push({
                    label: cat_name,
                    color: cat_color
                });
            }

        }
        else {
            materialArray.push(new THREE.MeshBasicMaterial({
                color: 0xffc57e,
                side: THREE.DoubleSide,
                opacity: 1,
            }));
        }
    } else {
        materialArray.push(new THREE.MeshBasicMaterial({
            color: option.color.replace("#", "0x"),
            side: THREE.DoubleSide,
            opacity: 1,
        }));
    }
    
    if (option.showlegend === true) {
        //Create graph legend
        let legendWidth = option.width * 0.17;
        let legendArea = d3.select("#" + elementId)
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", 10 + legend_data.length * 30)
        .attr("transform", "translate("+(option.width-legendWidth)+", "+(-option.height + 10)+")")

        legendArea.append("text").style("dominant-baseline", "hanging").attr("transform",  "translate(10, 0)").text(option.y_axis.name);

        let legendItem = legendArea.selectAll("g").data(legend_data)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function(d, i){ return "translate(10, " + (10 + (i * 30)) + ")" } )

        legendItem.append("rect")
        .attr("x", 0)
        .attr("y", 10)
        .attr("width", 15)
        .attr("height", 15)
        .attr("data-color", function(d) { return d.color; })
        .style("cursor", "pointer")
        .style("fill", function(d) { return d.color; })

        legendItem.append("text")
        .attr("x", 30)
        .attr("y", 12)
        .style("dominant-baseline", "hanging")
        .attr("class", "legend-name")
        .text(function(d){return d.label;})
    }
    //Render a graph from data
    let graphGeometry = new THREE.Geometry();
    let points = option.data;
    let index = 0;
    for (let x = 1; x <= xCount - 1; x++) {
        for (let z = 1; z <= zCount - 1; z++) {
            let p1 = points.filter(function (item) {
                return item.x === x - 1 && item.z === z - 1
            });

            let p2 = points.filter(function (item) {
                return item.x === x && item.z === z - 1
            });

            let p3 = points.filter(function (item) {
                return item.x === x - 1 && item.z === z
            });

            let p4 = points.filter(function (item) {
                return item.x === x && item.z === z
            });

            let p1_index = index;
            graphGeometry.vertices.push(new THREE.Vector3(p1[0].x, p1[0].y * yAxisParam.scale, -p1[0].z));
            index++;

            let p2_index = index;
            graphGeometry.vertices.push(new THREE.Vector3(p2[0].x, p2[0].y * yAxisParam.scale, -p2[0].z));
            index++;

            let p3_index = index;
            graphGeometry.vertices.push(new THREE.Vector3(p3[0].x, p3[0].y * yAxisParam.scale, -p3[0].z));
            index++;

            let p4_index = index;
            graphGeometry.vertices.push(new THREE.Vector3(p4[0].x, p4[0].y * yAxisParam.scale, -p4[0].z));
            index++;

            let face1 = new THREE.Face3(p1_index, p2_index, p3_index, null, null, 0);
            let face2 = new THREE.Face3(p2_index, p3_index, p4_index, null, null, 0);
            graphGeometry.faces.push(face1);
            graphGeometry.faces.push(face2);
        }
    }
    //the face normals and vertex normals can be calculated automatically if not supplied above
    graphGeometry.computeFaceNormals();
    graphGeometry.computeVertexNormals();
    //scene.add(new THREE.Mesh(geometry, materialArray[3]));

    for (let i in materialArray) {
        scene.add(new THREE.Mesh(graphGeometry, materialArray[i]));
    }

    scene.background = new THREE.Color(0xeeeeee);

    // renderer.render(scene, camera);
    // renderer.render(legendScene, legendCamera);
    function animate() {
        requestAnimationFrame(animate);
        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
        renderer.autoClear = false;
        labelRenderer.render(legendScene, legendCamera);
        renderer.autoClear = true;
    }
    animate();
}

export default SurfaceGraph;