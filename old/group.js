export { group };

function group () {

    let data,
        shape,
        selection,
        simulation;

    let index,
        id,
        label;

    function _group (g) {

        if (data && shape) {

            // Bind the data (using shape) and get the selected visual elements
            selection = shape(g, data);

        }

        return selection;

    }

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.drag = function () {
        return shape.drag();
    };

    _group.draggable = function (_) {
        return shape.draggable(_);
    };

    _group.id = function (_) {
        return arguments.length ? (id = _, _group) : id;
    };

    _group.index = function (_) {
        return arguments.length ? (index = _, _group) : index;
    };

    _group.label = function (_) {
        return arguments.length ? (label = _, _group) : label;
    };

    _group.reposition = function () {
        if (shape)
            shape.reposition();
        return _group;
    };

    _group.selection = function () {
        return selection;
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    _group.simulation = function (_) {
        return arguments.length ? (simulation = _, _group) : simulation;
    };


    return _group;

}