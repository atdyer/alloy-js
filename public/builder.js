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

function initialize (xml) {

    let instance = alloy.instance(xml);

    d3.text('defaults/instance.yaml')
        .then(function (yaml) {

            let editor = initialize_editor(yaml);
            let timeout = null;

            editor.on('changes', function (e) {

                clearTimeout(timeout);

                timeout = setTimeout(function () {

                    render(instance, e.getValue());

                }, 500);

            });

            render(instance, yaml);

        });

}

function initialize_editor (text) {

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
        value: text,
        mode: 'yaml',
        // theme: '3024-day',
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

function render (instance, yaml) {

    let data = alloy.data(instance);
    let style = jsyaml.safeLoad(yaml);
    let layout = alloy.parse_json(style);
    let renderer = layout(data);

    // svg.selectAll('*').remove();
    renderer(svg);

}