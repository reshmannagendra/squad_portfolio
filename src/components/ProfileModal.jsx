import { X, Mail } from 'lucide-react';

const GithubIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);


const ProfileModal = ({ person, onClose }) => {
    if (!person) return null;

    const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();
    const getGithubImage = (github) => {
        if (!github || github === '#') return null;
        const match = github.match(/github\.com\/([^\/\?\s]+)/);
        return match ? `https://github.com/${match[1]}.png` : null;
    };

    const imageUrl = person.image || getGithubImage(person.github);

    return (
        <div className="profile-modal active" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close" onClick={onClose}>
                    <X size={24} />
                </span>
                
                <div className="modal-body">
                    {imageUrl ? (
                        <img src={imageUrl} alt={person.name} />
                    ) : (
                        <div className="profile-fallback large">{getInitials(person.name)}</div>
                    )}
                    
                    <h3>{person.name}</h3>
                    {person.projects && <div className="modal-projects">Projects: {person.projects}</div>}
                    <p>{person.bio}</p>

                    <div className="modal-links">
                        {person.email && (
                            <a href={`mailto:${person.email}`}>
                                <Mail size={16} /> {person.email}
                            </a>
                        )}
                        {person.github && person.github !== '#' && (
                            <a href={person.github} target="_blank" rel="noopener noreferrer">
                                <GithubIcon size={16} /> GitHub
                            </a>
                        )}
                        {person.linkedin && person.linkedin !== '#' && (
                            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
                                <LinkedinIcon size={16} /> LinkedIn
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
