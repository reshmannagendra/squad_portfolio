exports.handler = async () => {

  const token = process.env.GITHUB_TOKEN;

  const usernames = [
    // list usernames here OR pass them from frontend
  ];

  const repoPromises = usernames.map(async (user) => {

    const res = await fetch(
      `https://api.github.com/users/${user}/repos`,
      {
        headers:{
          Authorization:`token ${token}`
        }
      }
    );

    const repos = await res.json();

    return repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      owner: repo.owner.login
    }));

  });

  const results = await Promise.all(repoPromises);

  return {
    statusCode:200,
    body: JSON.stringify(results.flat())
  };

};