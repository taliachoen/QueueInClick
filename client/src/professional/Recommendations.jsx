import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContex';
import axios from 'axios';
import '../css/Recommendations.css';
import StarRating from './StartRating';

const Recommendations = () => {
    const { user } = useContext(UserContext);
    const userId = user.id;
    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        const fetchComments = () => {
            console.log("Fetching comments for user ID:", userId);
            axios.get(`http://localhost:8080/comments?idProfessional=${userId}`)
                .then((response) => {
                    if (response.data && response.data.length) {
                        const fetchedRecommendations = response.data.map(comment => ({
                            commentCode: comment.commentCode,
                            queueCode: comment.queueCode,
                            idProfessional: comment.idProfessional,
                            idCustomer: comment.idCustomer,
                            // nameCustomer: `${comment.firstName} ${comment.lastName}`,
                            // nameCustomer: comment.firstName + comment.lastName, 
                            rating: comment.rating,
                            content: comment.content,
                            comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
                            customerName: `${comment.firstName} ${comment.lastName}`
                        }));
                        setComments(fetchedRecommendations);
                    } else {
                        setComments([]);
                        console.log('No recommendations found');
                    }
                })
                .catch(error => {
                    console.error('Error fetching recommendations:', error);
                });
        };

        const fetchAverageRating = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/comments/rating/${userId}`);
                setAverageRating(response.data.averageRating);
            } catch (error) {
                console.error("Error fetching average rating:", error);
            }
        };

        fetchComments();
        fetchAverageRating();
    }, [userId]);

    return (
        <div className="recommendations-container">
            <div className="rating">
                <span className="myRating">My Average Rating: <StarRating rating={averageRating} /></span>
            </div>
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.commentCode} className="comment-card">
                        <div className="comment-header">
                            <span>{comment.customerName}</span>
                            <StarRating rating={comment.rating} />
                        </div>
                        <div className="comment-content">
                            <p>{comment.content}</p>
                            <span>{comment.comments_date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
