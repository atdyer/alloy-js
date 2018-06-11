import * as d3 from 'd3';
import { atom } from './atom';

export { signature };

function signature (selection) {

    const _signature = {};

    const atoms = d3.map();
    let parent;
    const children = [];


    _signature.add_child = function (child) {
        children.push(child);
    };

    _signature.atom = function (label) {
        let a = atoms.get(label);
        if (!a) {
            children.find(function (child) {
                return a = child.atom(label);
            });
        }
        return a;
    };

    _signature.atoms = function () {
        return atoms.values();
    };

    _signature.children = function () {
        return children;
    };

    _signature.find_parent = function (signatures) {
        parent = signatures.find(function (sig) {
            return sig.id() === _signature.parent_id();
        });
        if (parent) {
            parent.add_child(_signature);
        }
        return parent;
    };

    _signature.id = function () {
        return selection.attr('ID');
    };

    _signature.label = function () {
        return selection.attr('label');
    };

    _signature.parent = function () {
        return parent;
    };

    _signature.parent_id = function () {
        return selection.attr('parentID');
    };

    _signature.private = function () {
        return selection.attr('private') === 'yes';
    };


    selection.selectAll('atom')
        .each(function () {
            const atm = atom(d3.select(this), _signature);
            atoms.set(atm.label(), atm);
        });

    return _signature;

}