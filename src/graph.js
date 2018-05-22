function graph () {

    var atoms,
        tuples;

    var selection,
        groups = [];

    var force_collide = d3.forceCollide(45),
        force_links = d3.forceLink(),
        simulation = d3.forceSimulation()
            .force('collide', force_collide)
            .force('links', force_links);


    function _graph (svg) {

        // Center the simulation in the svg
        simulation.force('center', d3.forceCenter(
            parseInt(svg.style('width')) / 2.0,
            parseInt(svg.style('height')) / 2.0
        ));

        // Determine group ordering
        groups.sort(index_sort);

        selection = svg
            .selectAll('g')
            .data(groups);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('id', function (d) { return d.label; })
            .merge(selection);

        selection.each(function (d) {
            var group_selection = d3.select(this);
            d.group(group_selection);
        });

        simulation.on('tick', tick);

        return selection;

    }

    _graph.atoms = function (_) {
        if (!arguments.length) return atoms;
        atoms = _;
        simulation.nodes(atoms);
        return _graph;
    };

    _graph.group = function (_) {
        if (arguments.length === 1) {
            return groups.find(function (g) {
                return g.label === _;
            });
        }
        if (arguments.length === 3) {
            var new_group = {
                index: arguments[0],
                label: arguments[1],
                group: arguments[2]
            };
            groups.push(new_group);
        }
        return _graph;
    };

    _graph.links = function (_) {
        return arguments.length ? (force_links.links(_), _graph) : force_links.links();
    };

    _graph.simulation = function (_) {
        return arguments.length ? (simulation = _, _graph) : simulation;
    };

    _graph.tuples = function (_) {
        if (!arguments.length) return tuples;
        tuples = _;
        return _graph;
    };


    function tick () {
        groups.forEach(function (group) {
            group.group.reposition();
        });
    }


    return _graph;

}