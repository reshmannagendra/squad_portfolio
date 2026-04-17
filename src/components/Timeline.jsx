import React from 'react';
import { motion } from 'framer-motion';

const timelineEvents = [
    { week: "Week 1", title: "Foundation Begins", desc: "Started with C++ and problem solving." },
    { week: "Week 5", title: "Web Development", desc: "Built first responsive projects." },
    { week: "Week 10", title: "Squad Pushes forward...", desc: "Real collaboration begins." }
];

const TimelineItem = ({ week, title, desc, index }) => {
    const isEven = index % 2 !== 0;

    return (
        <motion.div 
            className={`timeline-item ${isEven ? 'even' : 'odd'}`}
            initial={{ opacity: 0, x: isEven ? 120 : -120 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="timeline-dot"></div>
            <div className="timeline-card">
                <span>{week}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
            </div>
        </motion.div>
    );
};

const Timeline = () => {
    return (
        <section id="timeline">
            <div className="timeline">
                <h2 className="section-title">Journey of Squad 140</h2>
                <div className="timeline-line"></div>
                <div className="timeline-container">
                    {timelineEvents.map((event, idx) => (
                        <TimelineItem key={idx} {...event} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;
