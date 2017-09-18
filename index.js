#!/usr/bin/env node
const config = require('./assembleConfigInformation');
const getRelevantMergeCommits = require('./getRelevantMergeCommits');
const getDataFromGithub = require('./getDataFromGithub');
const updateChangelog = require('./updateChangelog');

const mainFunction = config => {
	getRelevantMergeCommits()
		.then(mergeCommits => getDataFromGithub(mergeCommits, config))
		.then(newContents => updateChangelog(newContents, config))
		.then(() => console.log('New changelog section added'))
		.catch(console.error);
};

mainFunction(config);
