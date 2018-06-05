export {group};

function group () {

    let data,
        shape;

    let groups,
        id;

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
            .call(shape);

        return groups;

    }

    _group.id = function (_) {
        return arguments.length ? (id = _, _group) : id;
    };

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    return _group;

}