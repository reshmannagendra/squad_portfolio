// ===============================
// NAVIGATION & UI
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById('button');
    const navBackBtn = document.getElementById('navBackBtn');

    const goBack = () => window.history.back();

    if (button) button.addEventListener('click', goBack);
    if (navBackBtn) navBackBtn.addEventListener('click', goBack);


    // 🍔 Menu Toggle Logic
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navLinks.classList.toggle("active");
            
            if (navLinks.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "auto";
            }
        });

        // Close menu when links are clicked
        links.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                navLinks.classList.remove("active");
                document.body.style.overflow = "auto";
            });
        });
    }

    if (indicator && nav && links.length > 0) {
        let activeLink = Array.from(links).find(l => l.innerText.toLowerCase() === "students") || links[links.length-1];
        
        function moveIndicator(el) {
            if (window.innerWidth <= 900) return; // Don't move indicator on mobile
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
    const settingsGear = document.getElementById("settingsGear");
    const manageApiBtn = document.getElementById("manageApiBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const saveTokenBtn = document.getElementById("saveTokenBtn");
    const clearTokenBtn = document.getElementById("clearTokenBtn");
    const ghTokenInput = document.getElementById("ghTokenInput");

    if (settingsModal) {
        const openModal = (e) => {
            e.preventDefault();
            const savedToken = localStorage.getItem("github_token");
            if (savedToken) ghTokenInput.value = savedToken;
            settingsModal.style.display = "flex";
        };

        if (settingsGear) settingsGear.onclick = openModal;
        if (manageApiBtn) manageApiBtn.onclick = openModal;

        const closeModal = () => settingsModal.style.display = "none";
        if (closeSettingsBtn) closeSettingsBtn.onclick = closeModal;
        
        // Close on clicking outside
        window.onclick = (e) => { if (e.target === settingsModal) closeModal(); };

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

        if (clearTokenBtn) {
            clearTokenBtn.onclick = () => {
                localStorage.removeItem("github_token");
                ghTokenInput.value = "";
                alert("Token cleared. Refreshing...");
                location.reload();
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

/**
 * Creates an avatar element with a multi-step fallback system
 */
function createProjectAvatar(member) {
    const wrapper = document.createElement("div");
    wrapper.className = "creator-avatar-wrapper";

    const initials = getInitials(member.name);
    const fallback = document.createElement("div");
    fallback.className = "creator-avatar-fallback";
    fallback.textContent = initials;
    fallback.style.zIndex = "1";

    const img = document.createElement("img");
    img.className = "creator-avatar";
    img.alt = member.name;
    img.style.zIndex = "2";
    img.style.display = "none"; // Hide until loaded

    const githubImgUrl = getGithubImage(member.github);
    
    // Path Waterfall
    const localSpace = `images/students/${encodeURIComponent(member.name)}.jpg`;
    const localHyphen = `images/students/${member.name.replace(/\s+/g, "-")}.jpg`;

    // Strategy: Try Local Space -> Local Hyphen -> GitHub -> Give up
    const attemptLoad = (urls) => {
        if (urls.length === 0) {
            img.style.display = "none";
            return;
        }

        const current = urls.shift();
        img.src = current;
        img.onload = () => { img.style.display = "block"; };
        img.onerror = () => attemptLoad(urls);
    };

    const urlsToTry = [localSpace, localHyphen];
    if (githubImgUrl) urlsToTry.push(githubImgUrl);

    attemptLoad(urlsToTry);

    wrapper.appendChild(fallback);
    wrapper.appendChild(img);
    return wrapper;
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

        const header = document.createElement("div");
        header.className = "creator-header";

        const avatar = createProjectAvatar(member);
        
        const nameSpan = document.createElement("span");
        nameSpan.className = "creator-name";
        nameSpan.textContent = member.name;

        const countSpan = document.createElement("span");
        countSpan.className = "repo-count";
        countSpan.textContent = `${repos.length} Repos`;

        header.appendChild(avatar);
        header.appendChild(nameSpan);
        header.appendChild(countSpan);


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