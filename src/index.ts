import * as glob from 'fast-glob';
import { readFile } from 'fs-extra';
import { safeLoad as parseYaml } from 'js-yaml';
import { assign, defaults, each, isArray, isPlainObject, reduce } from 'lodash';
import * as nativeRequire from 'native-require';
import { resolve as resolvePath } from 'path';

export const blocks = {};
export const filters = {};
export const hooks = { init };

interface GitBookHook {
  config: GitBookConfig;
  resolve(path: string): string;
}

interface GitBookConfig {
  values: GitBookConfigValues;
  get(key: string): any;
  set(key: string, value: any): void;
}

interface GitBookConfigValues {
  pluginsConfig: GitBookPluginsConfig;
}

interface GitBookPluginsConfig {
  variables: { [key: string]: any };
  [key: string]: any;
}

async function init(this: GitBookHook) {

  const contentRoot = this.resolve('.');
  const bookConfig = this.config.values;
  const pluginConfig = defaults({}, bookConfig.pluginsConfig.variables, {
    files: {}
  });

  const variablesToAdd = {};

  const files = pluginConfig.files;
  if (typeof files === 'string' || isArray(files)) {
    assign(variablesToAdd, await loadFileList(files, true, true, contentRoot));
  } else {
    each(pluginConfig.files, (value, key) => {
      variablesToAdd[key] = loadFileList(value, true, false, contentRoot);
    });

    for (const key in variablesToAdd) {
      variablesToAdd[key] = await variablesToAdd[key];
    }
  }

  this.config.set('variables', { ...this.config.get('variables'), ...variablesToAdd });
}

async function loadFile(absolutePath: string, mustBeObject: boolean) {
  if (absolutePath.match(/\.ya?ml$/)) {
    const contents = parseYaml(await readFile(absolutePath, 'utf8'));
    return ensureObject(absolutePath, contents, mustBeObject);
  } else if (absolutePath.match(/\.js(?:on)?$/)) {
    const contents = nativeRequire(absolutePath);
    const resolvedContents = await (typeof contents === 'function' ? contents() : contents);
    return ensureObject(absolutePath, resolvedContents, mustBeObject);
  } else {
    throw new Error(`Only .js, .json and .yml files are supported by the variables plugin: "${absolutePath}" is not a supported format`);
  }
}

async function loadFileList(fileOrList: string | string[], required: boolean, mustBeObject: boolean, contentRoot: string) {

  const files = await glob<string>(toArray(fileOrList), { cwd: contentRoot });
  if (required && !files.length) {
    throw new Error(`No files to load were found matching ${JSON.stringify(fileOrList)}`);
  }

  const contents = await Promise.all(files.map(file => loadFile(resolvePath(contentRoot, file), mustBeObject)));

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

function toArray<T>(value: T | T[]): T[] {
  if (value === undefined) {
    return [];
  }

  return isArray(value) ? value : [ value ];
}

function ensureObject(file: string, value: any, mustBeObject: boolean) {
  if (mustBeObject && !isPlainObject(value)) {
    throw new Error(`File "${file}" exports a value of type ${typeof value}, but a plain object is required`);
  }

  return value;
}
