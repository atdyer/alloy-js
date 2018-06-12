import * as d3 from 'd3';
import {group} from './group';
import {circle} from './shapes/circle';
import {line} from './shapes/line';
import {rectangle} from './shapes/rectangle';
import {label} from './label';
import {place_anchors} from "./anchor";
import {atom_is_sig} from "./filters/atom";
import {tuple_is_field} from "./filters/tuple";
import {curve_bundle_left, curve_bundle_right} from "./arcs/bundle";
import {arc_straight} from "./arcs";

export {display};

function display (data) {

    let groups = [];

    function _display (svg) {

        reorder('indexing');
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
            .merge(selection)
            .order();

        selection.each(function (group) {
            d3.select(this).call(group);
        });

        reorder('rendering');
        reposition();

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

        if (json && json['layout']) {

            const config = json['layout'];

            if (config['positions']) {

                const atoms = data.atoms();

                d3.entries(config['positions']).forEach(function (p) {

                    const atm = atoms.find(a => a.id === p.key);
                    const pos = p.value;
                    if (atm) {
                        if ('x' in pos) atm.x = build_function(pos['x']);
                        if ('y' in pos) atm.y = build_function(pos['y']);
                    }

                });

            }

        }

        if (json && json['groups']) {

            d3.entries(json['groups']).forEach(function (g) {

                const gid = g.key;
                const grp = g.value;
                const idx = grp.index || 0;

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

            place_anchors(data.tuples());

        } else {

            _display.style({
                groups: {
                    atoms: {
                        shape: 'rectangle',
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

    function reorder (method) {

        if (method === 'indexing') {
            groups.sort(function (a, b) {
                return a.index() - b.index();
            });
        }

        if (method === 'rendering') {
            groups.sort(function (a, b) {
                return a.dataType() === 'atom'
                    ? -1
                    : b.dataType() === 'atom'
                        ? 1
                        : 0;
            });
        }

    }

    function reposition () {
        groups.forEach(function (g) {
            g.reposition();
        });
    }

    function layout (svg) {

        let atoms = data.atoms();
        let tuples = data.tuples();

        let width = parseInt(svg.style('width'));
        let height = parseInt(svg.style('height'));
        let cx = width / 2;
        let cy = height / 2;

        atoms.forEach(function (a) {
            if ('x' in a) {
                a.fx = typeof a.x === 'function'
                    ? a.x.call(svg, width)
                    : a.x;
            }
            if ('y' in a) {
                a.fy = typeof a.y === 'function'
                    ? a.y.call(svg, height)
                    : a.y;
            }
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
        let key = style.key;
        let value = parse_value(style.value);
        shape.style(key, value);
    });
}

function build_circle (s) {
    const c = default_circle();
    apply_attrs(c, s['attribute']);
    apply_styles(c, s['style']);
    return c;
}

function build_curve (c) {
    if (typeof c === 'string') {
        c = {type: c};
    }
    if (c.type === 'bundle-right') {
        let beta = c.beta !== undefined ? c.beta : 0.3;
        return curve_bundle_right(beta);
    }
    if (c.type === 'bundle-left') {
        let beta = c.beta !== undefined ? c.beta : 0.3;
        return curve_bundle_left(beta);
    }
    return arc_straight;
}

function build_data (d, data) {

    if (d && data) {

        if (typeof d === 'string') d = { source: d };
        const unfiltered_data =
            d.source === 'atoms'
                ? data.atoms()
                : d.source === 'tuples'
                    ? data.tuples()
                    : [];
        return d.filter
            ? unfiltered_data.filter(build_filter(d.filter))
            : unfiltered_data;

    }

    return [];

}

function build_filter (f) {
    if (f) {
        if (f['signature'])
            return atom_is_sig(f['signature']);
        if (f['field'])
            return tuple_is_field(f['field']);
    }
    return function () { return true; };
}

function build_function (code) {
    return typeof code === 'string'
        ? Function('"use strict"; return ' + code)()
        : function () { return code; };
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
    if (s['curve']) l.curve(build_curve(s['curve']));
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
        .style('stroke', 'none');
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
        .style('stroke', 'none');
}

function parse_value (v) {
    if (~v.indexOf('function') || ~v.indexOf('=>')) {
        return build_function(v);
    }
    return v;
}