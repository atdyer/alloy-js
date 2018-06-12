import * as d3 from 'd3';
import {
    apply_attributes,
    apply_source_target_attribute,
    flatten_fields,
    flatten_signatures,
    project,
    remove_unconnected
} from "./util/graph-util";

export {graph_data};

function graph_data (inst) {

    const atoms = flatten_signatures(inst),
        tuples = flatten_fields(inst, atoms),
        projections = d3.map();

    let atoms_proj = atoms.slice(),
        tuples_proj = tuples.slice();

    let hide_meta = true,
        hide_private = true,
        hide_unconnected = false,
        needs_reproject = true;

    const _graph_data = {};


    _graph_data.hide_meta = function (_) {
        if (!arguments.length) return hide_meta;
        hide_meta = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.hide_private = function (_) {
        if (!arguments.length) return hide_private;
        hide_private = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.hide_unconnected = function (_) {
        if (!arguments.length) return hide_unconnected;
        hide_unconnected = !!_;
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.project = function (_) {
        if (arguments.length < 2) return projections;
        projections.set(arguments[0], arguments[1]);
        needs_reproject = true;
        return _graph_data;
    };

    _graph_data.atoms = function () {
        reproject();
        return atoms_proj;
    };

    _graph_data.tuples = function () {
        reproject();
        return tuples_proj;
    };

    _graph_data.unproject = function (_) {
        projections.remove(_);
        needs_reproject = true;
        return _graph_data;
    };

    function reproject () {

        if (needs_reproject) {

            // Get copy of unprojected atoms and tuples
            atoms_proj = atoms.slice();
            tuples_proj = tuples.slice();

            // Apply each projection
            projections.each(function (atm, sig) {
                sig = inst.signature(sig);
                atm = sig.atom(atm);
                const projected = project(sig, atm, atoms_proj, tuples_proj);
                atoms_proj = projected.atoms;
                tuples_proj = projected.tuples;
            });

            // Remove unconnected nodes
            if (hide_unconnected) atoms_proj = remove_unconnected(atoms_proj, tuples_proj);

            // Finished
            needs_reproject = false;

            // Apply attributes to nodes
            apply_attributes(atoms_proj, tuples_proj);

            // Apply source and target attributes to links
            apply_source_target_attribute(tuples_proj);

        }

    }

    return _graph_data;

}
