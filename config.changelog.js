module.exports = {
	title: '# React Select',
	unreleased: '## Unreleased',
	filename: 'HISTORY.md',
	repositoryLocation: 'github',
	name: 'react-select',
	owner: 'JedWatson',
	message: ({ pr, user }) =>
		`* ${pr.title}, thanks (${user.name ||
			user.login})[${user.url}] - (see PR)[${pr.url}]`,
};
