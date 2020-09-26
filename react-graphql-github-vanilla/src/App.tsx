import React, { Component } from 'react';
import axios from 'axios';

const TITLE = 'React GraphQL GitHub Client';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
      }`,
  }
})

const resolveIssuesQuery = queryResult => () => ({
  organization: queryResult?.data?.data?.organization,
  errors: queryResult?.data?.errors,
})

const GET_ISSUES_OF_REPOSITORY = `
query ($organization: String!, $repository: String!){
  organization(login: $organization) {
    name
    url
    repository(name: $repository) {
      name
      url
      issues(last: 5) {
        edges {
          node {
            id
            title
            url
          }
        }
      }
    }
  }
}
`


const getIssuesOfRepository = (path : string) => {
  const [organization, repository] = path.split('/');

  return axiosGitHubGraphQL.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository}
  });
};

class App extends Component {

  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: undefined,
    errors: undefined,
  }

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ path: event.target.value })
  }

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    this.onFetchFromGitHub(this.state.path)
    // fetch data

    event.preventDefault();
  }

  onFetchFromGitHub = (path: string) => {
    getIssuesOfRepository(path)
      .then(queryResult => {
        this.setState(resolveIssuesQuery(queryResult))
      });
  }

  render() {

    const { path, organization, errors } = this.state;
    return (
      <div>
        <h1>{TITLE}</h1>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">
            Show open issues for https://github.com/
          </label>
          <input
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>
        <hr />
        { organization ? (
            <Organization organization={organization} errors={errors}/>
          ) : (
            <p>No information yet...</p>
        )}
      </div>
    )
  }
}

interface Org {
  name: string,
  url: string,
  repository?: Repo
}

interface Error {
  message: string
}
const Organization = (
  {organization, errors} : {
  organization? : Org,
  errors?: Array<Error> | null}) => {

  if (errors){
    return (
      <p>
        <strong>Something went wrong&#58; </strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    )
  }
  return (<div>
    <p>
      <strong>Issues from Organization</strong>
      <a href={organization?.url}>{organization?.name}</a>
    </p>
    <Repository repository={organization?.repository} />
  </div>)
}

interface Repo {
  url: string,
  name: string
  issues: Issue,
}

interface Issue {
  edges: Edge[]
}

interface Edge {
  node: Node
}

interface Node {
  title: string,
  url: string
}

const Repository = ({ repository } : { repository? : Repo }) => (
  <div>
    <p>
      <strong>In Repository:</strong>
      <a href={repository?.url}>{repository?.name}</a>
    </p>

    <ul>
      {repository?.issues.edges.map((issue, key) => <li key={key}>{issue.node.title}</li>)}
    </ul>
  </div>
)
export default App;