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

    // Parse skolem
    i.selectAll('skolem')
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

function tuple$1 (atoms, field) {

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

function graph (inst) {

    const atom_list = signatures_to_atoms(inst);
    const tuple_list = fields_to_tuples(inst, atom_list);

    const atoms = atom_list.map(atom_to_object);
    const tuples = tuple_list.map(tuple_to_object(atoms));

    const projections = d3$1.map();
    let needs_reproject = true;
    let projected_atoms = atoms;
    let projected_tuples = tuples;

    const _graph = {};

    _graph.atoms = function () {
        if (needs_reproject) reproject();
        return projected_atoms;
    };

    _graph.clear_projections = function () {
        projections.clear();
        needs_reproject = true;
        return _graph;
    };

    _graph.remove_projection = function (sig) {
        projections.remove(sig);
        needs_reproject = true;
        return _graph;
    };

    _graph.set_projection = function (sig, atm) {
        projections.set(sig, atm);
        needs_reproject = true;
        return _graph;
    };

    _graph.tuples = function () {
        if (needs_reproject) reproject();
        return projected_tuples;
    };

    function reproject () {

        projected_atoms = atoms;
        projected_tuples = tuples;

        // Clear any atom fields from previous projections
        projected_atoms.forEach(function (atom) {
            atom.fields = {};
        });

        // Clear any previous projections
        projected_tuples.forEach(function (tuple) {
            tuple.projection = tuple.atoms;
            tuple.source = null;
            tuple.target = null;
        });

        // Perform projection
        projections.each(function (atm, sig) {
            let atom = projected_atoms.find(a => a.id === atm);
            if (atom) {
                let prj = project(sig, atom, projected_atoms, projected_tuples);
                projected_atoms = prj.atoms;
                projected_tuples = prj.tuples;
            }
        });

        // Set the source and target atoms for each tuple
        projected_tuples.forEach(function (tuple) {
            tuple.source = tuple.projection[0];
            tuple.target = tuple.projection[tuple.projection.length - 1];
            set_tuple_source_fields(tuple);
        });

        needs_reproject = false;
    }

    return _graph;

}



function project(sig, atm, atoms, tuples) {

    // Get all atoms of signature sig
    let sig_atoms = atoms.filter(function (atom) {
        return atom.signatures.includes(sig);
    });

    // Remove all tuples that contain an atom in sig unless it is atm
    let projected_tuples = tuples.filter(function (tuple) {
        return tuple.atoms.find(function (atom) {
            return atom !== atm && sig_atoms.includes(atom);
        }) === undefined;
    });

    // Remove atm from the projection list
    projected_tuples.forEach(function (tuple) {
        tuple.projection = tuple.projection.filter(function (atom) {
            return atom !== atm;
        });
    });

    // Remove tuples that have no atoms in their projection
    projected_tuples = projected_tuples.filter(function (tuple) {
        return tuple.projection.length !== 0;
    });

    // Remove all atoms in sig
    const projected_atoms = atoms.filter(function (atom) {
        return !sig_atoms.includes(atom);
    });

    return {
        atoms: projected_atoms,
        tuples: projected_tuples
    };

}



function atom_to_object (atom) {
    return {
        id: atom.label(),
        print: print_atom_object,
        signatures: build_signature_list(atom),
        type: 'atom'
    }
}

function tuple_to_object (atoms) {
    return function (tuple) {
        return {
            atoms: tuple.atoms().map(atom => atoms.find(a => a.id === atom.label())),
            field: tuple.field().label(),
            id: tuple.id(),
            type: 'tuple'
        }
    }
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

function fields_to_tuples (inst, atoms) {
    const atom_map = d3$1.map(atoms, function (atm) {
        return atm.label();
    });
    const tuples = d3$1.merge(
        inst.fields()
            .map(function (fld) {
                return fld.tuples();
            })
    );
    return tuples.map(function (tup) {
        const atoms = tup.atoms().map(function (atm) {
            return atom_map.get(atm.label());
        });
        return tuple$1(atoms, tup.field());
    })
}

function print_atom_object (d) {
    console.log(d.id);
    console.log('  Signatures:');
    d.signatures
        ? d.signatures.forEach(s => console.log('    ' + s))
        : '    none';
    console.log('  Fields:');
    d.fields
        ? d3$1.entries(d.fields).forEach(f => {
            console.log('    ' + f.key);
            f.value.forEach(function (v) {
                Array.isArray(v)
                    ? console.log('      ' + v.map(i => i.id).join(', '))
                    : console.log('      ' + v.id);
            });
        })
        : '    none';
}

function set_tuple_source_fields (tuple) {
    const fields = tuple.source.fields[tuple.field];
    if (Array.isArray(fields)) {
        if (Array.isArray(fields[0])) {
            fields.push(tuple.projection.slice(1));
        } else {
            tuple.source.fields[tuple.field] = [
                fields,
                tuple.projection.slice(1)
            ];
        }
    } else {
        tuple.source.fields[tuple.field] = tuple.projection.slice(1);
    }
}

function signatures_to_atoms (inst) {
    return d3$1.merge(
        inst.signatures()
            .map(function (sig) {
                return sig.atoms();
            })
    );
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

        if (_label) {
            groups.call(_label);
        }

        return groups;

    }

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.dataType = function () {
        return data && data.length ? data[0].type : null;
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

function find_angle (p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * (180 / Math.PI);
}

function find_intersection (path, is_inside, tolerance) {

    tolerance = tolerance || 0.1;

    const length = path.getTotalLength();

    if (length) {

        let n1 = 0;
        let n2 = length;
        let nm = (n1 + n2) / 2;

        const p1 = path.getPointAtLength(n1);
        const p2 = path.getPointAtLength(n2);
        let md = path.getPointAtLength(nm);
        let md_next;

        const is_p1 = is_inside(p1);
        let is_p2 = is_inside(p2);
        let is_md;

        // Start point must be outside shape
        if (is_p1) {
            return p2;
        }

        // End point must be inside shape
        if (!is_p2) {
            return p2;
        }

        // Binary search
        let diff = tolerance;
        while (!(diff < tolerance)) {

            // Is the midpoint inside the shape?
            is_md = is_inside(md);

            // Pick a side
            if (is_md) {
                n2 = nm;
            } else {
                n1 = nm;
            }

            // New distance along path that midpoint falls
            nm = (n1 + n2) / 2;

            // Find the next midpoint
            md_next = path.getPointAtLength(nm);

            // Calculate difference between previous midpoint and src midpoint
            diff = distance(md_next, md);

            // Set the current midpoint
            md = md_next;

        }

        return md;

    }

}

function distance (p1, p2) {

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx*dx + dy*dy);

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
            .insert('circle', ':first-child')
            .attr('class', 'shape')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', r)
            .on('click', function (d) {
                if (typeof d.print === 'function') d.print(d);
            });

        circles.each(function (d) {
            d._shape = _circle;
            d._element = this;
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

    _circle.intersection = function (element, path) {
        const target_circle = d3$1.select(element);
        const length = path.getTotalLength();
        const stroke = +target_circle.style('stroke-width') || 0;
        let radius = +target_circle.attr('r') || 0;
        radius += stroke / 2;
        if (length) {
            const endpoint = path.getPointAtLength(length);
            const intersect = path.getPointAtLength(length - (radius + 1));
            const angle = find_angle(endpoint, intersect);
            return {
                x: intersect.x,
                y: intersect.y,
                angle: angle || 0
            }
        }
        return {
            x: target_circle.attr('cx'),
            y: target_circle.attr('cy'),
            angle: 0
        }
    };

    _circle.reposition = function () {
        if (circles)
            circles
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r)
                .each(anchor);
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

function anchor (d) {
    d.anchor = {
        x: d.x,
        y: d.y
    };
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
            .insert('rect', ':first-child')
            .attr('class', 'shape')
            .on('click', function (d) {
                if (typeof d.print === 'function') d.print(d);
            });

        rectangles.each(function (d) {
            d._shape = _rectangle;
            d._element = this;
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

    _rectangle.intersection = function (element, path) {
        const target_rect = d3$1.select(element);
        const s = parseInt(target_rect.style('stroke-width')) || 0;
        const w = parseInt(target_rect.attr('width')) + 2 * s;
        const h = parseInt(target_rect.attr('height')) + 2 * s;
        const x = parseInt(target_rect.attr('x')) - s;
        const y = parseInt(target_rect.attr('y')) - s;
        const l = path.getTotalLength();
        const center = path.getPointAtLength(l);
        let intersection = find_intersection(path, is_inside(x, y, w, h));
        if (intersection) {
            intersection.angle = find_angle(center, intersection);
            return intersection;
        }
        return {
            x: center.x,
            y: center.y,
            angle: 0
        };
    };

    _rectangle.reposition = function () {
        if (rectangles)
            rectangles
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .each(anchor$1);
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

function x (d) {
    const _x = d.x || 0;
    const _w = width.call(this);
    return _x - _w / 2;
}

function y (d) {
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

function anchor$1 (d) {
    d.anchor = {
        x: d.x,
        y: d.y
    };
}

function is_inside(x, y, w, h) {

    return function (pt) {
        return pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
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

    let lines,
        arrows;

    let curve_function = arc_straight;

    let attributes = d3$1.map(),
        styles = d3$1.map();

    styles
        .set('fill', 'none');

    function _line (selection) {

        selection
            .selectAll('.shape')
            .remove();

        selection
            .selectAll('.arrow')
            .remove();

        lines = selection
            .insert('path', ':first-child')
            .attr('class', 'shape')
            .on('click', function (d) {
                console.log(d);
            });

        arrows = selection
            .append('path')
            .attr('class', 'arrow')
            .attr('d', 'M -10 -5 L 0 0 L -10 5 z');

        lines.each(function (d) {
            d._shape = _line;
            d._element = this;
        });

        attributes.each(function (value, key) {
            _line.attr(key, value);
        });

        styles.each(function (value, key) {
            _line.style(key, value);
        });

        _line.reposition();

        return lines;

    }

    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? apply_attribute(name, value)
                : attributes.set(name, value),
                _line)
            : lines
                ? lines.attr(name)
                : attributes.get(name);
    };

    _line.curve = function (_) {
        return arguments.length ? (curve_function = _, _line) : curve_function;
    };

    _line.reposition = function () {
        if (lines)
            lines
                .attr('d', curve_function)
                .each(anchor$2)
                .each(arrow);
        return _line;
    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? apply_style(name, value)
                : styles.set(name, value),
                _line)
            : lines
                ? lines.style(name)
                : styles.get(name);
    };

    function apply_attribute (name, value) {
        if (lines) lines.attr(name, value);
        if (arrows) arrows.attr(name, value);
    }

    function apply_style (name, value) {
        if (lines) lines.attr(name, value);
        if (arrows) {
            if (name !== 'fill') arrows.style(name, value);
            if (name === 'stroke') arrows.style('fill', value);
        }
    }

    return _line;

}

function anchor$2 (d) {
    let l = this.getTotalLength();
    if (d.anchor && d.anchor.percent) {
        let p = this.getPointAtLength(d.anchor.percent * l);
        d.anchor.x = p.x;
        d.anchor.y = p.y;
    } else {
        this.getPointAtLength(0.5 * l);
    }
}

function arrow (d) {

    const target = d.target;

    if (target && target._shape && target._element) {

        const arrow = d3$1.select(this.parentNode).select('.arrow');
        const shape = target._shape;
        const element = target._element;

        const intersection = typeof shape.intersection === 'function'
            ? shape.intersection(element, this)
            : arrow_anchor_fallback(target);

        arrow.attr('transform', 'translate(' + intersection.x + ',' + intersection.y + ') rotate(' + intersection.angle + ')');

    }
}

function arrow_anchor_fallback (shape) {
    return {
        x: shape.anchor ? shape.anchor.x : shape.x,
        y: shape.anchor ? shape.anchor.y : shape.y,
        angle: 0
    };
}

function label () {

    let labels;

    let aliases = d3$1.map(),
        attributes = d3$1.map(),
        styles = d3$1.map();

    function _label (selection) {

        labels = selection
            .selectAll('.label')
            .data(lines);

        labels
            .exit()
            .remove();

        labels = labels
            .enter()
            .insert('text')
            .attr('class', 'label')
            .merge(labels)
            .attr('x', x$1)
            .attr('y', y$1)
            .attr('dy', dy)
            .text(function (d) { return d.text; });

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
                .attr('x', x$1)
                .attr('y', y$1);
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
        if (d.type === 'tuple') {
            let label = d.field;
            let intermediate = d.projection.slice(1, -1);
            return intermediate.length
                ? [label + ' [' + intermediate.map(a => a.id) + ']']
                : [label];
        }
        if (d.type === 'atom') {
            let label = aliases.get(d.id) || d.id;
            if (d.fields) {
                let sets = d3$1.entries(d.fields).reduce((acc, o) => o.value.length ? acc : (acc.push(o.key), acc), []);
                if (sets.length) {
                    let set_str = '(' + sets.join(', ') + ')';
                    return [label, set_str];
                }
            }
            return [label];
        }
    }

    function lines (d) {

        return alias(d).map(function (line, index) {
            return {
                dy: index > 0 ? 1.2 : 0,
                parent: d,
                text: line
            }
        });

    }


    return _label;

}


function x$1 (d) {
    return d.parent.anchor ? d.parent.anchor.x : d.parent.x;
}

function y$1 (d) {
    return d.parent.anchor ? d.parent.anchor.y : d.parent.y;
}

function dy (d, i, g) {
    return i - 0.5 * (g.length - 1) + 'em';
}

function place_anchors (tuples) {

    const counts = d3$1.map();
    const indices = d3$1.map();

    tuples.forEach(function (tuple) {

        if (tuple.source && tuple.target) {

            const key = key_function(tuple);

            if (!counts.has(key)) {
                counts.set(key, 0);
                indices.set(key, 0);
            }

            counts.set(key, counts.get(key) + 1);

        }

    });

    tuples.forEach(function (tuple) {

        if (tuple.source && tuple.target) {

            const key = key_function(tuple);

            if (counts.has(key)) {

                const count = counts.get(key);
                const index = indices.get(key);
                indices.set(key, index + 1);

                if (!tuple.anchor) {
                    tuple.anchor = {};
                }

                tuple.anchor.percent = calculate_anchor(index, count);

            }

        }

    });

}

function key_function (tuple) {
    return tuple.source.id + tuple.target.id;
}

function calculate_anchor (index, count) {
    return 0.15 + 0.7 * (index + 1) * (1 / (count+1));
}

function atom_is_sig (sig) {
    return function (atom) {
        return atom.signatures.includes(sig);
    };
}

function tuple_is_field (fld) {
    return function (tup) {
        return tup.field === fld;
    }
}

function curve_bundle_right (beta) {

    const bundle = d3$1.line().curve(d3$1.curveBundle.beta(beta));

    return function (d) {

        const s = [d.source.x, d.source.y],
            e = [d.target.x, d.target.y];

        const xl = e[0] - s[0],
            yl = e[1] - s[1];

        const v = [xl, yl],
            p = [-v[1], v[0]],
            l = Math.sqrt(p[0] * p[0] + p[1] * p[1]),
            n = [p[0] / l, p[1] / l];

        const xc = s[0] + xl / 2,
            yc = s[1] + yl / 2;

        return bundle([
            s,
            [xc + l * n[0] / 2, yc + l * n[1] / 2],
            e
        ]);

    }

}

function curve_bundle_left (beta) {

    const bundle = d3$1.line().curve(d3$1.curveBundle.beta(beta));

    return function (d) {

        const s = [d.source.x, d.source.y],
            e = [d.target.x, d.target.y];

        const xl = e[0] - s[0],
            yl = e[1] - s[1];

        const v = [xl, yl],
            p = [v[1], -v[0]],
            l = Math.sqrt(p[0] * p[0] + p[1] * p[1]),
            n = [p[0] / l, p[1] / l];

        const xc = s[0] + xl / 2,
            yc = s[1] + yl / 2;

        return bundle([
            s,
            [xc + l * n[0] / 2, yc + l * n[1] / 2],
            e
        ]);

    }

}

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

        selection.each(function (group$$1) {
            d3$1.select(this).call(group$$1);
        });

        reorder('rendering');
        reposition();

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

        if (json && json['layout']) {

            const config = json['layout'];

            if (config['positions']) {

                const atoms = data.atoms();

                d3$1.entries(config['positions']).forEach(function (p) {

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

            d3$1.entries(json['groups']).forEach(function (g) {

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
        .style('stroke', 'none');
}

function parse_value (v) {
    return typeof v === 'string'
        ? (~v.indexOf('function') || ~v.indexOf('=>'))
            ? build_function(v)
            : v
        : v;
}

exports.instance = instance;
exports.graph = graph;
exports.group = group;
exports.circle = circle;
exports.rectangle = rectangle;
exports.line = line;
exports.display = display;

Object.defineProperty(exports, '__esModule', { value: true });

})));
