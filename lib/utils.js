const recursive = require('recursive-readdir');
const micromatch = require('micromatch');
const path = require('path');

function searchFiles(directory, ignoreGlobPatterns = []) {
  const ignorePatterns = ignoreGlobPatterns.map(pattern => path.resolve(__dirname, directory, pattern));
  return recursive(directory, ignorePatterns).then((dirs) => {
    const dirsFiltered = dirs.filter(
      dir => !micromatch.every(dir, ignorePatterns),
    );
    return dirsFiltered;
  });
}

module.exports = { searchFiles };
