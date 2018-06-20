let open = d3.select('#open');
let file = d3.select('#xml-file');
let svg = d3.select('svg');
let prj = d3.select('#projections');

open.on('click', function () {
    file.node().click();
});

file.on('change', function () {

    d3.select('#welcome').remove();
    open.remove();

    let file = d3.event.target.files[0];
    let reader = new FileReader();

    reader.onerror = console.log;
    reader.onload = function () {

        let text = reader.result;
        let p = new DOMParser();
        let doc = p.parseFromString(text, 'application/xml');
        initialize(doc);

    };

    reader.readAsText(file);

});

function initialize (doc) {

    let editor = initialize_editor();
    let instance = alloy.instance(doc);
    let data = alloy.graph(instance);
    let display = alloy.display(data);
    let projections = projection_display(signature_atoms(instance));
    let timeout = null;

    projections.on_change(function (style) {

        replace_projections_text(style);
        apply_yaml();

    });

    function apply_yaml () {

        let yaml = editor.getValue();
        let style = jsyaml.safeLoad(yaml);
        display.style(style);
        display(svg);

        projections.style(style);
        projections(prj);

    }

    function replace_projections_text (style) {

        // Find projections section, if one exists, otherwise end of text
        let line_start = 0;
        let line_end = 0;
        let found_start = false;
        let found_end = false;
        editor.eachLine(function (line) {
            if (line.text.trimLeft() === line.text && found_start && !found_end) {
                line_end = line.lineNo();
                found_end = true;
            }
            if (line.text === 'projections:') {
                line_start = line.lineNo();
                found_start = true;
                found_end = false;
            }
        });

        // Make sure there is a blank line at the end of the document
        const last_line_index = editor.lastLine();
        const last_line_text = editor.getLine(last_line_index);
        if (last_line_text.trim().length)
            editor.replaceRange('\n', {line: last_line_index, ch: last_line_text.length});
        if (!found_start)
            line_start = editor.lineCount();
        if (!found_end)
            line_end = editor.lineCount();

        // Generate yaml of projections only
        let proj_text = 'projections' in style
            ? jsyaml.dump({ projections: style['projections'] })
            : '';

        // Set projections in editor
        editor.replaceRange(proj_text, {line: line_start, ch: 0}, {line: line_end, ch: 0});

    }

    function maybe_apply_yaml () {
        clearTimeout(timeout);
        timeout = setTimeout(apply_yaml, 750);
    }

    d3.text('defaults/instance.yaml')
        .then(function (yaml) {

            editor.setValue(yaml);
            editor.on('changes', maybe_apply_yaml);
            apply_yaml();

        });

}

function initialize_editor () {

    let left = d3.select('#editor')
        .style('font-size', '16px');

    function betterTab(cm) {
        if (cm.somethingSelected()) {
            cm.indentSelection("add");
        } else {
            cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
                Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
        }
    }

    return CodeMirror(left.node(), {
        mode: 'yaml',
        theme: 'oceanic-next',
        lineNumbers: true,
        tabSize: 2,
        showCursorWhenSelecting: true,
        styleActiveLine: true,
        viewportMargin: Infinity,
        keyMap: 'sublime',
        extraKeys: { Tab: betterTab }
    });

}
