import {group} from '../group';
import {arrow} from '../shapes/arrow';
import {circle} from '../shapes/circle';
import {label} from '../shapes/label';
import {line} from '../shapes/line';
import {rectangle} from "../shapes/rectangle";
import {curve_bundle_left, curve_bundle_right} from '../arcs/bundle';
import {atom_is_sig} from '../filters/atom';
import {tuple_is_field} from '../filters/tuple';

export {parse_json};

function parse_json (json) {

    return function (data) {

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

                // var info = d3.map();

                const grp = o.value;
                const index = grp.index || 0;
                const label = o.key || 'alloy-group-' + index;

                // Create the group
                const g = group()
                    .index(index)
                    .label(label);

                // Build the shape
                const s = build_shape(grp.shape);
                g.shape(s.shape);

                // Build the data
                const d = build_data(data, grp.data);
                g.data(d.data);

                groups.push(g);

            });
        }

        // Resolve dependencies
        groups.forEach(function (grp) {

            const shape = grp.shape();

            if (shape.type() === 'arrow') {
                const link_label = shape.link();
                const target_label = shape.target();
                const link_group = find_group(groups, link_label);
                const target_group = find_group(groups, target_label);
                if (link_group && target_group) {
                    const link_shape = link_group.shape();
                    const target_shape = target_group.shape();
                    shape
                        .link(link_shape)
                        .target(target_shape);
                }
            }

        });

        return groups;

    };

    function apply_attrs (item, attributes) {
        entries(attributes).forEach(function (a) {
            item.attr(a.key, a.value);
        });
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
            const _data =
                d.source === 'atoms' ? data.atoms() :
                    d.source === 'tuples' ? data.tuples() : [];
            return {
                data: _data.filter(build_filter(d.filter)),
                type: d.source
            };
        }
        return [];
    }

    function build_shape (s) {
        if (s) {

            if (typeof s === 'string')
                s = {type: s};

            const shape =
                s.type === 'arrow' ? build_arrow(s) :
                    s.type === 'circle' ? build_circle(s) :
                        s.type === 'label' ? build_label(s) :
                            s.type === 'line' ? build_line(s) :
                                s.type === 'rectangle' ? build_rectangle(s) :
                                    null;

            return {
                type: s.type,
                shape: shape
            };

        }
    }

    function build_arrow (a) {
        return arrow()
            .link(a['link'])
            .target(a['target']);
    }

    function build_circle (c) {
        const _circle = circle();
        apply_attrs(_circle, c['attribute']);
        apply_styles(_circle, c['style']);
        return _circle;
    }

    function build_label (l) {

        const _label = label();
        const aliases = l['alias'];

        if (aliases) {
            entries(aliases).forEach(function (alias) {
                _label.alias(alias.key, '' + alias.value);
            });
        }

        apply_attrs(_label, l['attribute']);
        apply_styles(_label, l['style']);

        return _label;

    }

    function build_line (l) {
        const _line = line();
        const curve = l['curve'];

        if (curve) _line.curve(build_curve(curve));

        apply_attrs(_line, l['attribute']);
        apply_styles(_line, l['style']);
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

    function find_group (groups, label) {
        return groups.find(function (g) {
            return g.label() === label;
        });
    }

}