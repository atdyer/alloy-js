export { tuple }

function tuple (atoms, field) {

    const _tuple = {};

    const _atoms = atoms,
        _field = field;

    _tuple.arity = function () {
        return _atoms.length;
    };

    _tuple.atoms = function () {
        return _atoms;
    };

    _tuple.field = function () {
        return _field;
    };

    _tuple.id = function () {
        return _tuple.field().label() + '[' + _tuple.atoms().map(a => a.label()) + ']';
    };

    return _tuple;

}