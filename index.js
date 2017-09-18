#!/usr/bin/env node
const projectDir = process.env.PWD;
const path = require('path');
const fs = require('fs');

const config = require('./config.changelog');

const pkgJSONPath = path.join(projectDir, 'package.json');
const changelogPath = path.join(projectDir, config.filename || 'CHANGELOG.md');
const { repository } = require(pkgJSONPath);

const repoInfo = repository.url.match(/https:\/\/github\.com\/(.+)\/(.+)\.git/);
config.owner = config.owner || repoInfo[1];
config.name = config.name || repoInfo[2];

const generateChangelogs = require('./query');

const newChangelogSection = newEntries => `

## Unreleased
${newEntries}
`;

const writeZeChangelog = contents => {
	return new Promise((resolve, reject) => {
		fs.writeFile(changelogPath, contents, (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
};

const writeChangelog = () => {
	const hasChangelog = fs.existsSync(changelogPath);
	if (!hasChangelog)
		return Promise.reject(
			`no file exists at ${changelogPath} to write to. Please create the file and try again.`
		);
	const newChangelogs = generateChangelogs().then(newChangelogSection);
	const changelog = fs.readFileSync(changelogPath, 'utf8');
	newChangelogs
		.then(newChangelog => changelog.replace('\n', newChangelog))
		// .then(writeZeChangelog)
		.then(console.log)
		.catch(console.error);
};

writeChangelog();
