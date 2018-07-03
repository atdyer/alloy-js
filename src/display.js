import * as d3 from 'd3';
import {group} from './group';
import {circle} from './shapes/circle';
import {line} from './shapes/line';
import {rectangle} from './shapes/rectangle';
import {aliases, label} from './label';
import {place_group_anchors, place_tuple_anchors} from "./anchor";
import {curve_bundle_left, curve_bundle_right} from "./arcs/bundle";
import {arc_straight} from "./arcs";
import {is_signature, is_atom, is_signature_or_field, is_tuple, is_field} from "./filters";

export {display};

function display (data) {

    let groups = [];
    let functions = d3.map();
    let zoom = d3.zoom()
        .scaleExtent([1/2, 8]);


    function _display (svg) {

        reorder('indexing');

        // layout_row(svg);
        // layout_dagre(svg);
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

        svg.call(zoom);

        return selection;

    }

    _display.style = function (json) {

        groups = [];

        data.clear_projections();

        if (json) {

            if (json['aliases']) apply_aliases(json['aliases']);
            if (json['projections']) apply_projections(json['projections'], data);
            if (json['layout']) apply_layout(json['layout'], data);
            if (json['functions']) functions = build_functions(json['functions']);
            groups = build_groups(json['groups'] || default_groups(), data);

        } else {

            _display.style({
                groups: default_groups()
            });

        }

        return _display;

    };

    function apply_layout (layout, data) {

        if (layout['positions']) {

            const atoms = data.atoms();

            d3.entries(layout['positions']).forEach(function (p) {

                const atm = atoms.find(a => a.id === p.key);
                const pos = p.value;
                if (atm) {
                    if ('x' in pos) atm.x = parse_value(pos['x']);
                    if ('y' in pos) atm.y = parse_value(pos['y']);
                }

            });

        }

        if (layout['zoom'] === 'yes')
            zoom.on('zoom', zoomed);
        else
            zoom.on('zoom', null);

    }

    function apply_projections (projections, data) {

        d3.entries(projections).forEach(function (p) {

            const sig = p.key;
            const atm = p.value;

            data.set_projection(sig, atm);

        });

    }

    function build_functions (json) {

        const functions = d3.map();

        d3.entries(json).forEach(function (f) {

            const name = '+' + f.key;
            const func = build_function(f.value);

            if (!func || func instanceof Error) {
                console.log('Unable to create function ' + name);
                console.log(func.message);
                functions.set(name, () => null);
            } else {
                functions.set(name, func);
            }

        });

        return functions;

    }

    function build_groups (json, data) {

        const groups = [];

        d3.entries(json).forEach(function (g) {

            const gid = g.key;
            const grp = g.value;
            const idx = grp.index || 0;

            const shp = build_shape(grp.shape);
            const dat = build_data(grp.data, data);
            const lbl = build_label(grp.label, dat);

            const groop = group()
                .id(gid)
                .index(idx)
                .data(dat)
                .shape(shp)
                .label(lbl)
                .anchor(grp.anchor)
                .on('drag.group', reposition);

            apply_attrs(groop, grp['attr']);
            apply_styles(groop, grp['style']);

            groups.push(groop);

        });

        place_tuple_anchors(data.tuples());
        place_group_anchors(groups);

        return groups;

    }

    function layout_dagre (svg) {

        let atoms = data.atoms();
        let tuples = data.tuples();

        let width = parseInt(svg.style('width'));
        let height = parseInt(svg.style('height'));

        let g = new dagre.graphlib.Graph({
            directed: true
        });

        let graph_obj = {};

        g.setGraph(graph_obj);
        g.setDefaultEdgeLabel(function () { return {}; });

        atoms.forEach(function (atom) {
            g.setNode(atom.id, {
                label: atom.id,
                width: 100,
                height: 70
            });
        });

        tuples.forEach(function (tuple) {
            g.setEdge(tuple.source.id, tuple.target.id);
        });

        dagre.layout(g);

        let graph_width = graph_obj.width;
        let graph_height = graph_obj.height;

        let dx = (width - graph_width) / 2;
        let dy = (height - graph_height) /2;

        g.nodes().forEach(function (n) {
            const node = g.node(n);
            const atom = atoms.find(a => a.id === n);
            if (atom) {
                atom.x = node.x + dx;
                atom.y = node.y + dy;
            }
        });

    }

    function layout_row (svg) {

        let atoms = data.atoms();

        let width = parseInt(svg.style('width'));
        let height = parseInt(svg.style('height'));

        // Count signatures
        let sigs = d3.map();
        atoms.forEach(function (atom) {
            atom.signatures.forEach(function (s) {
                if (!sigs.has(s)) {
                    sigs.set(s, 0);
                }
                sigs.set(s, sigs.get(s) + 1);
            });
        });

        let sigset = d3.set();
        atoms.forEach(function (atom) {
            let idx = 0;
            let fnd = false;
            atom.signatures.forEach(function (s, i) {
                if (sigs.get(s) > 1 && !fnd) {
                    idx = i;
                    fnd = true;
                }
            });
            if (fnd) {
                sigset.add(atom.signatures[idx]);
            }
        });

        sigs.clear();

        let interval = height / (sigset.size() + 1);
        sigset.values().forEach(function (s, i) {
            sigs.set(s, (i+1) * interval);
        });

        let simulation = d3.forceSimulation(atoms)
            .force('collide', d3.forceCollide(65))
            .force('x', d3.forceX(width / 2))
            .force('y', d3.forceY(function (d) {
                let signatures = d.signatures;
                for (let i=0; i<signatures.length; ++i) {
                    if (sigs.has(signatures[i])) {
                        return sigs.get(signatures[i]);
                    }
                }
            }).strength(1))
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
                    ? a.x.call(svg.node(), width, height, a)
                    : a.x;
            }
            if ('y' in a) {
                a.fy = typeof a.y === 'function'
                    ? a.y.call(svg.node(), width, height, a)
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

    function zoomed () {
        d3.select(this)
            .selectAll('.alloy-group')
            .attr("transform", d3.event.transform);
    }


    function apply_aliases (a) {
        aliases.clear();
        d3.entries(a).forEach(function (alias) {
            const key = alias.key;
            const value = alias.value;
            aliases.set(key, value);
        })
    }

    function apply_attrs (shape, attributes) {
        d3.entries(attributes).forEach(function (attr) {
            const key = attr.key;
            const value = parse_value(attr.value);
            shape.attr(key, value);
        });
    }

    function apply_styles (shape, styles) {
        d3.entries(styles).forEach(function (style) {
            const key = style.key;
            const value = parse_value(style.value);
            shape.style(key, value);
        });
    }

    function build_circle (s) {
        const c = default_circle();
        apply_attrs(c, s['attr']);
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

            if (typeof d === 'string' || Array.isArray(d))
                d = { source: d };

            if (!d.filters)
                d.filters = [];

            function source_to_filter (source) {
                return source === 'atoms'
                    ? {atom: '*'}
                    : source === 'tuples'
                        ? {tuple: '*'}
                        : {type: source};
            }

            if (typeof d.source === 'string') d.filters.unshift(source_to_filter(d.source));
            else if (Array.isArray(d.source)) d.source.forEach(s => {
                d.filters.unshift(source_to_filter(s))
            });

            let all_data = data.atoms().concat(data.tuples());
            d.filters.forEach(function (filter) {
                all_data = all_data.filter(build_filter(filter));
            });
            return all_data;

        }

        return [];

    }

    function build_filter (f) {
        if (f) {

            if (typeof f === 'object') {

                if (f['signature'])
                    return is_signature(f['signature']);
                if (f['atom'])
                    return is_atom(f['atom']);
                if (f['field'])
                    return is_field(f['field']);
                if (f['tuple'])
                    return is_tuple(f['tuple']);
                if (f['type'])
                    return is_signature_or_field(f['type']);
                if (f['function']) {
                    return build_function(f['function']);
                }

            }
        }
        return function () { return true; };
    }

    function build_function (code) {
        try {
            return typeof code === 'string'
                ? Function('"use strict"; return ' + code)()
                : null;
        }
        catch (error) {
            return error;
        }
    }

    function build_label (l, data) {
        const lbl = default_label(data);
        if (l) {
            apply_attrs(lbl, l['attr']);
            apply_styles(lbl, l['style']);
            if (l === 'none') lbl.style('display', 'none');
        }
        return lbl;
    }

    function build_line (s) {
        const l = default_line();
        apply_attrs(l, s['attr']);
        apply_styles(l, s['style']);
        if (s['curve']) l.curve(build_curve(s['curve']));
        return l;
    }

    function build_rectangle (s) {
        const r = default_rectangle();
        apply_attrs(r, s['attr']);
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
            .style('stroke', 'none')
            .style('stroke-width', 0);
    }

    function default_groups () {
        return {
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
        };
    }

    function default_label (data) {
        const l = label()
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#f8f8f2')
            .style('font-family', 'monospace')
            .style('font-size', function (d, i) { return i ? 14 : 18})
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
            .style('stroke', 'none')
            .style('stroke-width', 0);
    }

    function parse_value (v) {
        return typeof v === 'string'
            ? string_contains_function(v)
                ? build_function(v)
                : v.startsWith('+')
                    ? functions.get(v)
                    : v
            : v;
    }

    function string_contains_function (s) {
        return typeof s === 'string' && (~s.indexOf('function') || ~s.indexOf('=>'));
    }

    return _display;

}
