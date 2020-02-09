const path = require('path');
const chalk = require('chalk');
const { searchFiles } = require('./lib/utils');

function UnusedPlugin(options) {
  this.sourceDirectories = options.directories || [];
  this.exclude = options.exclude || [];
  this.root = options.root;
  this.failOnUnused = options.failOnUnused || false;
  this.useGitIgnore = options.useGitIgnore || true;
}

UnusedPlugin.prototype.apply = function apply(compiler) {
  const checkUnused = (compilation, callback) => {
    // Files used by Webpack during compilation
    const usedModules = Array.from(compilation.fileDependencies)
      .filter(file => this.sourceDirectories.some(dir => file.indexOf(dir) !== -1))
      .reduce((obj, item) => Object.assign(obj, { [item]: true }), {});
    // Go through sourceDirectories to find all source files
    Promise.all(
      this.sourceDirectories.map(directory => searchFiles(directory, this.exclude, this.useGitIgnore)),
    )
      // Find unused source files
      .then(files => files.map(array => array.filter(file => !usedModules[file])))
      .then(display.bind(this, compilation))
      .then(continueOrFail.bind(this, this.failOnUnused, compilation))
      .then(callback);
  };
  // webpack 4
  if (compiler.hooks && compiler.hooks.emit) {
    compiler.hooks.emit.tapAsync('UnusedPlugin', checkUnused);
    // webpack 3
  } else {
    compiler.plugin('emit', checkUnused);
  }
};

module.exports = UnusedPlugin;

function continueOrFail(failOnUnused, compilation, allFiles) {
  if (allFiles && allFiles.length > 0) {
    if (failOnUnused) {
      compilation.errors.push(new Error('Unused files found'));
    } else {
      compilation.warnings.push(new Error('Unused files found'));
    }
  }
}

function display(compilation, filesByDirectory) {
  const log = compilation.getLogger
    ? msg => compilation.getLogger('UnusedPlugin').warn(msg)
    : msg => process.stderr.write(chalk.red(`UnusedPlugin: ${msg}\n`));

  const allFiles = filesByDirectory.reduce(
    (array, item) => array.concat(item),
    [],
  );
  if (!allFiles.length) {
    return [];
  }
  log(`${allFiles.length} unused source files found.`);
  filesByDirectory.forEach((files, index) => {
    if (files.length === 0) return;
    const directory = this.sourceDirectories[index];
    const relative = this.root
      ? path.relative(this.root, directory)
      : directory;
    log(`● ${relative}`);
    files.forEach(file => log(`    • ${path.relative(directory, file)}`));
  });

  return allFiles;
}
