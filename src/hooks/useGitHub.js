import { useState, useEffect } from 'react';
import { squadMembers } from '../data';

const CACHE_KEY = "squad_projects_cache_v3";
const CACHE_TIME_KEY = "squad_projects_cache_time_v3";
const TOKEN_KEY = "github_token";
const ONE_HOUR = 60 * 60 * 1000;

export const useGitHub = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cacheInfo, setCacheInfo] = useState("");

    const getHeaders = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        return token ? { "Authorization": `token ${token}` } : {};
    };

    const fetchRepos = async (username) => {
        const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;
        try {
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) {
                if (res.status === 403) throw new Error("Rate limit exceeded");
                return [];
            }
            return await res.json();
        } catch (err) {
            console.error(`Failed to fetch ${username}:`, err.message);
            return [];
        }
    };

    const loadProjects = async () => {
        setLoading(true);
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cached && cachedTime && now - cachedTime < ONE_HOUR) {
            setProjects(JSON.parse(cached));
            setCacheInfo("Viewing cached project data (Updates every hour)");
            setLoading(false);
            return;
        }

        const usernames = squadMembers
            .map(m => m.github?.split("/").pop())
            .filter(Boolean);

        try {
            const results = await Promise.all(usernames.map(fetchRepos));
            const allProjects = results.flat().map(repo => ({
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                url: repo.html_url,
                owner: repo.owner.login
            }));

            if (allProjects.length > 0) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(allProjects));
                localStorage.setItem(CACHE_TIME_KEY, now);
                setProjects(allProjects);
                setCacheInfo("");
            } else {
                setError("GitHub API limit exceeded or no data found.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    return { projects, loading, error, cacheInfo, reload: loadProjects };
};
