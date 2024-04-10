import React from 'react';
import "./TitleComponent.css";

const TitleComponent = ({ title }) => {
    if (!title) return null;
    return (
        <div className="title">
            <h2>{title}</h2>
        </div>
    );
};

export default TitleComponent;