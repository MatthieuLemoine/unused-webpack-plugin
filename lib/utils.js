const recursive = require('recursive-readdir')
const micromatch = require('micromatch')
const path = require('path')

function searchFiles(directory, ignoreGlobPatterns = []) {
  ignoreGlobPatterns = ignoreGlobPatterns.map(pattern =>
    path.resolve(__dirname, directory, pattern)
  )
  return recursive(directory, ignoreGlobPatterns).then(dirs => {
    const dirsFiltered = dirs.filter(dir => {
      return !micromatch.every(dir, ignoreGlobPatterns)
    })
    return dirsFiltered
  })
}

module.exports = {
  searchFiles,
}
