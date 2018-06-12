export {group};

function group () {

    let data,
        shape;

    let groups,
        id,
        index;

    let _label,
        _drag = d3.drag()
            .on('drag.shape', dragged);

    _group.on = _drag.on;

    function _group (selection) {

        groups = selection.selectAll('.alloy-shape')
            .data(g => g.data(), d => d.id);

        groups
            .exit()
            .remove();

        groups = groups
            .enter()
            .append('g')
            .attr('class', 'alloy-shape')
            .attr('id', function (d) { return d.id; })
            .merge(groups)
            .call(shape)
            .call(_drag);

        if (_label) {
            groups.call(_label);
        }

        return groups;

    }

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.dataType = function () {
        return data && data.length ? data[0].type : null;
    };

    _group.id = function (_) {
        return arguments.length ? (id = _, _group) : id;
    };

    _group.index = function (_) {
        return arguments.length ? (index = +_, _group) : index;
    };

    _group.label = function (_) {
        return arguments.length ? (_label = _, _group) : _label;
    };

    _group.on = function () {
        _drag.on.apply(null, arguments);
        return _group;
    };

    _group.reposition = function () {
        if (shape) shape.reposition();
        _label.reposition();
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    return _group;


    function dragged (d) {
        d.x = (d.x || 0) + d3.event.dx;
        d.y = (d.y || 0) + d3.event.dy;
    }

}