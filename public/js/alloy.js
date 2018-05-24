(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.alloy = {}),global.d3));
}(this, (function (exports,d3$1) { 'use strict';

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

    return _tuple;

}

// Adds an attribute to an object. If the attribute doesn't exist on the object,
// the attribute fld is simply set to equal val. If the attribute already exists
// on the object, we convert the existing value to a list and append val to the
// end of the list. Makes sure that it's possible to create lists of lists
// intentionally (i.e. set an attribute for the first time as a list. Attempt
// to set it again with another list, and the attribute will be converted
// to a list of lists instead of simply appending the new list to the existing one.
function add_attribute (obj, fld, val) {

    if (fld in obj) {

        // Is the existing field an array?
        let existing_is_array = Array.isArray(obj[fld]);

        // If the current field is an array, is it an array of arrays?
        let existing_is_array_of_arrays = Array.isArray(obj[fld][0]);

        // Is the value being added an array?
        const val_is_array = Array.isArray(val);

        if (!existing_is_array || (val_is_array && !existing_is_array_of_arrays)) {
            obj[fld] = [obj[fld]];
        }

        obj[fld].push(val);

    } else {

        obj[fld] = val;

    }

}

// Applies attributes to all atoms and tuples. An attribute of an atom
// is any tuple for which it is the first atom in that tuple, but with
// the atom removed. The attribute is named by the field that the tuple
// comes from.
// An attribute of a tuple, a, is any other tuple, b, for which all atoms
// of a are, in order, the first atoms of b, but with the atoms of a removed
// from b. The attribute is named by the field that tuple b comes from.
function apply_attributes (atoms, tuples) {

    // Clear any existing attributes
    atoms.forEach(function (atm) {
        for (let key in atm) {
            if (atm.hasOwnProperty(key) && key !== 'label' && key !== 'parent') {
                delete atm[key];
            }
        }
    });

    tuples.forEach(function (tup) {
        for (let key in tup) {
            if (tup.hasOwnProperty(key) && key !== 'arity' && key !== 'atoms' && key !== 'field') {
                delete tup[key];
            }
        }
    });

    // Expose all fields as attributes
    atoms.forEach(function (atm) {

        // Loop through all tuples
        tuples.forEach(function (tup) {

            // Only care about tuples with more than one atom
            if (tup.arity() > 1) {

                // If the atom is the first one in the tuple, the tuple will
                // be used as an attribute.
                const atoms = tup.atoms();

                if (atoms[0] === atm) {

                    // Get the field name
                    const fld = tup.field().label();

                    // Create the attribute
                    let attr = atoms.slice(1).map(function (a) {
                        return a.label();
                    });
                    attr = attr.length === 1 ? attr[0] : attr;

                    // Add the attribute
                    add_attribute(atm, fld, attr);

                }

            }

        });

    });

    tuples.forEach(function (tup_a) {

        const len_a = tup_a.arity();
        const atm_a = tup_a.atoms().map(function (a) {
            return a.label();
        });

        tuples.forEach(function (tup_b) {

            const len_b = tup_b.arity();

            if (len_a < len_b) {

                const atm_b = tup_b.atoms().map(function (b) {
                    return b.label();
                });

                let mismatch = atm_a.find(function (a, i) {
                    return a !== atm_b[i];
                });

                if (!mismatch) {

                    const fld = tup_b.field().label();
                    let attr = atm_b.slice(len_a);
                    attr = attr.length === 1 ? attr[0] : attr;
                    add_attribute(tup_a, fld, attr);

                }

            }

        });

    });

}

// Sets the 'source' and 'target' attributes for each tuple.
// The 'source' is the first atom in the tuple and the
// 'target' is the last atom in the tuple
function apply_source_target_attribute (tuples) {
    tuples.forEach(function (tup) {
        const atoms = tup.atoms();
        tup.source = atoms[0];
        tup.target = atoms[atoms.length - 1];
    });
}

// Returns true if item is in array, false otherwise
function array_includes (item, array) {
    return array.indexOf(item) !== -1;
}

// Get atoms from a signature and all signatures
// that inherit the signature
function atoms_recursive (sig) {

    return d3.merge([sig.atoms(), d3.merge(sig.children().map(atoms_recursive))]);

}

// Creates a function that always returns x
function constant (x) {
    return function () {
        return x;
    }
}

// Filters a list of atoms (atoms) by removing any
// atoms that are in the list of atoms to remove (remove)
function filter_atoms (atoms, remove) {
    return atoms.filter(function (atm) {
        return !array_includes(atm, remove);
    })
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

// Filters a list of tuples (tuples) by removing
// any tuple that contains an atom in the list of
// atoms to remove (remove)
function filter_tuples (tuples, remove) {
    return tuples.filter(function (tup) {
        return tup.atoms().reduce(function (acc, atm) {
            return acc && !array_includes(atm, remove);
        }, true);
    });
}

// Every tuple that contains the atom (remove) is
// replaced with a new tuple that has that atom
// removed
function reduce_tuples (tuples, remove) {
    return tuples.map(function (tup) {
        return array_includes(remove, tup.atoms()) ?
            tuple(tup.atoms().filter(function (atm) { return atm !== remove;}), tup.field()) :
            tup;
    });
}

// Projects over the given signature (sig), retaining
// only relations that contain a single atom (atm) from
// that signature
function project (sig, atm, atoms, tuples) {

    // Make sure atm is in sig
    const projected_atoms = atoms_recursive(sig);
    if (!array_includes(atm, projected_atoms)) {
        return null;
    }

    // Remove all atoms of the projected signature
    const filtered_atoms = filter_atoms(atoms, projected_atoms);

    // Remove the atom we're keeping from the projected atoms
    projected_atoms.splice(projected_atoms.indexOf(atm), 1);

    // Remove all relations that contain atoms in the projected
    // signature that aren't the one being shown
    let projected_links = filter_tuples(tuples, projected_atoms);

    // Remove the atom we're keeping from all remaining relations
    projected_links = reduce_tuples(projected_links, atm);

    return {
        atoms: filtered_atoms,
        tuples: projected_links
    };

}

// Removes atoms in the list atoms that are not a part of any
// tuple in the list of tuples
function remove_unconnected (atoms, tuples) {

    const unconnected = atoms.slice();
    const connected = [];
    tuples.every(function (tup) {

        tup.atoms().forEach(function (atm) {
            const idx = unconnected.indexOf(atm);
            if (idx !== -1) {
                connected.push(unconnected[idx]);
                unconnected.splice(idx, 1);
            }
        });
        return unconnected.length > 0;
    });
    return connected;
}

function graph_data (inst) {

    const atoms = flatten_signatures(inst),
        tuples = flatten_fields(inst, atoms),
        projections = d3$1.map();
    let atoms_proj = atoms.slice(),
        tuples_proj = tuples.slice();

    let hide_meta = true,
        hide_private = true,
        hide_unconnected = false,
        needs_reproject = true;

    const _graph_data = {};


    _graph_data.hide_meta = function (_) {
        if (!arguments.length) return hide_meta;
        hide_meta = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.hide_private = function (_) {
        if (!arguments.length) return hide_private;
        hide_private = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.hide_unconnected = function (_) {
        if (!arguments.length) return hide_unconnected;
        hide_unconnected = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.project = function (_) {
        if (arguments.length < 2) return projections;
        projections.set(arguments[0], arguments[1]);
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.atoms = function () {
        reproject();
        return atoms_proj;
    };

    _graph_data.tuples = function () {
        reproject();
        return tuples_proj;
    };

    _graph_data.unproject = function (_) {
        projections.remove(_);
        needs_reproject = true;
        return _graph_data;
    };

    function reproject () {

        if (needs_reproject) {

            // Get copy of unprojected atoms and tuples
            atoms_proj = atoms.slice();
            tuples_proj = tuples.slice();

            // Apply each projection
            projections.each(function (atm, sig) {
                sig = inst.signature(sig);
                atm = sig.atom(atm);
                const projected = project(sig, atm, atoms_proj, tuples_proj);
                atoms_proj = projected.atoms;
                tuples_proj = projected.tuples;
            });

            // Remove unconnected nodes
            if (hide_unconnected) atoms_proj = remove_unconnected(atoms_proj, tuples_proj);

            // Finished
            needs_reproject = false;

            // Apply attributes to nodes
            apply_attributes(atoms_proj, tuples_proj);

            // Apply source and target attributes to links
            apply_source_target_attribute(tuples_proj);

        }

    }

    return _graph_data;

}

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

function layout () {

    let selection,
        groups = [];

    let type = 'draggable',
        sim = d3$1.forceSimulation()
            .alphaDecay(0.1)
            .force('collide', d3$1.forceCollide(75))
            .force('link', d3$1.forceLink())
            .force('x', d3$1.forceX())
            .force('y', d3$1.forceY())
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
            g(d3$1.select(this));
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
        if (type === 'simulation' && !d3$1.event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged (d) {
        d.fx = d3$1.event.x;
        d.fy = d3$1.event.y;
        update();
    }

    function dragended (d) {
        if (type === 'simulation' && !d3$1.event.active) sim.alphaTarget(0);
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
                a.fx = a.x(width);
                a.fy = a.y(height);
            }
        });

        // Run the layout simulation to get initial positions
        const cx = parseInt(svg.style('width')) / 2,
            cy = parseInt(svg.style('height')) / 2;

        const simulation = d3$1.forceSimulation(atoms)
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

function group () {

    let data,
        shape,
        selection,
        simulation;

    let index,
        label;

    function _group (g) {

        if (data && shape) {

            // Bind the data (using shape) and get the selected visual elements
            selection = shape(g, data);

        }

        return selection;

    }

    _group.data = function (_) {
        return arguments.length ? (data = _, _group) : data;
    };

    _group.drag = function () {
        return shape.drag();
    };

    _group.draggable = function (_) {
        return shape.draggable(_);
    };

    _group.index = function (_) {
        return arguments.length ? (index = _, _group) : index;
    };

    _group.label = function (_) {
        return arguments.length ? (label = _, _group) : label;
    };

    _group.reposition = function () {
        if (shape)
            shape.reposition();
        return _group;
    };

    _group.selection = function () {
        return selection;
    };

    _group.shape = function (_) {
        return arguments.length ? (shape = _, _group) : shape;
    };

    _group.simulation = function (_) {
        return arguments.length ? (simulation = _, _group) : simulation;
    };


    return _group;

}

function arrow () {

    let selection;

    let link,
        target;

    let draggable = false,
        drag = d3$1.drag();

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('d', 'M -10 -5 L 0 0 L -10 5 z');

    styles
        .set('fill', '#555')
        .set('stroke', '#555')
        .set('stroke-width', 2);

    function _arrow (g, data) {

        selection = g
            .selectAll('path')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('path')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        return selection;

    }

    _arrow.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _arrow)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _arrow.drag = function () {
        return drag;
    };

    _arrow.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _arrow) : draggable;
    };

    _arrow.link = function (_) {
        return arguments.length ? (link = _, _arrow) : link;
    };

    _arrow.reposition = function () {

        selection.attr('transform', function (datum) {

            // Get the visual element of the link (will be a path)
            const link_element = link.element(datum);

            // Get the visual element the arrow will be pointing to (e.g. circle, rect)
            const target_element = target.element(datum.target);

            // Calculate intersection point and angle
            if (link_element && target_element) {
                const intersection = target.intersection(target_element, link_element);
                return 'translate(' + intersection.x + ',' + intersection.y + ') rotate(' + intersection.angle + ')';
            }

        });

    };

    _arrow.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _arrow)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _arrow.target = function (_) {
        return arguments.length ? (target = _, _arrow) : target;
    };

    _arrow.type = function () {
        return 'arrow';
    };

    return _arrow;

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

            // Calculate difference between previous midpoint and new midpoint
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

    let selection;

    let x = function (d) {
            return d.x;
        },
        y = function (d) {
            return d.y;
        };

    let draggable = true,
        drag = d3$1.drag()
            .on('drag.circle', dragged);

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('r', 32);

    styles
        .set('fill', 'steelblue')
        .set('stroke', 'white')
        .set('stroke-width', 2);

    function _circle (g, data) {

        selection = g
            .selectAll('circle')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 0)
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        return selection;

    }

    _circle.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _circle)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _circle.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3$1.select(element).datum() === datum;
            });
    };

    _circle.drag = function () {
        return drag;
    };

    _circle.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _circle) : draggable;
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
        if (selection)
            selection
                .attr('cx', x)
                .attr('cy', y);
        return _circle;
    };

    _circle.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _circle)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _circle.type = function () {
        return 'circle';
    };


    function dragged(d) {
        if (draggable) {
            d.x = d3$1.event.x;
            d.y = d3$1.event.y;
        }
    }


    return _circle;

}

