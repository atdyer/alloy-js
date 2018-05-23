Alloy Instances is a simple viewer for sharing [Alloy](http://alloytools.org/) models and instances hosted on [Github Gist](https://gist.github.com). For example, if your Gist URL is:

<code>
    <a href="http://gist.github.com/atdyer/d63c0b8c60d2df23c9453cc422ed3295">
        http://gist.github.com/atdyer/d63c0b8c60d2df23c9453cc422ed3295
    </a>
</code>

Replace the "gist.github.com" with "localhost:3000" in the URL to view it:

<code>
    <a href="http://localhost:3000/atdyer/d63c0b8c60d2df23c9453cc422ed3295">
        http://localhost:3000/atdyer/d63c0b8c60d2df23c9453cc422ed3295
    </a>
</code>

The visualization is created automatically using an XML file exported from Alloy. To export an XML file from Alloy, click `File` &#x2192; `Export To` &#x2192; `XML...`, or press <kbd>CTRL</kbd>+<kbd>X</kbd> when viewing an instance.

Customize the appearance of your Alloy Instance page by adding a `.alloy` YAML configuration. The following options are supported:
* `license` - a supported [SPDX short identifier](https://opensource.org/licenses/alphabetical)
* `height` - the SVG height in pixels; defaults to 500
* `border` - yes if the SVG should have a border; defaults to no
* `show-model` - no if the model code should be hidden; defaults to yes
* `show-style` - no if the instance style should be hidden; defaults to yes
* `instance` - the XML file in the gist to visualize; defaults to `instance.xml`

## Styling

Customize the instance visualization by adding an `instance.yaml` style. A tutorial on styling visualization and description of all options can be found [here](/style). By default, the following style is used:

```yaml
groups:
  edges:
    index: 0
    shape: line
    data: tuples
  nodes:
    index: 1
    shape: rectangle
    data: atoms
  labels:
    index: 2
    shape: label
    data: atoms
  arrows:
    index: 3
    shape:
      type: arrow
      link: edges
      target: nodes
    data: tuples
```

## User Pages

All of your Alloy Instances can be viewed on your user page. For example, if your Gist URL is:

<code><a href='http://gist.github.com/atdyer/'>http://gist.github.com/atdyer</a></code>

Replace the "gist.github.com" with "localhost:3000" in the URL to view it:

<code><a href='http://localhost:3000/atdyer'>http://localhost:3000/atdyer</a></code>

Note that the gist description is used as the title of the Alloy Instance in both the user page and the Alloy Instance page.

## Credits

**Alloy Instances** is run by [Tristan Dyer](https://github.com/atdyer)
**Alloy Instances** is not affiliated with [bl.ocks.org](https://bl.ocks.org/), [Github](https://github.com), or [Alloy](http://alloytools.org)

An enormous amount of credit goes to [Mike Bostock](https://bost.ocks.org/mike/), the creator of [D3](https://d3js.org) and [bl.ocks.org](https://bl.ocks.org/), the site from which I have shamelessly duplicated just about every bit of styling and functionality. Mike is in no way affiliated with Alloy Instances, but I would certainly be remiss if I did not mention his indirect contributions.

Visualizations created using [alloy-js](https://github.com/atdyer/alloy-js.git) ([BSD license](https://github.com/atdyer/alloy-js/blob/master/LICENSE)) and [D3](https://d3js.org) ([BSD license](https://github.com/d3/d3/blob/master/LICENSE)).
Code highlighting by [Highlight.js](https://highlightjs.org/) ([BSD license](https://github.com/isagalaev/highlight.js/blob/master/LICENSE)).
Markdown formatting by [Showdown](http://showdownjs.com/) ([BSD license](https://github.com/showdownjs/showdown/blob/master/license.txt)).