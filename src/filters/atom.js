export {atom_is_sig};

function atom_is_sig (sig) {
    return function (atom) {
        return atom.signatures.includes(sig);
    };
}