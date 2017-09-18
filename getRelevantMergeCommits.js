const { spawn } = require('child_process');

const getLastTag = () => {
	return new Promise((resolve, reject) => {
		const subProcess = spawn('git', [
			'describe',
			'--tags',
			'--abbrev=0',
			'HEAD^',
		]);
		subProcess.stderr.on('data', data => {
			reject(data.toString());
		});
		subProcess.stdout.on('data', data => {
			resolve(data.toString());
		});
		subProcess.on('close', data => {
			reject('finished with no data');
		});
	});
};

const getRelevantCommits = lastTag => {
	// This line will get us all merge commits since the last tag, as we are
	// running it through node processes we split out getting the last tag
	// git log `git describe --tags --abbrev=0 HEAD^`..HEAD --pretty=tformat:"%H : %s" --grep="Merge"
	// git log v1.0.0-rc.6..HEAD --pretty=tformat:"%H : %s" --grep="Merge"
	return new Promise((resolve, reject) => {
		const range = `${lastTag.split('\n')[0]}..HEAD`;
		const subProcess = spawn('git', [
			'log',
			range,
			'--tags',
			'--pretty=tformat:"%H : %s"',
		]);
		subProcess.stderr.on('data', data => reject(data.toString()));
		subProcess.stdout.on('data', data => {
			const relevantCommits = data
				.toString()
				.split('\n')
				.map(commit => {
					const commitParts = commit.split(' : ');
					const hash = commitParts[0].replace('"', '');
					return {
						hash,
						// graphql does not allow numbers at the start of variable names, so
						// we add two 'a's to our keys to make sure they are safe.
						safeHash: `aa${hash}`,
						message: commitParts[1],
					};
				})
				.filter(c => c.message && c.message.match(/^Merge/));
			resolve(relevantCommits);
		});
		subProcess.on('close', data => {
			reject('finished with no data');
		});
	});
};

const getRelevantMergeCommits = () => getLastTag().then(getRelevantCommits);

module.exports = getRelevantMergeCommits;
