function xml (file, on_error, on_success) {

    var reader = new FileReader();
    reader.onerror = on_error;
    reader.onload = function () {

        var text = reader.result;
        var p = new DOMParser();
        var doc = p.parseFromString(text, 'application/xml');
        on_success(doc);

    };

    reader.readAsText(file);

}