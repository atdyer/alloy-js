export {atom_is_sig};

function atom_is_sig (sig) {
    function is_sig (atm) {
        return atm.parent()
            ? atm.parent().label() === sig || is_sig(atm.parent())
            : false;
    }
    return is_sig;
}