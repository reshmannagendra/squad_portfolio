

const CACHE_KEY = "squad_projects_cache";
const CACHE_TIME_KEY = "squad_projects_cache_time";
const ONE_HOUR = 60 * 60 * 1000;

const projectGrid = document.getElementById("projects-container");
const apiLimitBox = document.getElementById("api-limit");

async function fetchGitHubLimit() {
  try {
    const res = await fetch("https://api.github.com/rate_limit", {

    });

    const data = await res.json();

    if (apiLimitBox) {
      apiLimitBox.textContent =
        `GitHub API remaining: ${data.rate.remaining} / ${data.rate.limit}`;
    }

  } catch (err) {
    console.error("Failed to get API limit");
  }
}

async function fetchRepos() {

  const res = await fetch("/.netlify/functions/repos");

  if (!res.ok) return [];

  return await res.json();

}

async function loadProjects() {

  const cached = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  const now = Date.now();

  if (cached && cachedTime && now - cachedTime < ONE_HOUR) {

    const projects = JSON.parse(cached);

    renderProjects(projects);

    if (apiLimitBox) {
      apiLimitBox.textContent = "Using cached project data";
    }

    return;
  }

  const usernames = squadMembers
    .map(member => {
      if (!member.github) return null;

      const parts = member.github.split("/");
      return parts[parts.length - 1];
    })
    .filter(Boolean);

    const projects = await fetchRepos();

  localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
  localStorage.setItem(CACHE_TIME_KEY, now);

  renderProjects(projects);

  fetchGitHubLimit();
}

function renderProjects(projects) {

  projectGrid.innerHTML = "";

  const grouped = {};

  // group repos by github username
  projects.forEach(repo => {
    if (!grouped[repo.owner]) grouped[repo.owner] = [];
    grouped[repo.owner].push(repo);
  });

  squadMembers.forEach(member => {

    if (!member.github) return;

    const parts = member.github.split("/");
    const username = parts[parts.length - 1];

    const repos = grouped[username] || [];

    const section = document.createElement("div");
    section.className = "creator-section";

    const header = document.createElement("div");
    header.className = "creator-header";

    header.innerHTML = `
      <span class="folder-icon">📁</span>
      <span class="creator-name">${member.name}</span>
      <span class="repo-count">${repos.length} projects</span>
    `;


    const grid = document.createElement("div");
    grid.className = "creator-grid";
    grid.style.display = "none";

    repos.forEach(project => {

      const card = document.createElement("div");
      card.className = "project-card";

      card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || "No description available"}</p>

        <div class="project-meta">
          ⭐ ${project.stars}
          🍴 ${project.forks}
        </div>

        <div class="project-owner">
          Built by ${member.name}
        </div>

        <a href="${project.url}" target="_blank">
          View Repository
        </a>
      `;

      grid.appendChild(card);

    });

    // toggle folder
    header.onclick = () => {

      const isOpen = grid.style.display === "grid";

      grid.style.display = isOpen ? "none" : "grid";
      icon.textContent = isOpen ? "📁" : "📂";

    };

    section.appendChild(header);
    section.appendChild(grid);

    projectGrid.appendChild(section);

  });

}

loadProjects();