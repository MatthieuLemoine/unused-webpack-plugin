const path = require('path');
const { searchFiles: recursive } = require('../lib/utils');

const dirToSearch = path.resolve(__dirname, 'testdir');

describe('dirToSearch()', () => {
  it('list all directories', async () => {
    const dirs = await recursive(dirToSearch);
    const expected = [
      path.resolve(__dirname, 'testdir/onetest.txt'),
      path.resolve(__dirname, 'testdir/a/test2.txt'),
      path.resolve(__dirname, 'testdir/a/test3.txt'),
      path.resolve(__dirname, 'testdir/b/test4.txt'),
      path.resolve(__dirname, 'testdir/b/test5.txt'),
    ];
    expect(dirs.sort()).toEqual(expected.sort());
  });
  it('ignores specified files', async () => {
    const filesToIgnore = 'onetest*';
    const dirs = await recursive(dirToSearch, [filesToIgnore]);
    const expected = [
      path.resolve(__dirname, 'testdir/a/test2.txt'),
      path.resolve(__dirname, 'testdir/a/test3.txt'),
      path.resolve(__dirname, 'testdir/b/test4.txt'),
      path.resolve(__dirname, 'testdir/b/test5.txt'),
    ];
    expect(dirs.sort()).toEqual(expected.sort());
  });
  it('ignores all files in specified directories', async () => {
    const dirsToIgnore = '**/a';
    const dirs = await recursive(dirToSearch, [dirsToIgnore]);
    const expected = [
      path.resolve(__dirname, 'testdir/onetest.txt'),
      path.resolve(__dirname, 'testdir/b/test4.txt'),
      path.resolve(__dirname, 'testdir/b/test5.txt'),
    ];
    expect(dirs.sort()).toEqual(expected.sort());
  });
});
