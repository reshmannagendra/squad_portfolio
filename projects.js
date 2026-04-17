// ===============================
// NAVIGATION & UI
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById('button');
    if (button) {
        button.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Navbar indicator logic
    const links = document.querySelectorAll(".nav-links a");
    const indicator = document.querySelector(".nav-indicator");
    const nav = document.querySelector(".nav-links");

    if (indicator && nav && links.length > 0) {
        let activeLink = links[0];
        
        function moveIndicator(el) {
            const linkRect = el.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            indicator.style.width = `${linkRect.width}px`;
            indicator.style.left = `${linkRect.left - navRect.left}px`;
        }

        moveIndicator(activeLink);

        links.forEach(link => {
            link.addEventListener("mouseenter", () => moveIndicator(link));
        });

        nav.addEventListener("mouseleave", () => moveIndicator(activeLink));
        window.addEventListener('resize', () => moveIndicator(activeLink));
    }

    // Settings Modal Logic
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const saveTokenBtn = document.getElementById("saveTokenBtn");
    const ghTokenInput = document.getElementById("ghTokenInput");

    if (settingsModal) {
        // Simple gear icon or trigger can be added to navbar if needed
        // For now, we'll keep the logic ready if they click the placeholder link
        const trigger = document.querySelector('a[href="#settings"]');
        if (trigger) {
            trigger.onclick = (e) => {
                e.preventDefault();
                settingsModal.style.display = "flex";
            };
        }

        if (closeSettingsBtn) closeSettingsBtn.onclick = () => settingsModal.style.display = "none";
        
        if (saveTokenBtn) {
            saveTokenBtn.onclick = () => {
                const token = ghTokenInput.value.trim();
                if (token) {
                    localStorage.setItem("github_token", token);
                    alert("Token saved safely. Refreshing projects...");
                    location.reload();
                }
            };
        }
    }
});

// ===============================
// CONSTANTS & STATE
// ===============================
const CACHE_KEY = "squad_projects_cache_v4";
const CACHE_TIME_KEY = "squad_projects_cache_time_v4";
const ONE_HOUR = 60 * 60 * 1000;
const TOKEN_KEY = "github_token";

const projectGrid = document.getElementById("projects-container");
const apiLimitBox = document.getElementById("api-limit");
const loadingState = document.getElementById("loading-state");

function getHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { "Authorization": `token ${token}` } : {};
}

// ===============================
// HELPERS
// ===============================
function getGithubImage(github) {
    if (!github) return null;
    const match = github.match(/github\.com\/([^\/\?\s]+)/);
    return match ? `https://github.com/${match[1]}.png` : null;
}

function getInitials(name) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

// ===============================
// GITHUB API CORE
// ===============================
async function fetchRepos(username) {
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;
    
    try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) return [];
        const repos = await res.json();
        return repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            owner: repo.owner.login
        }));
    } catch {
        return [];
    }
}

// ===============================
// LOAD & RENDER
// ===============================
async function loadProjects() {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cached && cachedTime && now - cachedTime < ONE_HOUR) {
        renderProjects(JSON.parse(cached));
        if (apiLimitBox) apiLimitBox.textContent = "Viewing cached project data";
        return;
    }

    const usernames = squadMembers
        .map(member => {
            if (!member.github) return null;
            const parts = member.github.split("/");
            return parts[parts.length - 1];
        })
        .filter(Boolean);

    try {
        if (loadingState) loadingState.style.display = "flex";
        
        const repoPromises = usernames.map(fetchRepos);
        const results = await Promise.all(repoPromises);
        const projects = results.flat();

        if (projects.length > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
            localStorage.setItem(CACHE_TIME_KEY, now);
            renderProjects(projects);
        } else {
            projectGrid.innerHTML = `<div class="api-info">No project data available. Check settings or try later.</div>`;
        }
    } finally {
        if (loadingState) loadingState.style.display = "none";
    }
}

function renderProjects(projects) {
    projectGrid.innerHTML = "";
    const grouped = {};

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

        const profileImg = getGithubImage(member.github);
        const avatarHtml = `
            <div class="creator-avatar-wrapper">
                ${profileImg ? `<img src="${profileImg}" class="creator-avatar" alt="${member.name}" onerror="this.style.display='none'">` : ''}
                <div class="creator-avatar-fallback">${getInitials(member.name)}</div>
            </div>
        `;

        const header = document.createElement("div");
        header.className = "creator-header";
        header.innerHTML = `
            ${avatarHtml}
            <span class="creator-name">${member.name}</span>
            <span class="repo-count">${repos.length} Repos</span>
        `;

        const grid = document.createElement("div");
        grid.className = "creator-grid";
        grid.style.display = "none";

        if (repos.length > 0) {
            repos.forEach(project => {
                const card = document.createElement("div");
                card.className = "project-card";
                card.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${project.description || "No description provided."}</p>
                    <div class="repo-meta">
                        <span>⭐ ${project.stars}</span>
                        <span>🍴 ${project.forks}</span>
                    </div>
                    <a href="${project.url}" target="_blank">View Repository</a>
                `;
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<div class="api-info" style="grid-column: 1/-1; padding: 20px;">No public repositories found for this user.</div>`;
        }

        header.onclick = () => {
            const isOpen = grid.style.display === "grid";
            grid.style.display = isOpen ? "none" : "grid";
        };

        section.appendChild(header);
        section.appendChild(grid);
        projectGrid.appendChild(section);
    });
}

// Start
if (projectGrid) loadProjects();