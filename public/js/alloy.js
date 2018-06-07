(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.alloy = {}),global.d3));
}(this, (function (exports,d3$1) { 'use strict';

function atom (selection, sig) {

    const _atom = {};

    _atom.label = function () {
        return selection.attr('label');
    };

    _atom.parent = function () {
        return sig;
    };

    return _atom;

}

function signature (selection) {

    const _signature = {};

    const atoms = d3$1.map();
    let parent;
    const children = [];


    _signature.add_child = function (child) {
        children.push(child);
    };

    _signature.atom = function (label) {
        let a = atoms.get(label);
        if (!a) {
            children.find(function (child) {
                return a = child.atom(label);
            });
        }
        return a;
    };

    _signature.atoms = function () {
        return atoms.values();
    };

    _signature.children = function () {
        return children;
    };

    _signature.find_parent = function (signatures) {
        parent = signatures.find(function (sig) {
            return sig.id() === _signature.parent_id();
        });
        if (parent) {
            parent.add_child(_signature);
        }
        return parent;
    };

    _signature.id = function () {
        return selection.attr('ID');
    };

    _signature.label = function () {
        return selection.attr('label');
    };

    _signature.parent = function () {
        return parent;
    };

    _signature.parent_id = function () {
        return selection.attr('parentID');
    };

    _signature.private = function () {
        return selection.attr('private') === 'yes';
    };


    selection.selectAll('atom')
        .each(function () {
            const atm = atom(d3$1.select(this), _signature);
            atoms.set(atm.label(), atm);
        });

    return _signature;

}

function tuple (atoms, field) {

    const _tuple = {};

    const _atoms = atoms,
        _field = field;

    _tuple.arity = function () {
        return _atoms.length;
    };

    _tuple.atoms = function () {
        return _atoms;
    };

    _tuple.field = function () {
        return _field;
    };

    _tuple.id = function () {
        return _tuple.field().label() + '[' + _tuple.atoms().map(a => a.label()) + ']';
    };

    return _tuple;

}

function field (selection, signatures) {

    const _field = {};

    const tuples = [],
        types = [];

    _field.arity = function () {
        return types.size;
    };

    _field.id = function () {
        return selection.attr('ID');
    };

    _field.label = function () {
        return selection.attr('label');
    };

    _field.parent = function () {
        return find_signature_by_id(selection.attr('parentID'));
    };

    _field.private = function () {
        return selection.attr('private') === 'yes';
    };

    _field.size = function () {
        return tuples.length;
    };

    _field.tuples = function () {
        return tuples;
    };

    _field.types = function () {
        return types;
    };


    selection.select('types')
        .selectAll('type')
        .each(function () {
            const sig_id = d3$1.select(this).attr('ID');
            const sig = find_signature_by_id(sig_id);
            types.push(sig);
        });

    selection.selectAll('tuple')
        .each(function () {
            const tup = d3$1.select(this);
            const atoms = tup.selectAll('atom')
                .nodes()
                .map(function (d, i) {
                    const sig = types[i];
                    const label = d3$1.select(d).attr('label');
                    return sig.atom(label);
                });
            atoms.field = _field;
            tuples.push(tuple(atoms, _field));
        });


    function find_signature_by_id (sig_id) {
        return signatures.find(function (sig) {
            return sig.id() === sig_id;
        });
    }

    return _field;

}

function instance (doc) {

    if (!arguments.length) return;

    const _instance = {};

    const selection = d3$1.select(doc),
        a = selection.select('alloy'),      // Alloy
        i = selection.select('instance'),   // Instance
        s = selection.select('source');     // Source

    const sigs = d3$1.map();
    const sources = d3$1.map();
    const fields = d3$1.map();


    _instance.alloy = function () {
        return a.attr('builddate');
    };

    _instance.bitwidth = function () {
        return i.attr('bitwidth');
    };

    _instance.command = function () {
        return i.attr('command');
    };

    _instance.field = function (label) {
        return fields.get(label);
    };

    _instance.fields = function () {
        return fields.values().filter(function (fld) {
            return !fld.private();
        });
    };

    _instance.maxseq = function () {
        return i.attr('maxseq');
    };

    _instance.signature = function (label) {
        return sigs.get(label);
    };

    _instance.signatures = function () {
        return sigs.values().filter(function (sig) {
            return !sig.private();
        });
    };

    _instance.sources = function () {
        return sources;
    };


    // Parse signatures
    i.selectAll('sig')
        .each(function () {
            const sig = signature(d3$1.select(this));
            sigs.set(sig.label(), sig);
        });

    // Form signature tree
    sigs.each(function (sig) {
        sig.find_parent(sigs.values());
    });

    // Parse fields
    i.selectAll('field')
        .each(function () {
            const fld = field(d3$1.select(this), sigs.values());
            fields.set(fld.label(), fld);
        });

    // Parse file sources
    s.each(function () {
        const src = d3$1.select(this);
        const f = filename(src.attr('filename'));
        sources.set(f, src.attr('content'));
    });


    function filename (f) {

        const tokens = f.split('/');
        return tokens[tokens.length - 1];

    }

    return _instance;

}

// Returns a list of all atoms in the instance
function flatten_signatures (inst) {

    return d3.merge(
        inst.signatures()
            .map(function (sig) {
                return sig.atoms()
            })
    );

}

// Returns a list of all tuples in the instance
function flatten_fields (inst, atoms) {

    const atom_map = d3.map(atoms, function (atm) {
        return atm.label();
    });

    const tups = d3.merge(
        inst.fields()
            .map(function (fld) {
                return fld.tuples();
            })
    );

    return tups.map(function (tup) {
        const atoms = tup.atoms().map(function (atm) {
            return atom_map.get(atm.label());
        });
        return tuple(atoms, tup.field());
    });

}

function data (inst) {

    const atom_list = flatten_signatures(inst);
    const tuple_list = flatten_fields(inst, atom_list);

    const atoms = atom_list.map(atom_to_object);
    const tuples = tuple_list.map(tuple_to_object(atoms));

    let projected_atoms = atoms;
    let projected_tuples = tuples;
    let needs_reproject = true;

    const graph_data = {};
    const projections = d3$1.map();

    graph_data.atoms = function () {
        if (needs_reproject) reproject();
        return projected_atoms;
    };

    graph_data.clear_projections = function () {
        projections.clear();
        needs_reproject = true;
    };

    graph_data.remove_projection = function (sig) {
        projections.remove(sig);
        needs_reproject = true;
    };

    graph_data.set_projection = function (sig, atm) {
        projections.set(sig, atm);
        needs_reproject = true;
    };

    graph_data.tuples = function () {
        if (needs_reproject) reproject();
        return projected_tuples;
    };


    function reproject () {
        projected_atoms = atoms;
        projected_tuples = tuples;
        projections.each(function (atm, sig) {
            let atom = projected_atoms.find(a => a.id === atm);
            let prj = project$1(sig, atom, projected_atoms, projected_tuples);
            projected_atoms = prj.atoms;
            projected_tuples = prj.tuples;
        });
        permute_joins(projected_atoms, projected_tuples);
        apply_source_target(projected_tuples);
        needs_reproject = false;
    }


    return graph_data;

}

function apply_source_target (tuples) {
    tuples.forEach(function (tup) {
        if (tup.atoms.length) {
            tup.source = tup.atoms[0];
            tup.target = tup.atoms[tup.atoms.length - 1];
        }
    });
}

function permute_joins (atoms, tuples) {

    // TODO: Probably rethink this... how big will instances actually get?
    // Oh boy... dear quadratic gods: please be gentle.

    // Clear existing attributes
    atoms.forEach(a => a.attributes = {});
    tuples.forEach(t => t.attributes = {});

    atoms.forEach(function (atom) {

        tuples.forEach(function (tuple) {

            if (tuple.atoms.length && tuple.atoms[0] === atom) {

                if (!(tuple.field in atom.attributes))
                    atom.attributes[tuple.field] = [];
                atom.attributes[tuple.field].push(tuple.atoms.slice(1));

            }

        });

    });

    tuples.forEach(function (tuple) {

        tuples.forEach(function (t) {

            function index_match (acc, val, idx) {
                return acc && val === t.atoms[idx];
            }

            if (tuple.atoms.length < t.atoms.length) {

                if (tuple.atoms.reduce(index_match, true) === true) {

                    if (!(t.field in tuple.attributes))
                        tuple.attributes[t.field] = [];
                    tuple.attributes[t.field].push(t.atoms.slice(tuple.atoms.length));

                }

            }

        });

    });

}

function atom_to_object (atom) {
    return {
        atom: atom,
        id: atom.label(),
        signature: build_signature_list(atom)
    }
}

function atoms_of_signature (sig, atoms) {
    return atoms.filter(function (atom) {
        return atom.signature.includes(sig);
    });
}

function build_signature_list (atom) {
    let parent = atom.parent(),
        sig = [];

    while(parent) {
        sig.push(parent.label());
        parent = parent.parent();
    }

    return sig;

}

function project$1(sig, atm, atoms, tuples) {

    // Get all atoms of signature sig
    const sig_atoms = atoms_of_signature(sig, atoms);

    // Filter out atoms of projected signature to get
    // list of atoms that will be visible
    const projected_atoms = atoms.filter(function (atom) {
        return !sig_atoms.includes(atom);
    });

    // Remove tuples that contain an atom in sig unless that atom is atm
    const projected_tuples = tuples.filter(function (tuple) {
        return tuple.atoms.find(function (atom) {
            return atom !== atm && sig_atoms.includes(atom);
        }) === undefined;
    });

    // Remove column sig from tuples
    projected_tuples.forEach(function (tuple) {
        tuple.atoms = tuple.atoms.filter(function (atom) {
            return atom !== atm;
        });
    });

    return {
        atoms: projected_atoms,
        tuples: projected_tuples
    };

}

function tuple_to_object (atoms) {
    return function (tuple) {
        return {
            arity: tuple.arity(),
            atoms: tuple.atoms().map(atom => atoms.find(a => a.atom === atom)),
            field: tuple.field().label(),
            id: tuple.id(),
            tuple: tuple
        }
    }
}

function label () {

    let labels;

    let aliases = d3$1.map(),
        attributes = d3$1.map(),
        styles = d3$1.map();

    function _label (selection) {

        selection
            .selectAll('.label')
            .remove();

        labels = selection
            .append('text')
            .attr('class', 'label')
            .attr('x', x)
            .attr('y', y)
            .text(alias);

        attributes.each(function (value, key) {
            labels.attr(key, value);
        });

        styles.each(function (value, key) {
            labels.style(key, value);
        });

        return labels;

    }

    _label.attr = function (name, value) {
        return arguments.length > 1
            ? (labels
                ? labels.attr(name, value)
                : attributes.set(name, value),
                _label)
            : labels
                ? labels.attr(name)
                : attributes.get(name);
    };

    _label.reposition = function () {
        if (labels)
            labels
                .attr('x', x)
                .attr('y', y);
        return _label;
    };

    _label.style = function (name, value) {
        return arguments.length > 1
            ? (labels
                ? labels.style(name, value)
                : styles.set(name, value),
                _label)
            : labels
                ? labels.style(name)
                : styles.get(name);
    };


    function alias (d) {
        return aliases.get(d.id) || d.id;
    }


    return _label;

}


function x (d) {
    return d.anchor ? d.anchor.x : d.x;
}

function y (d) {
    return d.anchor ? d.anchor.y : d.y;
}

function group () {

    let data,
        shape;

    let groups,
        id,
        index;

    let _label,
        _drag = d3.drag()
            .on('drag.shape', dragged);

    _group.on = _drag.on;

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
            .call(_drag);

        if (_label) groups.call(_label);

        return groups;

    }

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.id = function (_) {
        return arguments.length ? (id = _, _group) : id;
    };

    _group.index = function (_) {
        return arguments.length ? (index = +_, _group) : index;
    };

    _group.label = function (_) {
        return arguments.length ? (_label = _, _group) : _label;
    };

    _group.on = function () {
        _drag.on.apply(null, arguments);
        return _group;
    };

    _group.reposition = function () {
        if (shape) shape.reposition();
        _label.reposition();
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    return _group;


    function dragged (d) {
        d.x = (d.x || 0) + d3.event.dx;
        d.y = (d.y || 0) + d3.event.dy;
    }

}

function circle () {

    let circles;

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('r', 80);

    function _circle (selection) {

        selection
            .selectAll('.shape')
            .remove();

        circles = selection
            .append('circle')
            .attr('class', 'shape')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', r);

        circles.each(function (d) {
            d._shape = _circle;
        });

        attributes.each(function (value, key) {
            circles.attr(key, value);
        });

        styles.each(function (value, key) {
            circles.style(key, value);
        });

        return circles;

    }

    _circle.attr = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.attr(name, value)
                : attributes.set(name, value),
                _circle)
            : circles
                ? circles.attr(name)
                : attributes.get(name);
    };

    _circle.reposition = function () {
        if (circles)
            circles
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r);
        return _circle;
    };

    _circle.style = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.style(name, value)
                : styles.set(name, value),
                _circle)
            : circles
                ? circles.style(name)
                : styles.get(name);
    };

    return _circle;

}


