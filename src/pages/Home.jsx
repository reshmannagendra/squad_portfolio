import React, { useState } from 'react';
import Hero from '../components/Hero';
import Timeline from '../components/Timeline';
import Grids from '../components/Grids';
import ProfileModal from '../components/ProfileModal';
import { squadMembers, mentors } from '../data';

const Home = () => {
    const [selectedPerson, setSelectedPerson] = useState(null);

    return (
        <div className="home-page">
            <Hero />
            <Timeline />
            <Grids 
                mentors={mentors} 
                students={squadMembers} 
                onProfileClick={setSelectedPerson} 
            />
            {selectedPerson && (
                <ProfileModal 
                    person={selectedPerson} 
                    onClose={() => setSelectedPerson(null)} 
                />
            )}
        </div>
    );
};

export default Home;
