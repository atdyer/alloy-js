import {group} from '../group';
import {circle} from '../shapes/circle';
import {line} from '../shapes/line';
import {rectangle} from "../shapes/rectangle";
import {curve_bundle_left, curve_bundle_right} from '../new/arcs/bundle';
import {atom_is_sig} from '../new/filters/atom';
import {tuple_is_field} from '../new/filters/tuple';
import {constant} from "../util/graph-util";
import {layout} from "../layout";

export {parse_json};

function parse_json (json) {

    return function (data) {
        const groups = bind_data(data);
        return initialize_layout(data, groups);
    };

    // Bind data to shapes
    function bind_data (data) {

        const groups = [];

        // Apply projections
        if (json['projections']) {
            entries(json['projections']).forEach(function (o) {
                data.project(o.key, o.value);
            });
        }

        // Create groups
        if (json['groups']) {
            entries(json['groups']).forEach(function (o) {

                const grp = o.value;
                const index = grp.index || 0;
                const label = o.key || 'alloy-group-' + index;

                // Create the group
                const g = group()
                    .index(index)
                    .label(label);

                // Build the shape and data
                const s = build_shape(grp.shape);
                const d = build_data(data, grp.data);

                if (s && d) {

                    g.shape(s).data(d);
                    groups.push(g);

                }

            });
        }

        return groups;

    }

    function initialize_layout (data, groups) {

        const l = layout().groups(groups);

        const config = json['layout'];

        if (!config)
            return l;
        if (typeof config === 'string')
            return l.type(config);

        if (config['type']) {
            l.type(config['type']);
        }

        // Apply positions
        if (config['positions']) {

            const atoms = data.atoms();

            entries(config['positions']).forEach(function (p) {

                const atm = find_atom(atoms, p.key);
                const pos = p.value;
                if (atm) apply_position(atm, pos);

            });
        }

        return l;

    }

    function apply_attrs (item, attributes) {
        entries(attributes).forEach(function (a) {
            item.attr(a.key, a.value);
        });
    }

    function apply_position (item, position) {
        if ('x' in position) item.x = build_function(position.x);
        if ('y' in position) item.y = build_function(position.y);
    }

    function apply_styles (item, styles) {
        entries(styles).forEach(function (s) {
            if (typeof s.value === 'object')
                s.value = build_choice(s.value);
            item.style(s.key, s.value);
        });
    }

    function build_choice (c) {
        const fld = c['field'];
        return function (d) {
            return c[d[fld]]
        };
    }

    function build_data (data, d) {
        if (d) {
            if (typeof d === 'string')
                d = {source: d};
            const _data = d.source === 'atoms'
                ? data.atoms()
                : d.source === 'tuples'
                    ? data.tuples()
                    : [];
            return _data.filter(build_filter(d.filter));
        }
        return [];
    }

    function build_function (code) {
        return typeof code === 'string'
            ? Function('"use strict"; return ' + code)()
            : constant(code);
    }

    function build_shape (s) {
        if (s) {

            if (typeof s === 'string')
                s = {type: s};

            return (
                s.type === 'circle' ? build_circle(s) :
                    s.type === 'line' ? build_line(s) :
                        s.type === 'rectangle' ? build_rectangle(s) :
                            null
            );

        }
    }

    function build_circle (c) {
        const _circle = circle();
        apply_attrs(_circle, c['attribute']);
        apply_styles(_circle, c['style']);
        build_label(_circle, c['label']);
        return _circle;
    }

    function build_label(s, l) {
        if (l) {
            if (l === 'no') {
                s.label(null);
            } else {
                apply_attrs(s.label(), l['attribute']);
                apply_styles(s.label(), l['style']);
            }
        }
    }

    function build_line (l) {
        const _line = line();
        const curve = l['curve'];
        if (curve) _line.curve(build_curve(curve));
        apply_attrs(_line, l['attribute']);
        apply_styles(_line, l['style']);
        build_label(_line, l['label']);
        return _line;
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
    }

    function build_rectangle (r) {
        const _rect = rectangle();
        apply_attrs(_rect, r['attribute']);
        apply_styles(_rect, r['style']);
        return _rect;
    }

    function build_filter (f) {
        if (f) {
            if (f['signature'])
                return atom_is_sig(f['signature']);
            if (f['field'])
                return tuple_is_field(f['field']);
        }
        return function () { return true; }
    }

    function entries (map) {
        const entries = [];
        if (map) {
            for (let key in map) {
                if (map.hasOwnProperty(key)) {
                    entries.push({key: key, value: map[key]});
                }
            }
        }
        return entries;
    }

    function find_atom (atoms, label) {
        return atoms.find(function (a) {
            return a.label() === label;
        });
    }

}