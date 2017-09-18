const projectDir = process.env.PWD;
const path = require('path');
require('dotenv').load();

const configPath = path.join(projectDir, 'config.changelog');
const config = require(configPath);
const pkgJSONPath = path.join(projectDir, 'package.json');
const changelogPath = path.join(projectDir, config.filename || 'CHANGELOG.md');
const { repository } = require(pkgJSONPath);

const repoInfo = repository.url.match(/https:\/\/github\.com\/(.+)\/(.+)\.git/);
config.owner = config.owner || repoInfo[1];
config.name = config.name || repoInfo[2];
config.repository = config.repository || repository;
config.changelogPath = config.changelogPath || changelogPath;

module.exports = config;