function label () {

    let selection;

    let accessor = label_accessor;
    let aliases = d3$1.map();

    let x = function (d) {
            return d.x;
        },
        y = function (d) {
            return d.y;
        };

    let draggable = false,
        drag = d3$1.drag();

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('dy', '0.35em');

    styles
        .set('fill', '#fff')
        .set('font-family', 'monospace')
        .set('font-size', 18)
        .set('font-weight', 'bold')
        .set('pointer-events', 'none')
        .set('text-anchor', 'middle')
        .set('-webkit-user-select', 'none')
        .set('-moz-user-select', 'none')
        .set('-ms-user-select', 'none')
        .set('user-select', 'none');

    function _label (g, data) {

        selection = g
            .selectAll('text')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('text')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.text(alias);
        selection.call(drag);

        return selection;

    }

    _label.accessor = function (_) {
        return arguments.length ? (accessor = _, _label) : accessor;
    };

    _label.alias = function (_) {
        if (arguments.length === 1) return aliases.get(arguments[0]);
        if (arguments.length === 2) {
            arguments[1] === null ?
                aliases.remove(arguments[0]) :
                aliases.set(arguments[0], arguments[1]);
        }
        return _label;
    };

    _label.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _label)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _label.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3$1.select(element).datum() === datum;
            });
    };

    _label.drag = function () {
        return drag;
    };

    _label.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _label) : draggable;
    };

    _label.reposition = function () {
        if (selection)
            selection
                .attr('x', x)
                .attr('y', y);
        return _label;
    };

    _label.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _label)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _label.text = function (_) {
        if (arguments.length) {
            typeof _ === 'function'
                ? accessor = _
                : accessor = constant(_);
            if (selection)
                selection.text(alias);
            return _label;
        }
        return accessor;
    };

    _label.type = function (_) {
        return 'label';
    };

    _label.x = function (_) {
        if (arguments.length) {
            if (typeof _ === 'function') {
                x = _;
            } else {
                x = constant(_);
            }
            return _label;
        }
        return x;
    };

    _label.y = function (_) {
        if (arguments.length) {
            if (typeof _ === 'function') {
                y = _;
            } else {
                y = constant(_);
            }
            return _label;
        }
        return y;
    };


    function alias (d) {
        return aliases.get(accessor(d)) || accessor(d);
    }

    function label_accessor (d) {
        return d.label();
    }


    return _label;

}

