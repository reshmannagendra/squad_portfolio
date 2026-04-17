import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('home');
    const indicatorRef = useRef(null);
    const navRef = useRef(null);

    const links = [
        { name: 'Home', path: '/', section: 'home' },
        { name: 'Timeline', path: '/#timeline', section: 'timeline' },
        { name: 'Mentors', path: '/#mentors', section: 'mentors' },
        { name: 'Students', path: '/#students', section: 'students' },
        { name: 'Projects', path: '/projects' }
    ];

    useEffect(() => {
        const updateIndicator = () => {
            const activeEl = document.querySelector(`.nav-links a.active`);
            if (activeEl && indicatorRef.current && navRef.current) {
                const linkRect = activeEl.getBoundingClientRect();
                const navRect = navRef.current.getBoundingClientRect();
                indicatorRef.current.style.width = `${linkRect.width}px`;
                indicatorRef.current.style.left = `${linkRect.left - navRect.left}px`;
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [location, activeSection]);

    // Intersection Observer for scroll tracking on Home page
    useEffect(() => {
        if (location.pathname !== '/') return;

        const sections = ['home', 'timeline', 'mentors', 'students'];
        const observerOptions = { threshold: 0.5 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [location]);

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-box"></div>
                <span className="logo-text">Squad_140</span>
            </div>
            <ul className="nav-links" ref={navRef}>
                {links.map((link) => {
                    const isActive = link.path === '/' 
                        ? (location.pathname === '/' && activeSection === link.section)
                        : (location.pathname === link.path);

                    return (
                        <li key={link.name}>
                            <Link 
                                to={link.path} 
                                className={isActive ? 'active' : ''}
                                onClick={() => link.section && setActiveSection(link.section)}
                            >
                                {link.name}
                            </Link>
                        </li>
                    );
                })}
                <span className="nav-indicator" ref={indicatorRef}></span>
            </ul>
        </nav>
    );
};

export default Navbar;
