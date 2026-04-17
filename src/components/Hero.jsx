import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="hero" id="home">
            <div 
                className="hero-bg" 
                style={{ transform: `translateY(${offset * 0.25}px)` }}
            ></div>
            <div className="hero-overlay"></div>

            <div className="hero-inner">
                <div className="hero-main-card">
                    <h1>Squad 140 Kalvians</h1>
                </div>

                <div className="hero-stats">
                    <div className="stat-card">
                        <div className="stat-label">members</div>
                        <div className="stat-value">44</div>
                    </div>
                    
                    <Link to="/projects" className="card-link">
                        <div className="stat-card">
                            <div className="stat-label">projects built</div>
                            <div className="stat-value">120+</div>
                        </div>
                    </Link>

                    <div className="stat-card">
                        <div className="stat-label">build time</div>
                        <div className="stat-value">50K+</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
