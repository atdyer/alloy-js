import * as d3 from 'd3';
import {flatten_fields, flatten_signatures} from "./util/graph-util";

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

    })

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