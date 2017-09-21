const fs = require('fs');

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
	console.log(newChangelogs);
	// TODO: Move this validation to the config step
	const hasChangelog = fs.existsSync(changelogPath);
	if (!hasChangelog)
		return Promise.reject(
			`no file exists at ${changelogPath} to write to. Please create the file and try again.`
		);

	const newChangelogStrings = getMessage(newChangelogs, message);
	console.log(newChangelogStrings);
	const newChangelogSection = getNewChangelogSection(
		newChangelogStrings,
		unreleased
	);
	const changelog = fs.readFileSync(changelogPath, 'utf8');
	const newChangelog = changelog.replace('\n', newChangelogSection);
	return writeChangelog(newChangelog, changelogPath);
};

module.exports = updateChangelog;
