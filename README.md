You will need a .env file, which should be git ignored in the project using sweet-changelogs. It will need a github personal access token with `repo` access (see here)[https://github.com/settings/tokens].

The environment variable is `GITHUB_TOKEN`

You can also provide a `.sweet-changelogs.js` file. Note that all of this can be inferred, assuming your project has a git field with a link to the project's github page.

```js
module.exports = {
	unreleased: '## Unreleased',
	filename: 'HISTORY.md',
	repositoryLocation: 'github',
	name: 'react-select',
	owner: 'JedWatson',
	message: ({ pr, user }) =>
		`* ${pr.title}, thanks [${user.name ||
			user.login}](${user.url}) - [see PR](${pr.url})`,
};
```

TODO: Make a query to get the relevant information from bitbucket.
Fallback from bitbucket more gracefully.
