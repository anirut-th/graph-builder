function initializeOption(option) {
    if(option === null || option === undefined || option === "") {
        option = {};
    }

    if (option.legend === null || option.legend === undefined || option.legend === "") {
        option.legend = {
            position: "right",
            width: 500,
            line_height: 45,
            padding: {
                top: 0,
                bottom: 0,
                left: 10,
                right: 10
            }
        }
    }

    if (option.series === null || option.series === undefined || option.series === "") {
        option.series = [];
    }

    return option;
}
export default initializeOption;