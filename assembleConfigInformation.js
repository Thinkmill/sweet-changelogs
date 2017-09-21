'use strict';

const projectDir = process.cwd();
const path = require('path');

let pkg;
try {
	pkg = require(path.join(projectDir, 'package.json'));
} catch (e) {
	if (e.code === 'MODULE_NOT_FOUND') {
		throw new Error('No package.json found in the current directory; bailing');
	} else {
		throw e;
	}
}

const config = {};

try {
	const localConfig = require(path.join(projectDir, '.sweet-changelogs'));
	Object.assign(config, localConfig);
} catch (e) {
	// no custom config provided
}

config.changelogPath = path.join(projectDir, config.filename || 'CHANGELOG.md');

// TODO: this may not exist, or match github!
const repoInfo = pkg.repository.url.match(
	/https:\/\/github\.com\/(.+)\/(.+)\.git/
);
config.owner = config.owner || repoInfo[1];
config.name = config.name || repoInfo[2];
config.repo = config.repo || pkg.repository;

// TODO: Validate final config

module.exports = config;
