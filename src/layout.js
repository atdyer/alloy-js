import * as d3 from 'd3';

export {layout};

function layout () {

    let selection,
        groups = [];

    let type = 'draggable',
        sim = d3.forceSimulation()
            .alphaDecay(0.1)
            .force('collide', d3.forceCollide(75))
            .force('link', d3.forceLink())
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .stop();

    function _layout (svg) {

        // Sort the groups by index
        groups.sort(function (a, b) {
            return a.index() - b.index();
        });

        // Make sure layout type is up-to-date
        set_layout_type(type);

        // Give each data point an initial position
        initialize_layout(svg, groups);

        // Bind data to visual elements
        selection = svg
            .selectAll('.group')
            .data(groups, function (d) { console.log(d); return d.label(); });

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('id', function (d) { return d.label(); })
            .attr('class', 'group')
            .merge(selection);

        selection.each(function (g) {
            g(d3.select(this));
            g.reposition();
        });

        // Respond to events
        groups.forEach(function (g) {
            g.reposition();
            g.drag()
                .on('start.layout', dragstarted)
                .on('drag.layout', dragged)
                .on('end.layout', dragended);
        });

        // Optionally start the simulation
        if (type === 'simulation') {
            sim.on('tick', update)
                .restart();
        }

        return selection;

    }

    _layout.groups = function (_) {
        return arguments.length ? (groups = _, _layout) : groups;
    };

    _layout.type = function (_) {
        return arguments.length ? set_layout_type(_) : type;
    };


    function dragstarted (d) {
        if (type === 'simulation' && !d3.event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        update();
    }

    function dragended (d) {
        if (type === 'simulation' && !d3.event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
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

        // Any atom that is given a pre-defined starting position
        // will be fixed in place during the simulation
        const width = parseInt(svg.style('width'));
        const height = parseInt(svg.style('height'));
        atoms.forEach(function (a) {
            if (('x' in a) && ('y' in a)) {
                console.log(a);
                a.fx = a.x(width);
                a.fy = a.y(height);
            }
        });

        // Run the layout simulation to get initial positions
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

        // Set up the runtime simulation
        sim.nodes(atoms);
        sim.force('x').x(cx);
        sim.force('y').y(cy);
        sim.force('link').links(tuples);

        // Clean up
        atoms.forEach(function (a) {
            if ('fx' in a) a.fx = null;
            if ('fy' in a) a.fy = null;
        });

    }

    function set_layout_type (t) {

        if (t === 'static') {
            type = t;
            groups.forEach(function (g) {
                g.draggable(false);
            });
        }
        if (t === 'draggable') {
            type = t;
            groups.forEach(function (g) {
                g.draggable(true);
            });
        }
        if (t === 'simulation') {
            type = t;
            groups.forEach(function (g) {
                g.draggable(true);
            });
        }
        return _layout;
    }

    function update () {
        groups.forEach(function (g) {
            g.reposition();
        });
    }


    return _layout;

}