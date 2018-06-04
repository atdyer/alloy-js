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

    const graph_data = {};
    const projections = d3.map();

    graph_data.atoms = function () {
        return projected_atoms;
    };

    graph_data.remove_projection = function (sig) {
        projections.remove(sig);
        reproject();
    };

    graph_data.set_projection = function (sig, atm) {
        projections.set(sig, atm);
        reproject();
    };

    graph_data.tuples = function () {
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
            // apply_attributes(projected_atoms, projected_tuples);
        });
    }


    return graph_data;

}


function apply_attributes (atoms, tuples) {

    // Clear existing attributes
    atoms.forEach(a => a.attributes = {});
    tuples.forEach(t => t.attributes = {});

    // For atoms, expose fields as attributes
    atoms.forEach(function (atom) {

        tuples.forEach(function (tuple) {

            tuple = tuple.tuple;

            if (tuple.arity() > 1 && tuple.atoms()[0] === atom) {

                console.log(atom.id, tuple.atoms.map(a => a.id), tuple.arity);

                atom.attributes[tuple.field] = tuple.atoms.length === 2
                    ? tuple.atoms[1]
                    : tuple.atoms.slice(1);

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

function project (sig, atm, atoms, tuples) {

    // List of atoms that are in the projected signature (or child signature)
    const projected_atoms = atoms_of_signature(sig, atoms);
    console.log('Atoms of signature ' + sig);
    print_atoms(projected_atoms);
    if (!projected_atoms.includes(atm)) {
        return {
            atoms: atoms,
            tuples: tuples
        };
    }

    // List of atoms that are not in the projected signature
    const filtered_atoms = atoms.filter(function (atom) {
        return !projected_atoms.includes(atom);
    });
    console.log('Atoms not of signature ' + sig);
    print_atoms(filtered_atoms);

    console.log('All tuples');
    tuples.forEach(t => print_atoms(t.atoms));

    // Remove the atom we're projecting over from the projected atoms
    projected_atoms.splice(projected_atoms.indexOf(atm), 1);
    console.log('Atoms of signature ' + sig + ' with ' + atm.id + ' removed');
    print_atoms(projected_atoms);

    console.log('All tuples that do not include any atoms from previous list');
    // Remove all relations that contain any of the remaining projected atoms
    const projected_tuples = tuples.filter(function (tuple) {
        return tuple.atoms.reduce(function (acc, atom) {
            return acc && !projected_atoms.includes(atom);
        }, true);
    });
    projected_tuples.forEach(t => print_atoms(t.atoms));

    // Remove the atom we're projecting over from the remaining relations
    projected_tuples.forEach(function (tuple) {
        tuple.atoms = tuple.atoms.filter(function (atom) {
            return atom !== atm;
        })
    });

    console.log('-----');
    return {
        atoms: filtered_atoms,
        tuples: projected_tuples
    };

}

function print_atoms (l) {
    console.log(l.map(a => a.id));
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