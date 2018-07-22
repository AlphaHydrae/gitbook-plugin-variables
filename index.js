const { readFile } = require('fs-extra');
const yaml = require('js-yaml');
const { defaults, each, isArray, isPlainObject, mapValues, reduce, values } = require('lodash');

module.exports = {
  hooks: { init },
  blocks: {},
  filters: {}
};

async function init() {

  const bookConfig = this.config.values;
  const pluginConfig = defaults({}, bookConfig.pluginsConfig.variables, {
    files: {}
  });

  const variablesToAdd = {};
  each(pluginConfig.files, (value, key) => {
    variablesToAdd[key] = loadFileList(value, this);
  });

  await values(variablesToAdd);

  for (const key in variablesToAdd) {
    variablesToAdd[key] = await variablesToAdd[key];
  }

  this.config.set('variables', { ...this.config.get('variables'), ...variablesToAdd });
}

function getFileList(variableSources) {
  return isArray(variableSources) ? variableSources.map(String) : [ String(variableSources) ];
}

async function loadFile(file) {
  if (file.match(/\.yml$/)) {
    return yaml.safeLoad(await readFile(file, 'utf8'));
  } else if (file.match(/\.js(?:on)?$/)) {
    return require(file);
  } else {
    throw new Error(`Only .js, .json and .yml files are supported by the variables plugin: "${file}" is not a supported format`);
  }
}

async function loadFileList(fileOrList, book) {

  const files = toArray(fileOrList).map(file => book.resolve(file));
  const contents = await Promise.all(files.map(loadFile));

  return reduce(contents, (memo, value) => {
    if (isArray(memo) && isArray(value)) {
      return [ ...memo, ...value ];
    } else if (isPlainObject(memo) && isPlainObject(value)) {
      return { ...memo, ...value };
    } else {
      return value;
    }
  });
}

function toArray(value) {
  if (value === undefined) {
    return [];
  }

  return isArray(value) ? value : [ value ];
}
