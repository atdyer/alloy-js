import * as d3 from 'd3';

export {group};

function group () {

    let data,
        shape,
        anchor;

    let groups,
        id,
        index;
    
    let attributes = d3.map(),
        styles = d3.map();

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

        attributes.each(function (value, key) {
            groups.attr(key, value);
        });

        styles.each(function (value, key) {
            groups.style(key, value);
        });

        return groups;

    }

    _group.anchor = function (_) {
        return arguments.length ? (anchor = _, _group) : anchor;
    };

    _group.attr = function (name, value) {
        return arguments.length > 1
            ? (groups
                ? groups.attr(name, value)
                : attributes.set(name, value),
                _group)
            : groups
                ? groups.attr(name)
                : attributes.get(name);
    };
    
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
        if (anchor) bind_anchors();
        if (shape) shape.reposition();
        _label.reposition();
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };
    
    _group.style = function (name, value) {
        return arguments.length > 1
            ? (groups
                ? groups.style(name, value)
                : styles.set(name, value),
                _group)
            : groups
                ? groups.style(name)
                : styles.get(name);
    };

    return _group;


    function bind_anchors () {

        if (groups) {

            groups.each(function (d) {

                const anc = anchor.data().find(function (datum) {
                    return array_equal(d.projection, datum.projection)
                });

                if (anc) {
                    d.x = () => anc.anchor.x;
                    d.y = () => anc.anchor.y;
                }
            });

        }

    }

    function dragged (d) {
        d.x = (d.x || 0) + d3.event.dx;
        d.y = (d.y || 0) + d3.event.dy;
    }

}


function array_equal (a, b) {
    return Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length
            ? a.every((v, i) => b[i] === v)
            : false
        : false;
}