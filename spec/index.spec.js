const { expect } = require('chai');
const cheerio = require('cheerio');
const tester = require('gitbook-tester');
const parallel = require('mocha.parallel');
const path = require('path');

const root = path.resolve(path.join(__dirname, '..'));
const timeout = process.env.GITBOOK_TIMEOUT ? parseInt(process.env.GITBOOK_TIMEOUT, 10) : 10000;

const actualDescribe = process.env.PARALLEL ? parallel : describe;

const standardTests = [
  { file: 'data.js', contents: 'exports.foo = "bar";' },
  { file: 'data.json', contents: '{"foo":"bar"}' },
  { file: 'data.yml', contents: 'foo: bar' },
  { file: 'async.js', contents: 'module.exports = Promise.resolve({ foo: "bar" });' },
  { file: 'function.js', contents: 'module.exports = () => ({ foo: "bar" })' },
  { file: 'async-function.js', contents: 'module.exports = () => Promise.resolve({ foo: "bar" })' }
];

actualDescribe('gitbook-plugin-variables', function() {
  this.timeout(timeout);

  standardTests.forEach(config => {
    it(`should merge variables from ${config.file}`, async () => {

      const result = await build(builder => builder
        .withContent('FOO {{ book.foo }} BAZ')
        .withFile(config.file, config.contents)
        .withBookJson({
          pluginsConfig: {
            variables: {
              files: config.file
            }
          }
        }));

      expect(getText(result)).to.equal('FOO bar BAZ');
    });

    it(`should load a variable from ${config.file}`, async () => {

      const result = await build(builder => builder
        .withContent('FOO {{ book.data.foo }} BAZ')
        .withFile(config.file, config.contents)
        .withBookJson({
          pluginsConfig: {
            variables: {
              files: {
                data: config.file
              }
            }
          }
        }));

      expect(getText(result)).to.equal('FOO bar BAZ');
    });
  });

  it('should interpret file globs', async () => {

    const result = await build(builder => builder
      .withContent('START {{ book.foo }} {{ book.bar }} {{ book.baz }} END')
      .withFile('data.yml', 'foo: bar')
      .withFile('data.json', '{"bar":"baz"}')
      .withFile('data.js', 'exports.foo = "qux";\nexports.baz = "corge";')
      .withBookJson({
        pluginsConfig: {
          variables: {
            files: 'data.*'
          }
        }
      }));

    expect(getText(result)).to.equal('START bar baz corge END');
  });

  it('should merge arrays', async () => {

    const result = await build(builder => builder
      .withContent('{{ book.data[0] }} {{ book.data[1] }} {{ book.data | length }}')
      .withFile('data.yml', '- foo')
      .withFile('data.json', '["bar"]')
      .withBookJson({
        pluginsConfig: {
          variables: {
            files: {
              data: [ 'data.yml', 'data.json' ]
            }
          }
        }
      }));

    expect(getText(result)).to.equal('foo bar 2');
  });

  it('should merge objects', async () => {

    const result = await build(builder => builder
      .withContent('{{ book.data.a }} {{ book.data.b }} {{ book.data.c }}')
      .withFile('data.yml', 'a: foo\nb: bar')
      .withFile('data.json', '{"b":"baz","c":"qux"}')
      .withBookJson({
        pluginsConfig: {
          variables: {
            files: {
              data: [ 'data.yml', 'data.json' ]
            }
          }
        }
      }));

    expect(getText(result)).to.equal('foo baz qux');
  });
});

function build(callback) {

  const builder = tester.builder().withLocalPlugin(root)
  callback(builder);

  return builder.create();
}

function getText(result) {
  const $ = cheerio.load(result[0].content);
  return $('p').text();
}
