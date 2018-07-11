const path = require('path');
const recursive = require('recursive-readdir');
const chalk = require('chalk');

function UnusedPlugin(options) {
  this.sourceDirectories = options.directories || [];
  this.exclude = options.exclude || [];
  this.root = options.root;
  this.failOnUnused = options.failOnUnused || false;
}

UnusedPlugin.prototype.apply = function(compiler) {
  compiler.hooks.emit.tapAsync(
    'UnusedPlugin',
    function(compilation, callback) {
      // Files used by Webpack during compilation
      const usedModules = Array.from(compilation.fileDependencies)
        .filter(file =>
          this.sourceDirectories.some(dir => file.indexOf(dir) !== -1)
        )
        .reduce((obj, item) => {
          obj[item] = true;
          return obj;
        }, {});
      // Go through sourceDirectories to find all source files
      Promise.all(
        this.sourceDirectories.map(directory =>
          recursive(directory, this.exclude)
        )
      )
        // Find unused source files
        .then(files =>
          files.map(array => array.filter(file => !usedModules[file]))
        )
        .then(display.bind(this))
        .then(continueOrFail.bind(this, this.failOnUnused, compilation))
        .then(callback);
    }.bind(this)
  );
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

function display(filesByDirectory) {
  const allFiles = filesByDirectory.reduce(
    (array, item) => array.concat(item),
    []
  );
  if (!allFiles.length) {
    return;
  }
  process.stdout.write('\n');
  process.stdout.write(chalk.green('\n*** Unused Plugin ***\n'));
  process.stdout.write(
    chalk.red(`${allFiles.length} unused source files found.\n`)
  );
  filesByDirectory.map((files, index) => {
    const directory = this.sourceDirectories[index];
    const relative = this.root
      ? path.relative(this.root, directory)
      : directory;
    process.stdout.write(chalk.blue(`\n● ${relative}\n`));
    files.map(file =>
      process.stdout.write(
        chalk.yellow(`    • ${path.relative(directory, file)}\n`)
      )
    );
  });
  process.stdout.write(chalk.green('\n*** Unused Plugin ***\n\n'));

  return allFiles;
}
