import {label} from './label'

export {group};

function group () {

    let data,
        shape;

    let groups,
        id;

    let labeller = label()
        .style('fill', 'red');
    let dragger = d3.drag()
        .on('drag.shape', dragged);

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
            .call(labeller)
            .call(dragger);

        return groups;

    }

    _group.id = function (_) {
        return arguments.length ? (id = _, _group) : id;
    };

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.reposition = function () {
        if (shape) shape.reposition();
        labeller.reposition();
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    return _group;


    function dragged (d) {
        d.x = (d.x || 0) + d3.event.dx;
        d.y = (d.y || 0) + d3.event.dy;
        _group.reposition();
    }

}