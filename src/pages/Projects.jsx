import React, { useState } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { squadMembers } from '../data';
import { Settings, Folder, FolderOpen, Star, GitFork, ExternalLink, Loader2 } from 'lucide-react';

const ProjectCard = ({ project, memberName }) => (
    <div className="project-card">
        <h3>{project.name}</h3>
        <p>{project.description || "No description provided."}</p>
        <div className="project-meta">
            <span><Star size={14} /> {project.stars}</span>
            <span><GitFork size={14} /> {project.forks}</span>
        </div>
        <div className="project-owner">Contributor: {memberName}</div>
        <a href={project.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} /> View Source
        </a>
    </div>
);

const CreatorSection = ({ member, repos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();
    const getGithubImage = (github) => {
        const match = github.match(/github\.com\/([^\/\?\s]+)/);
        return match ? `https://github.com/${match[1]}.png` : null;
    };

    const profileImg = getGithubImage(member.github);

    return (
        <div className="creator-section">
            <div 
                className={`creator-header ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                style={{ borderColor: isOpen ? '#ff2a6d' : '' }}
            >
                <div className="creator-avatar-wrapper">
                    {profileImg ? (
                        <img 
                            src={profileImg} 
                            className="creator-avatar" 
                            alt={member.name} 
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    ) : null}
                    <div className="creator-avatar-fallback">{getInitials(member.name)}</div>
                </div>
                <span className="creator-name">{member.name}</span>
                <span className="repo-count">{repos.length} Repos</span>
            </div>

            {isOpen && (
                <div className="creator-grid">
                    {repos.length > 0 ? (
                        repos.map((p, i) => <ProjectCard key={i} project={p} memberName={member.name} />)
                    ) : (
                        <div className="api-info" style={{ gridColumn: '1/-1', padding: '20px' }}>
                            No public repositories found or GitHub rate limit reached for this user.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose }) => {
    const [token, setToken] = useState(localStorage.getItem('github_token') || '');
    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('github_token', token);
        alert("Token saved. Refreshing...");
        window.location.reload();
    };

    const handleClear = () => {
        localStorage.removeItem('github_token');
        setToken('');
        alert("Token cleared.");
        window.location.reload();
    };

    return (
        <div className="settings-modal active" onClick={onClose}>
            <div className="settings-content" onClick={e => e.stopPropagation()}>
                <h3>GitHub API Settings</h3>
                <p>Paste your GitHub Personal Access Token here to bypass rate limits.</p>
                <input 
                    type="password" 
                    value={token} 
                    onChange={e => setToken(e.target.value)} 
                    placeholder="ghp_xxxxxxxxxxxx"
                />
                <div className="settings-actions">
                    <button id="saveTokenBtn" onClick={handleSave}>Save Token</button>
                    <button id="clearTokenBtn" onClick={handleClear}>Clear Token</button>
                    <button onClick={onClose}>Close</button>
                </div>
                <small>Tokens are stored locally in your browser and never sent elsewhere.</small>
            </div>
        </div>
    );
};

const Projects = () => {
    const { projects, loading, error, cacheInfo } = useGitHub();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const grouped = projects.reduce((acc, repo) => {
        if (!acc[repo.owner]) acc[repo.owner] = [];
        acc[repo.owner].push(repo);
        return acc;
    }, {});

    return (
        <div className="projects-page">
            <header className="projects-hero">
                <div className="hero-content">
                    <h1>Squad 140 Projects</h1>
                    <p>Explore the innovative builds and contributions from our squad members.</p>
                </div>
            </header>

            <main id="main-content">
                {cacheInfo && <div className="api-info">{cacheInfo}</div>}
                {error && <div className="api-info" style={{ color: '#ff2a6d' }}>{error}</div>}
                
                {loading ? (
                    <div className="loader-container">
                        <Loader2 className="spinner" size={40} />
                        <p>Fetching repositories from GitHub...</p>
                    </div>
                ) : (
                    <div id="projects-container">
                        {squadMembers.filter(m => m.github).map(member => {
                            const username = member.github.split("/").pop();
                            const memberRepos = grouped[username] || [];
                            return (
                                <CreatorSection 
                                    key={member.name} 
                                    member={member} 
                                    repos={memberRepos} 
                                />
                            );
                        })}
                    </div>
                )}
            </main>
            
            <button 
                className="settings-fab" 
                onClick={() => setIsSettingsOpen(true)}
                title="GitHub Token Settings"
            >
                <Settings size={24} />
            </button>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
};

export default Projects;
