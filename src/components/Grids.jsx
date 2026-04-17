import React from 'react';

const ProfileCard = ({ person, isMentor, onClick }) => {
    const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();

    const getGithubImage = (github) => {
        if (!github || github === '#') return null;
        const match = github.match(/github\.com\/([^\/\?\s]+)/);
        return match ? `https://github.com/${match[1]}.png` : null;
    };

    const imageUrl = person.image || getGithubImage(person.github);

    return (
        <div className="student-card" onClick={() => onClick(person)}>
            {isMentor && <div className="mentor-badge">MENTOR</div>}
            
            <div className="avatar-wrapper">
                {imageUrl ? (
                    <img src={imageUrl} alt={person.name} className="profile-img" />
                ) : (
                    <div className="profile-fallback">{getInitials(person.name)}</div>
                )}
            </div>

            <h3>{person.name}</h3>
            <p>{person.bio}</p>
        </div>
    );
};

const Grids = ({ mentors, students, onProfileClick }) => {
    return (
        <>
            <section id="mentors" className="mentors-section">
                <h2 className="section-title">Mentors</h2>
                <div className="mentors-grid">
                    {mentors.map((mentor, idx) => (
                        <ProfileCard 
                            key={idx} 
                            person={mentor} 
                            isMentor={true} 
                            onClick={onProfileClick} 
                        />
                    ))}
                </div>
            </section>

            <section id="students" className="students-section">
                <h2 className="section-title">Students</h2>
                <div className="students-grid">
                    {students.map((student, idx) => (
                        <ProfileCard 
                            key={idx} 
                            person={student} 
                            onClick={onProfileClick} 
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Grids;
