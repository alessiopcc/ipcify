'use strict';

const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const module_path = path.resolve(__dirname, '..');

function _compile_ts()
{
    console.log('Compiling typescript...');

    let result;

    // Compile ts
    result = child_process.spawnSync('tsc', [], {shell: true, stdio: 'inherit', cwd: module_path});
    if(result.status)
        throw new Error(`Unable to compile typescript`);

    console.log('Compiled!');
}

function _files()
{
    console.log('Copying custom files...');

    const files = ['package.json'];
    for(const file of files)
        fs.copySync(path.resolve(module_path, file), path.resolve(module_path, 'build', file));

    console.log('Copied!');
}

function prepare()
{
    console.log('Preparing...');

    _compile_ts();
    _files();

    console.log('Packed!');
    console.log();
}

module.exports = {prepare};
