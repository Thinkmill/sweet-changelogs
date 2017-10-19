const axios = require('axios');

const assembleSearch = (safeHash, hash) => `
${safeHash}: search(type: ISSUE, query: "sha=${hash}", last: 10) {
  issueCount
  nodes {
    ... on PullRequest {
      repository {
        nameWithOwner
      }
      updatedAt
      title
      url
      mergeCommit {
        oid
        committedDate
      }
      author {
        url
      }
      commits(last: 1) {
        edges {
          node {
            commit {
				author {
					name
				}
              oid
            }
          }
        }
      }
    }
  }
}
`;

const assembleQuery = array => `
  {
    ${array.map(({ safeHash, hash }) => assembleSearch(safeHash, hash))}
  }
`;

const makeGHRequest = query =>
	axios
		.post(
			`https://api.github.com/graphql?access_token=${process.env.GITHUB_TOKEN}`,
			{ query }
		)
		.then(res => res.data.data)
		.catch(res =>
			Promise.reject({ config: res.config, data: res.response.data })
		);

const transformData = (data, config) =>
	Object.keys(data).map(key => {
		const { issueCount, nodes } = data[key];
		if (issueCount !== 1)
			return {
				errorMessage: 'incorrect issue count',
				issueCount,
				errorNodes: nodes,
				hash: key.replace('aa', ''),
			};
		const node = nodes[0];
		if (node.repository.nameWithOwner !== `${config.owner}/${config.name}`)
			return {
				errorMessage: `wrong repository name/owner, expect to be at ${config.owner}/${config.name} but were were in ${node
					.repository.nameWithOwner}`,
				errorNodes: nodes,
				hash: key.replace('aa', ''),
			};
		// if nameWithOwner is wrong, return an error for this one
		return {
			pr: Object.assign({}, node, {
				lastCommit: node.commits.edges[0].node.commit.oid,
			}),
			user: {
				url: node.author.url,
				name: node.commits.edges[0].node.commit.author.name,
			},
		};
	});

const antiAliasErrors = (data, mergeCommits, config) =>
	data.map(datum => {
		if (!datum.errorMessage) return datum;
		const commit = mergeCommits.filter(({ hash }) => hash === datum.hash)[0];
		console.log('ERROR', datum);
		return {
			fallback: config.fallback
				? config.fallback(commit)
				: `* fallback changelog; ${commit.message} - ${commit.hash}`,
		};
	});

const getDataFromGithub = (mergeCommits, config) => {
	const query = assembleQuery(mergeCommits);
	return makeGHRequest(query)
		.then(data => transformData(data, config))
		.then(data => antiAliasErrors(data, mergeCommits, config));
};

module.exports = getDataFromGithub;