function cx (d) {
    return d.x || 0;
}

function cy (d) {
    return d.y || 0;
}

function r () {
    return d3$1.select(this).attr('r') || 0;
}

function rectangle () {

    let rectangles;

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('width', 250)
        .set('height', 150);

    function _rectangle (selection) {

        selection
            .selectAll('.shape')
            .remove();

        rectangles = selection
            .append('rect')
            .attr('class', 'shape');

        rectangles.each(function (d) {
            d._shape = _rectangle;
        });

        attributes.each(function (value, key) {
            rectangles.attr(key, value);
        });

        styles.each(function (value, key) {
            rectangles.style(key, value);
        });

        _rectangle.reposition();

        return rectangles;

    }

    _rectangle.attr = function (name, value) {
        return arguments.length > 1
            ? (rectangles
                ? rectangles.attr(name, value)
                : attributes.set(name, value),
                _rectangle)
            : rectangles
                ? rectangles.attr(name)
                : attributes.get(name);
    };

    _rectangle.reposition = function () {
        if (rectangles)
            rectangles
                .attr('x', x$1)
                .attr('y', y$1)
                .attr('width', width)
                .attr('height', height)
                .each(anchor);
        return _rectangle;
    };

    _rectangle.style = function (name, value) {
        return arguments.length > 1
            ? (rectangles
                ? rectangles.style(name, value)
                : styles.set(name, value),
                _rectangle)
            : rectangles
                ? rectangles.style(name)
                : styles.get(name);
    };

    return _rectangle;

}

