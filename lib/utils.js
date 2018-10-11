const deglob = require('deglob');

function searchFiles(directory, ignoreGlobPatterns = [], useGitIgnore = true) {
  const config = { ignore: ignoreGlobPatterns, cwd: directory, useGitIgnore };
  return new Promise((resolve, reject) => {
    deglob('**/*', config, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

module.exports = { searchFiles };