function arc_straight (d) {
    const line = d3$1.line();
    return line([
        [d.source.x, d.source.y],
        [d.target.x, d.target.y]
    ]);
}

function line () {

    let selection;

    let curve_function = arc_straight;

    let draggable = false,
        drag = d3$1.drag();

    let attributes = d3$1.map(),
        styles = d3$1.map();

    styles
        .set('fill', 'none')
        .set('stroke', '#555')
        .set('stroke-width', 1);

    function _line (g, data) {

        selection = g
            .selectAll('path')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('path')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        return selection;

    }


    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _line)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _line.curve = function (_) {
        return arguments.length ? (curve_function = _, _line) : curve_function;
    };

    _line.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3$1.select(element).datum() === datum;
            });
    };

    _line.drag = function () {
        return drag;
    };

    _line.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _line) : draggable;
    };

    _line.reposition = function () {

        if (selection)
            selection
                .attr('d', curve_function);

        return _line;

    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _line)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _line.type = function () {
        return 'line';
    };


    return _line;

}

function rectangle () {

    let selection;

    let x = function (d) {
        const width = +d3$1.select(this).attr('width') || 0;
        return d.x - width / 2;
    };

    let y = function (d) {
        const height = +d3$1.select(this).attr('height') || 0;
        return d.y - height / 2;
    };

    let draggable = true,
        drag = d3$1.drag()
            .on('drag.circle', dragged);

    let attributes = d3$1.map(),
        styles = d3$1.map();

    attributes
        .set('width', 100)
        .set('height', 60);

    styles
        .set('fill', 'steelblue')
        .set('stroke', 'white')
        .set('stroke-width', 2);

    function _rectangle (g, data) {

        selection = g
            .selectAll('rect')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('rect')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        return selection;

    }

    _rectangle.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _rectangle)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _rectangle.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3$1.select(element).datum() === datum;
            });
    };

    _rectangle.drag = function () {
        return drag;
    };

    _rectangle.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _rectangle) : draggable;
    };

    _rectangle.intersection = function (element, path) {

        const target_rect = d3$1.select(element);
        const w = parseInt(target_rect.attr('width'));
        const h = parseInt(target_rect.attr('height'));
        const x = parseInt(target_rect.attr('x'));
        const y = parseInt(target_rect.attr('y'));
        const center = {
            x: x + w / 2,
            y: y + h / 2
        };
        let intersection = find_intersection(path, is_inside(x, y, w, h));
        if (intersection) {
            intersection = snap_to_edge(intersection, x, y, w, h);
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
        if (selection)
            selection
                .attr('x', x)
                .attr('y', y);
        return _rectangle;
    };

    _rectangle.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _rectangle)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _rectangle.type = function () {
        return 'rectangle';
    };


    function dragged(d) {
        if (draggable) {
            d.x = d3$1.event.x;
            d.y = d3$1.event.y;
        }
    }

    function is_inside(x, y, w, h) {

        const f = function (pt) {
            return pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
        };

        f.x = x;
        f.y = y;
        f.w = w;
        f.h = h;

        return f;

    }

    function snap_to_edge (pt, x, y, w, h) {

        const tol = 1;
        let xp = pt.x;
        let yp = pt.y;
        if (Math.abs(xp - x) < tol) xp = x;
        if (Math.abs(xp - (x + w)) < tol) xp = x + w;
        if (Math.abs(yp - y) < tol) yp = y;
        if (Math.abs(yp - (y + h)) < tol) yp = y + h;
        return {
            x: xp,
            y: yp
        };

    }

    return _rectangle;

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

function atom_is_sig (sig) {
    function is_sig (atm) {
        return atm.parent()
            ? atm.parent().label() === sig || is_sig(atm.parent())
            : false;
    }
    return is_sig;
}

function tuple_is_field (fld) {
    return function (tup) {
        return tup.field().label() === fld;
    }
}

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
                const label$$1 = o.key || 'alloy-group-' + index;

                // Create the group
                const g = group()
                    .index(index)
                    .label(label$$1);

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
            return {
                data: _data.filter(build_filter(d.filter)),
                type: d.source
            };
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
        const _arrow = arrow();
        apply_attrs(_arrow, a['attribute']);
        apply_styles(_arrow, a['style']);
        return _arrow
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

    function find_atom (atoms, label$$1) {
        return atoms.find(function (a) {
            return a.label() === label$$1;
        });
    }

    function find_group (groups, label$$1) {
        return groups.find(function (g) {
            return g.label() === label$$1;
        });
    }

}

exports.graph_data = graph_data;
exports.instance = instance;
exports.layout = layout;
exports.parse_json = parse_json;

Object.defineProperty(exports, '__esModule', { value: true });

})));
