const fs = require('fs');

// TODO: don't add an `## Unreleased` header if there already is one

const getNewChangelogSection = (newEntries, unreleased) => `

${unreleased || `## Unreleased`}

${newEntries}
`;

const writeChangelog = (contents, changelogPath) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(changelogPath, contents, (err, res) => {
			if (err) reject(err);
			resolve(res);
		});
	});
};

const getMessage = (changelogs, message) =>
	changelogs
		.map(changelog => changelog.fallback || message(changelog))
		.join('\n');

const updateChangelog = (
	newChangelogs,
	{ changelogPath, unreleased, message }
) => {
	// TODO: Move this validation to the config step
	const hasChangelog = fs.existsSync(changelogPath);
	if (!hasChangelog)
		return Promise.reject(
			`no file exists at ${changelogPath} to write to. Please create the file and try again.`
		);

	const newChangelogStrings = getMessage(newChangelogs, message);
	console.log(`Added changelog entries:\n${newChangelogStrings}\n`);
	const newChangelogSection = getNewChangelogSection(
		newChangelogStrings,
		unreleased
	);
	const changelog = fs.readFileSync(changelogPath, 'utf8');
	const newChangelog = changelog.replace('\n', newChangelogSection);
	return writeChangelog(newChangelog, changelogPath);
};

module.exports = updateChangelog;
