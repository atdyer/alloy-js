export {
    atom_is_sig,
    is_sig_or_field,
    tuple_is_field
};



function atom_is_sig (sig) {
    return function (atom) {
        return atom.signatures.includes(sig);
    };
}

function is_sig_or_field (sig_or_field) {
    return function (item) {
        return item.type === 'atom'
            ? item.signatures.includes(sig_or_field)
            : item.type === 'tuple'
                ? item.field === sig_or_field
                : false;
    }
}

function tuple_is_field (fld) {
    return function (tup) {
        return tup.field === fld;
    }
}