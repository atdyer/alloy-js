export {tuple_is_field};

function tuple_is_field (fld) {
    return function (tup) {
        return tup.field().label() === fld;
    }
}