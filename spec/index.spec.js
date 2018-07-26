const { expect } = require('chai');
const cheerio = require('cheerio');
const tester = require('gitbook-tester');
const path = require('path');

const root = path.resolve(path.join(__dirname, '..'));
const timeout = process.env.GITBOOK_TIMEOUT || 10000;

describe('gitbook-plugin-variables', function() {
  this.timeout(timeout);

  [
    { file: 'data.js', contents: 'exports.foo = "bar";' },
    { file: 'data.json', contents: '{"foo":"bar"}' },
    { file: 'data.yml', contents: 'foo: bar' }
  ].forEach(config => {
    it(`should load a variable from a ${path.extname(config.file)} file`, async () => {

      const result = await build(builder => builder
        .withContent('Foo{{ book.data.foo }}')
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

      expect(getText(result)).to.equal('Foobar');
    });
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
