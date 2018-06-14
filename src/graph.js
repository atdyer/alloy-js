import * as d3 from 'd3';
import {tuple} from "./tuple";

export {graph};

function graph (inst) {

    const atom_list = signatures_to_atoms(inst);
    const tuple_list = fields_to_tuples(inst, atom_list);

    const atoms = atom_list.map(atom_to_object);
    const tuples = tuple_list.map(tuple_to_object(atoms));

    const projections = d3.map();
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

    _graph.projections = function () {
        return projections;
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
    const atom_map = d3.map(atoms, function (atm) {
        return atm.label();
    });
    const tuples = d3.merge(
        inst.fields()
            .map(function (fld) {
                return fld.tuples();
            })
    );
    return tuples.map(function (tup) {
        const atoms = tup.atoms().map(function (atm) {
            return atom_map.get(atm.label());
        });
        return tuple(atoms, tup.field());
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
        ? d3.entries(d.fields).forEach(f => {
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
            ]
        }
    } else {
        tuple.source.fields[tuple.field] = tuple.projection.slice(1);
    }
}

function signatures_to_atoms (inst) {
    return d3.merge(
        inst.signatures()
            .map(function (sig) {
                return sig.atoms();
            })
    );
}
