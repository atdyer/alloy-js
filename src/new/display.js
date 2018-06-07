import * as d3 from 'd3';
import {group} from './group';
import {circle} from './shapes/circle';
import {line} from './shapes/line';
import {rectangle} from './shapes/rectangle';
import {label} from './label';

export {display};

function display (data) {

    let groups = [];
    let next_index = -1;

    function _display (svg) {

        layout(svg);

        let selection = svg
            .selectAll('.alloy-group')
            .data(groups, function (d) { return d.id(); });

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('class', 'alloy-group')
            .attr('id', function (d) { return d.id(); })
            .merge(selection);

        selection.each(function (group) {
            d3.select(this).call(group);
        });

        return selection;

    }

    _display.style = function (json) {

        groups = [];

        data.clear_projections();

        if (json && json['projections']) {

            d3.entries(json['projections']).forEach(function (p) {

                const sig = p.key;
                const atm = p.value;

                data.set_projection(sig, atm);

            });

        }

        if (json && json['groups']) {

            d3.entries(json['groups']).forEach(function (g) {

                const grp = g.value;
                const idx = grp.index || (next_index += 1, next_index);
                const gid = g.key || 'alloy-group-' + idx;

                const shp = build_shape(grp.shape);
                const dat = build_data(grp.data, data);
                const lbl = build_label(grp.label, dat);

                groups.push(
                    group()
                        .id(gid)
                        .index(idx)
                        .data(dat)
                        .shape(shp)
                        .label(lbl)
                        .on('drag.group', reposition)
                );


            });

            groups.sort(function (a, b) {

                return a.index() - b.index();

            });

        } else {

            _display.style({
                groups: {
                    atoms: {
                        shape: 'circle',
                        data: 'atoms',
                        index: 1
                    },
                    tuples: {
                        shape: 'line',
                        data: 'tuples',
                        index: 0
                    }
                }
            });

        }

        return _display;

    };


    function reposition () {
        groups.forEach(function (g) {
            g.reposition();
        });
    }

    function layout (svg) {

        let atoms = data.atoms();
        let tuples = data.tuples();

        let cx = parseInt(svg.style('width')) / 2;
        let cy = parseInt(svg.style('height')) / 2;

        atoms.forEach(function (a) {
            if ('x' in a) a.fx = a.x;
            if ('y' in a) a.fy = a.y;
        });

        let simulation = d3.forceSimulation(atoms)
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

        atoms.forEach(function (a) {
            if ('fx' in a) delete a.fx;
            if ('fy' in a) delete a.fy;
        });

    }


    return _display.style();

}

function apply_attrs (shape, attributes) {
    d3.entries(attributes).forEach(function (attr) {
        shape.attr(attr.key, attr.value);
    });
}

function apply_styles (shape, styles) {
    d3.entries(styles).forEach(function (style) {
        shape.style(style.key, style.value);
    });
}

function build_circle (s) {
    const c = default_circle();
    apply_attrs(c, s['attribute']);
    apply_styles(c, s['style']);
    return c;
}

function build_data (d, data) {

    if (d && data) {

        if (typeof d === 'string') d = { source: d };
        return (
            d.source === 'atoms'
                ? data.atoms()
                : d.source === 'tuples'
                    ? data.tuples()
                    : []
        );

    }

    return [];

}

function build_label (l, data) {
    const lbl = default_label(data);
    if (l) {
        apply_attrs(lbl, l['attribute']);
        apply_styles(lbl, l['style']);
    }
    return lbl;
}

function build_line (s) {
    const l = default_line();
    apply_attrs(l, s['attribute']);
    apply_styles(l, s['style']);
    return l;
}

function build_rectangle (s) {
    const r = default_rectangle();
    apply_attrs(r, s['attribute']);
    apply_styles(r, s['style']);
    return r;
}

function build_shape (s) {

    if (s) {

        if (typeof s === 'string') s = { type: s };
        return (
            s.type === 'circle'
                ? build_circle(s)
                : s.type === 'rectangle'
                    ? build_rectangle(s)
                    : s.type === 'line'
                        ? build_line(s)
                        : null
        );

    }

}

function default_circle () {
    return circle()
        .attr('r', 42)
        .style('fill', '#304148')
        .style('stroke', '#f8f8f8')
        .style('stroke-width', 2);
}

function default_label (data) {
    const l = label()
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', '#f8f8f2')
        .style('font-family', 'monospace')
        .style('font-size', 18)
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('-webkit-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none');
    if (data && data.length && data[0].atoms) {
        l.style('fill', '#121e25')
            .style('font-weight', 'lighter')
            .style('font-size', '10px');
    }
    return l;
}

function default_line () {
    return line()
        .style('stroke', '#304148')
        .style('stroke-width', 1);
}

function default_rectangle () {
    return rectangle()
        .attr('width', 100)
        .attr('height', 70)
        .style('fill', '#304148')
        .style('stroke', '#f8f8f8')
        .style('stroke-width', 2)
}