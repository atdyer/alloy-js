export {
    is_signature,
    is_atom,
    is_signature_or_field,
    is_tuple,
    is_field
};



function is_signature (sig) {
    if (!Array.isArray(sig)) sig = [sig];
    return function (item) {
        return item.type === 'atom' && sig.some(s => item.signatures.includes(s));
    };
}

function is_atom (atom) {
    if (!Array.isArray(atom)) atom = [atom];
    return function (item) {
        return item.type === 'atom' && atom.some(a => a === '*' || a === item.id);
    };
}

function is_signature_or_field (sig_or_field) {
    if (!Array.isArray(sig_or_field)) sig_or_field = [sig_or_field];
    return function (item) {
        return is_signature(sig_or_field)(item) || is_field(sig_or_field)(item);
    }
}

function is_tuple (tuple) {
    if (!Array.isArray(tuple)) tuple = [tuple];
    return function (item) {
        return item.type === 'tuple' && tuple.some(t => t === '*' || t === item.id);
    };
}

function is_field (fld) {
    if (!Array.isArray(fld)) fld = [fld];
    return function (item) {
        return item.type === 'tuple' && fld.includes(item.field);
    };
}