# GitBook Variables Plugin

> Load variables from files and use them in your [GitBook](https://www.gitbook.com) templates.

[![npm version](https://badge.fury.io/js/gitbook-plugin-variables.svg)](https://badge.fury.io/js/gitbook-plugin-variables)
[![build status](https://travis-ci.org/AlphaHydrae/gitbook-plugin-variables.svg?branch=master)](https://travis-ci.org/AlphaHydrae/gitbook-plugin-variables)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Requirements](#requirements)
- [Usage](#usage)
- [Configuration](#configuration)
  - [`files`](#files)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Requirements

* [GitBook](https://www.gitbook.com) 3+
* [Node.js](https://nodejs.org) 8+



## Usage

Add the plugin to your `book.json` file:

```json
{
  "plugins": [ "variables" ],
  "pluginsConfig": {
    "variables": {
      "files": {
        "myVariable": "data.json"
      }
    }
  }
}
```

This will load the `data.json` file in your book's directory and make its contents available as the `myVariable` variable.
You may then use it in your Markdown, for example like this:

```md
The file `data.json` contains: {{ book.myVariable }}
```



## Configuration

The following options are available under your `book.json` file's `pluginsConfig.variables` section.

### `files`

An object where each key is a variable to add to your book, and the corresponding value is a file path or an array of file paths to load into that variable.

This configuration loads the contents of 2 files into variables `a` and `b`:

```json
{
  "plugins": [ "variables" ],
  "pluginsConfig": {
    "variables": {
      "files": {
        "a": "data/a/some.json",
        "b": "data/b/c/some.yml"
      }
    }
  }
}
```

Multiple files may be loaded into the same variable:

```json
{
  "plugins": [ "variables" ],
  "pluginsConfig": {
    "variables": {
      "files": {
        "a": [ "data/a/some.json", "data/b/c/some.yml" ]
      }
    }
  }
}
```

* Successive files representing arrays are concatenated in order (e.g. `["foo"]` and `["bar"]` becomes `["foo","bar"]`).
* Successive files representing objects are merged in order. (e.g. `{"foo":"bar"}` and `{"foo":"qux","bar":"baz"}` becomes `{"foo":"qux","bar":"baz"}`).
* Other or differing successive types simply replace the previous value (e.g. `["foo"]` and `{"foo":"bar"}` becomes `{"foo":"bar"}`).
