import * as d3 from 'd3';

export {layout};

function layout () {

    let selection,
        groups = [];

    function _layout (svg) {

        // Sort the groups by index
        sort_groups();

        // Give each data point an initial position
        initialize_layout(svg, groups);

        // Bind data to visual elements
        selection = svg
            .selectAll('g')
            .data(groups);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('id', function (d) { return d.label(); })
            .merge(selection);

        selection.each(function (g) {
            g(d3.select(this));
            g.reposition();
        });

        // Respond to events
        groups.forEach(function (g) {
            g.reposition();
            g.drag().on('drag.layout', dragged);
        });

        return selection;

    }

    _layout.groups = function (_) {
        return arguments.length ? (groups = _, _layout) : groups;
    };


    function dragged () {
        groups.forEach(function (g) {
            g.reposition();
        });
    }

    function initialize_layout (svg, groups) {

        const atoms = [];
        const tuples = [];

        groups.forEach(function (g) {

            // Only data that is going to be rendered will
            // be part of the simulation
            const data = g.data();
            data.forEach(function (d) {
                if (d.source && d.target) {
                    tuples.push(d);
                    if (atoms.indexOf(d.source) === -1)
                        atoms.push(d.source);
                    if (atoms.indexOf(d.target) === -1)
                        atoms.push(d.target);
                } else {
                    if (atoms.indexOf(d) === -1)
                        atoms.push(d);
                }
            });

        });

        const cx = parseInt(svg.style('width')) / 2,
            cy = parseInt(svg.style('height')) / 2;

        const simulation = d3.forceSimulation(atoms)
            .force('center', d3.forceCenter(cx, cy))
            .force('collide', d3.forceCollide(65))
            .force('charge', d3.forceManyBody().strength(-80))
            .force('links', d3.forceLink(tuples).distance(150))
            .force('x', d3.forceX(cx))
            .force('y', d3.forceY(cy))
            .stop();

        let i = 0;
        const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
        for (; i < n; ++i) {
            simulation.tick();
        }

    }

    function sort_groups () {
        groups.sort(function (a, b) {
            return a.index() > b.index();
        });
    }


    return _layout;

}