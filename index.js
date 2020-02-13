const path = require('path');
const chalk = require('chalk');
const { searchFiles } = require('./lib/utils');

function UnusedPlugin(options) {
  this.sourceDirectories = options.directories || [];
  this.exclude = options.exclude || [];
  this.root = options.root;
  this.failOnUnused = options.failOnUnused || false;
  this.useGitIgnore = options.useGitIgnore || true;
  this.outputFile = options.outputFile || null;
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
      .then(outputDuplicatedFiles.bind(this, compilation))
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

function outputDuplicatedFiles(compilation, filesByDirectory) {
  const allFiles = filesByDirectory.reduce(
    (array, item) => array.concat(item),
    [],
  );
  if (!allFiles.length) {
    return [];
  }

  if (this.outputFile) {
    emitDuplicatedFiles(compilation, this.outputFile, allFiles);
  } else {
    logDuplicatedFiles(
      allFiles,
      filesByDirectory,
      this.sourceDirectories,
      this.root,
    );
  }

  return allFiles;
}

function emitDuplicatedFiles(compilation, outputFile, allFiles) {
  const output = allFiles.join('\n');

  // eslint-disable-next-line no-param-reassign
  compilation.assets[outputFile] = {
    source: () => output,
    size: () => output.length,
  };
}

function logDuplicatedFiles(
  allFiles,
  filesByDirectory,
  sourceDirectories,
  root,
) {
  process.stdout.write('\n');
  process.stdout.write(chalk.green('\n*** Unused Plugin ***\n'));
  process.stdout.write(
    chalk.red(`${allFiles.length} unused source files found.\n`),
  );

  filesByDirectory.forEach((files, index) => {
    if (files.length === 0) return;
    const directory = sourceDirectories[index];
    const relative = root ? path.relative(root, directory) : directory;

    process.stdout.write(chalk.blue(`\n● ${relative}\n`));
    files.forEach(file => process.stdout.write(
      chalk.yellow(`    • ${path.relative(directory, file)}\n`),
    ));
  });

  process.stdout.write(chalk.green('\n*** Unused Plugin ***\n\n'));
}
