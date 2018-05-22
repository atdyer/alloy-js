import * as d3 from 'd3';
import { signature } from './signature';
import { field } from './field';

export { instance };

function instance (doc) {

    if (!arguments.length) return;

    const _instance = {};

    const selection = d3.select(doc),
        a = selection.select('alloy'),      // Alloy
        i = selection.select('instance'),   // Instance
        s = selection.select('source');     // Source

    const sigs = d3.map();
    const sources = d3.map();
    const fields = d3.map();


    _instance.alloy = function () {
        return a.attr('builddate');
    };

    _instance.bitwidth = function () {
        return i.attr('bitwidth');
    };

    _instance.command = function () {
        return i.attr('command');
    };

    _instance.field = function (label) {
        return fields.get(label);
    };

    _instance.fields = function () {
        return fields.values().filter(function (fld) {
            return !fld.private();
        });
    };

    _instance.maxseq = function () {
        return i.attr('maxseq');
    };

    _instance.signature = function (label) {
        return sigs.get(label);
    };

    _instance.signatures = function () {
        return sigs.values().filter(function (sig) {
            return !sig.private();
        });
    };

    _instance.sources = function () {
        return sources;
    };


    // Parse signatures
    i.selectAll('sig')
        .each(function () {
            const sig = signature(d3.select(this));
            sigs.set(sig.label(), sig);
        });

    // Form signature tree
    sigs.each(function (sig) {
        sig.find_parent(sigs.values());
    });

    // Parse fields
    i.selectAll('field')
        .each(function () {
            const fld = field(d3.select(this), sigs.values());
            fields.set(fld.label(), fld);
        });

    // Parse file sources
    s.each(function () {
        const src = d3.select(this);
        const f = filename(src.attr('filename'));
        sources.set(f, src.attr('content'));
    });


    function filename (f) {

        const tokens = f.split('/');
        return tokens[tokens.length - 1];

    }

    return _instance;

}