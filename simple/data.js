import * as d3 from 'd3';
import {tuple} from "./tuple";

export {data};

function data (inst) {

    const atom_list = flatten_signatures(inst);
    const tuple_list = flatten_fields(inst, atom_list);

    const atoms = atom_list.map(atom_to_object);
    const tuples = tuple_list.map(tuple_to_object(atoms));

    let projected_atoms = atoms;
    let projected_tuples = tuples;
    let needs_reproject = true;

    const graph_data = {};
    const projections = d3.map();

    graph_data.atoms = function () {
        if (needs_reproject) reproject();
        return projected_atoms;
    };

    graph_data.clear_projections = function () {
        projections.clear();
        needs_reproject = true;
        return graph_data;
    };

    graph_data.remove_projection = function (sig) {
        projections.remove(sig);
        needs_reproject = true;
        return graph_data;
    };

    graph_data.set_projection = function (sig, atm) {
        projections.set(sig, atm);
        needs_reproject = true;
        return graph_data;
    };

    graph_data.tuples = function () {
        if (needs_reproject) reproject();
        return projected_tuples;
    };

    function reproject () {
        projected_atoms = atoms;
        projected_tuples = tuples;
        projected_tuples.forEach(function (tuple) {
            tuple.projection = tuple.atoms;
        });
        projections.each(function (atm, sig) {
            let atom = projected_atoms.find(a => a.id === atm);
            let prj = project(sig, atom, projected_atoms, projected_tuples);
            projected_atoms = prj.atoms;
            projected_tuples = prj.tuples;
        });
        permute_joins(projected_atoms, projected_tuples);
        apply_source_target(projected_tuples);
        needs_reproject = false;
    }

    return graph_data;

}


function atom_to_object (atom) {
    return {
        atom: atom,
        id: atom.label(),
        signature: build_signature_list(atom),
        type: 'atom'
    }
}

function tuple_to_object (atoms) {
    return function (tuple) {
        return {
            atoms: tuple.atoms().map(atom => atoms.find(a => a.atom === atom)),
            field: tuple.field().label(),
            id: tuple.id(),
            projection: tuple.atoms().map(atom => atoms.find(a => a.atom === atom)),
            type: 'tuple'
        }
    }
}


function apply_source_target (tuples) {
    tuples.forEach(function (tup) {
        if (tup.projection.length) {
            tup.source = tup.projection[0];
            tup.target = tup.projection[tup.projection.length - 1];
        }
    });
}

function _atom_to_object (atom) {
    return {
        atom: atom,
        id: atom.label(),
        signature: build_signature_list(atom),
        type: 'atom'
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

function flatten_signatures (inst) {

    return d3.merge(
        inst.signatures()
            .map(function (sig) {
                return sig.atoms()
            })
    );

}

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

function permute_joins (atoms, tuples) {

    // TODO: Probably rethink this... how big will instances actually get?
    // Oh boy... dear quadratic gods: please be gentle.

    // Clear existing attributes
    atoms.forEach(a => a.attributes = {});
    tuples.forEach(t => t.attributes = {});

    atoms.forEach(function (atom) {

        tuples.forEach(function (tuple) {

            if (tuple.projection.length && tuple.projection[0] === atom) {

                if (!(tuple.field in atom.attributes))
                    atom.attributes[tuple.field] = [];
                atom.attributes[tuple.field].push(tuple.projection.slice(1));

            }

        });

    });

    tuples.forEach(function (tuple) {

        tuples.forEach(function (t) {

            function index_match (acc, val, idx) {
                return acc && val === t.projection[idx];
            }

            if (tuple.projection.length < t.projection.length) {

                if (tuple.projection.reduce(index_match, true) === true) {

                    if (!(t.field in tuple.attributes))
                        tuple.attributes[t.field] = [];
                    tuple.attributes[t.field].push(t.projection.slice(tuple.projection.length));

                }

            }

        });

    })

}

function project(sig, atm, atoms, tuples) {

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

    // Remove atm from remaining tuples
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

function _tuple_to_object (atoms) {
    return function (tuple) {
        return {
            arity: tuple.arity(),
            atoms: tuple.atoms().map(atom => atoms.find(a => a.atom === atom)),
            field: tuple.field().label(),
            id: tuple.id(),
            tuple: tuple,
            type: 'tuple'
        }
    }
}