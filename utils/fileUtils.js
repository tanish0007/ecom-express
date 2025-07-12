const FS = require("node:fs");
const PATH = require("node:path");

const dbPath = PATH.join(__dirname, '../db');

async function readJSON(filename) {
    const fullPath = PATH.join(dbPath, filename);
    const data = await FS.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
}

async function writeJSON(filename, data) {
    const fullPath = PATH.join(dbPath, filename);
    await FS.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}   

module.exports = { readJSON, writeJSON };