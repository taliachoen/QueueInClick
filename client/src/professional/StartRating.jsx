import React from 'react';
import '../css/Recommendations.css'
const StarRating = ({ rating }) => {
    const maxRating = 5;
    return (
        <div className="stars">
            {[...Array(maxRating)].map((_, index) => (
                <span key={index} className={index < rating ? 'filled-star' : 'empty-star'}>
                    {index < rating ? '★' : '☆'}
                </span>
            ))}
        </div>
    );
};

export default StarRating;