function x$1 (d) {
    const _x = d.x || 0;
    const _w = width.call(this);
    return _x - _w / 2;
}

function y$1 (d) {
    const _y = d.y || 0;
    const _h = height.call(this);
    return _y - _h / 2;
}

function width () {
    return +d3$1.select(this).attr('width') || 0;
}

function height () {
    return +d3$1.select(this).attr('height') || 0;
}

function anchor (d) {
    d.anchor = {
        x: d.x,
        y: d.y
    };
}

function arc_straight (d) {
    const line = d3$1.line();
    return line([
        [d.source.x || 0, d.source.y || 0],
        [d.target.x || 0, d.target.y || 0]
    ]);
}

function line () {

    let lines;

    let curve_function = arc_straight;

    let attributes = d3$1.map(),
        styles = d3$1.map();

    styles
        .set('fill', 'none');

    function _line (selection) {

        selection
            .selectAll('.shape')
            .remove();

        lines = selection
            .append('path')
            .attr('class', 'shape');

        lines.each(function (d) {
            d._shape = _line;
        });

        attributes.each(function (value, key) {
            lines.attr(key, value);
        });

        styles.each(function (value, key) {
            lines.style(key, value);
        });

        _line.reposition();

        return lines;

    }

    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? lines.attr(name, value)
                : attributes.set(name, value),
                _line)
            : lines
                ? lines.attr(name)
                : attributes.get(name);
    };

    _line.reposition = function () {
        if (lines)
            lines
                .attr('d', curve_function)
                .each(anchor$1);
        return _line;
    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? lines.style(name, value)
                : styles.set(name, value),
                _line)
            : lines
                ? lines.style(name)
                : styles.get(name);
    };

    return _line;

}


