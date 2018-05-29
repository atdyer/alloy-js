import {tuple} from "../tuple";

export {
    add_attribute,
    apply_attributes,
    apply_source_target_attribute,
    array_includes,
    atoms_recursive,
    constant,
    filter_atoms,
    flatten_fields,
    flatten_signatures,
    filter_tuples,
    index_sort,
    reduce_tuples,
    print_atoms,
    print_field_attribute,
    print_tuples,
    project,
    remove_unconnected
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
            if (tup.hasOwnProperty(key) && key !== 'arity' && key !== 'atoms' && key !== 'field' && key !== 'id') {
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

// A function used by Array.sort() to sort based on
// the index property of all objects in the array
function index_sort (a, b) {
    return a.index - b.index;
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

function print_atoms (atoms) {
    atoms.forEach(function (atm) {
        console.log(atm.label());
    });
}

function print_field_attribute (atoms) {
    atoms.forEach(function (atm) {
        console.log(atm.label());
        atm.field.forEach(function (tup) {
            console.log('\t' + tup.field().label() + ': ' + tup.atoms().reduce(function (acc, atm) {
                return acc + atm.label() + ' ';
            }, ''));
        });
    })
}

function print_tuples (tuples) {
    tuples.forEach(function (tup) {
        console.log(tup.field().label() + ': ' + tup.atoms().reduce(function (acc, atm) {
            return acc + atm.label() + ' ';
        }, ''));
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