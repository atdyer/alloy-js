let open = d3.select('#open');
let file = d3.select('#xml-file');
let svg = d3.select('svg');

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
    let data = alloy.data(instance);
    let display = alloy.display(data);
    let timeout = null;

    function apply_yaml () {

        let yaml = editor.getValue();
        let style = jsyaml.safeLoad(yaml);
        display.style(style);
        display(svg);

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

    let left = d3.select('#left')
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
        // value: text,
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