function anchor$1 (d) {
    let l = this.getTotalLength();
    d.anchor = this.getPointAtLength(0.5 * l);
}

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

        selection.each(function (group$$1) {
            d3$1.select(this).call(group$$1);
        });

        return selection;

    }

    _display.style = function (json) {

        groups = [];

        data.clear_projections();

        if (json && json['projections']) {

            d3$1.entries(json['projections']).forEach(function (p) {

                const sig = p.key;
                const atm = p.value;

                data.set_projection(sig, atm);

            });

        }

        if (json && json['groups']) {

            d3$1.entries(json['groups']).forEach(function (g) {

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

        let simulation = d3$1.forceSimulation(atoms)
            .force('center', d3$1.forceCenter(cx, cy))
            .force('collide', d3$1.forceCollide(65))
            .force('charge', d3$1.forceManyBody().strength(-80))
            .force('links', d3$1.forceLink(tuples).distance(150))
            .force('x', d3$1.forceX(cx))
            .force('y', d3$1.forceY(cy))
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
    d3$1.entries(attributes).forEach(function (attr) {
        shape.attr(attr.key, attr.value);
    });
}

function apply_styles (shape, styles) {
    d3$1.entries(styles).forEach(function (style) {
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

// export * from './graph-data';

exports.instance = instance;
exports.data = data;
exports.group = group;
exports.circle = circle;
exports.rectangle = rectangle;
exports.line = line;
exports.display = display;

Object.defineProperty(exports, '__esModule', { value: true });

})));
