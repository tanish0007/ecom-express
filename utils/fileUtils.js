const FS = require("node:fs/promises");
const PATH = require("node:path");

const dbPath = PATH.join(__dirname, '../db');

async function readJSON(filename) {
    const fullPath = PATH.join(dbPath, filename);
    const data = await FS.readFile(fullPath, 'utf8');
    return JSON.parse(data);
}

async function writeJSON(filename, data) {
    const fullPath = PATH.join(dbPath, filename);
    await FS.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
}   

module.exports = { readJSON, writeJSON };