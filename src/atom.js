export { atom };

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