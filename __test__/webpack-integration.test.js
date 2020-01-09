const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const UnusedWebpackPlugin = require('../index');

const projectDir = path.resolve(__dirname, './test-project');
const clearDist = async () => {
  await fs.remove(path.resolve(projectDir, 'dist'));
};

let output = '';
beforeEach(async () => {
  await clearDist();
  process.stdout.write = jest.fn().mockImplementation((str) => {
    output += str;
  });
});
afterEach(async () => {
  await clearDist();
  output = '';
  process.stdout.write.mockRestore();
});

describe('Integration Test', () => {
  it('Default Configuration', (done) => {
    const webpackConfig = {
      context: projectDir,
      entry: path.resolve(projectDir, 'src/index.js'),
      output: { path: path.resolve(projectDir, 'dist') },
      plugins: [
        new UnusedWebpackPlugin({
          directories: [path.join(projectDir, 'src')],
        }),
      ],
    };
    webpack(webpackConfig, (err) => {
      if (err) {
        done(err);
        return;
      }
      expect(output).toEqual(expect.not.stringContaining('index.js'));
      expect(output).toEqual(expect.not.stringContaining('button.js'));
      expect(output).toEqual(expect.stringContaining('unused-1.js'));
      expect(output).toEqual(expect.stringContaining('unused-2.js'));
      expect(output).toEqual(expect.stringContaining('unused-3.js'));
      done();
    });
  });
});
