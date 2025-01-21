// // // import React, { useContext, useEffect, useState } from 'react';
// // // import { UserContext } from '../App' ;
// // // import axios from 'axios';
// // // import '../css/Recommendations.css';

// // // const Recommendations = () => {
// // //     const user = useContext(UserContext);
// // //     const userId = user.id;
// // //     console.log(userId);
// // //     const [comments, setComments] = useState([]);
// // //     const [averageRating, setAverageRating] = useState(0);

// // //     useEffect(() => {
// // //         // Fetch comments
// // //         // const fetchComments = async () => {
// // //         //     try {
// // //         //         const response = await axios.get(`/comments?IdProfessional=${userId}`);
// // //         //         console.log(response.data)
// // //         //         setComments(response.data);
// // //         //     } catch (error) {
// // //         //         console.error("Error fetching comments:", error);
// // //         //     }
// // //         // };

// // //         const fetchComments = () => {
// // //                 axios.get(`http://localhost:8080/comments?IdProfessional=${userId}`)
// // //                     .then((response) => {
// // //                         if (response.data && response.data.length) {
// // //                             const fetchedRecommendations = response.data.map(comment => ({
// // //                                 commentCode: comment.commentCode,
// // //                                 queueCode: comment.queueCode,
// // //                                 idProfessional: comment.idProfessional,
// // //                                 idCustomer: comment.idCustomer,
// // //                                 nameCustomer: comment.firstName + comment.lastName ,
// // //                                 rating: comment.rating,
// // //                                 content: comment.content,
// // //                                 comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
// // //                                 customerName: `${comment.firstName} ${comment.lastName}`
// // //                             }));
// // //                             setComments(fetchedRecommendations);
// // //                         } else {
// // //                             setComments([]);
// // //                             console.log('No recommendations found');
// // //                         }
// // //                     })
// // //                     .catch(error => {
// // //                         console.error('Error fetching recommendations:', error);
// // //                     });
// // //             };




// // //         // Fetch average rating
// // //         const fetchAverageRating = async () => {
// // //             try {
// // //                 const response = await (await axios.get(`http://localhost:8080/comments/rating/${userId}`))
// // //                 .then(response => {
// // //                     setAverageRating(response.data.averageRating);
// // //                 })

// // //             } catch (error) {
// // //                 console.error("Error fetching average rating:", error);
// // //             }
// // //         };

// // //         fetchComments();
// // //         fetchAverageRating();
// // //     }, [userId]);

// // //     return (
// // //         <div className="recommendations-container">
// // //             <h1>Recommendations</h1>
// // //             <div className="rating">
// // //                 <span>Average Rating: {averageRating.toFixed(2)} Stars</span>
// // //             </div>
// // //             <div className="comments-list">
// // //                 {comments.map(comment => (
// // //                     <div key={comment.commentCode} className="comment-card">
// // //                         <div className="comment-header">
// // //                             <span>{comment.firstName} {comment.lastName}</span>
// // //                             <span>{comment.rating} Stars</span>
// // //                         </div>
// // //                         <div className="comment-content">
// // //                             <p>{comment.content}</p>
// // //                             <span>{new Date(comment.comments_date).toLocaleDateString()}</span>
// // //                         </div>
// // //                     </div>
// // //                 ))}
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default Recommendations;


// // import React, { useContext, useEffect, useState } from 'react';
// // import { UserContext } from '../App' ;
// // import axios from 'axios';
// // import '../css/Recommendations.css';
// // // import StarRating from './StarRating';

// // const Recommendations = () => {
// //     const user = useContext(UserContext);
// //     const userId = user.id;
// //     const [comments, setComments] = useState([]);
// //     const [averageRating, setAverageRating] = useState(0);

// //     useEffect(() => {
// //         const fetchComments = () => {
// //             axios.get(`http://localhost:8080/comments?IdProfessional=${userId}`)
// //                 .then((response) => {
// //                     if (response.data && response.data.length) {
// //                         const fetchedRecommendations = response.data.map(comment => ({
// //                             commentCode: comment.commentCode,
// //                             queueCode: comment.queueCode,
// //                             idProfessional: comment.idProfessional,
// //                             idCustomer: comment.idCustomer,
// //                             nameCustomer: comment.firstName + comment.lastName ,
// //                             rating: comment.rating,
// //                             content: comment.content,
// //                             comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
// //                             customerName: `${comment.firstName} ${comment.lastName}`
// //                         }));
// //                         setComments(fetchedRecommendations);
// //                     } else {
// //                         setComments([]);
// //                         console.log('No recommendations found');
// //                     }
// //                 })
// //                 .catch(error => {
// //                     console.error('Error fetching recommendations:', error);
// //                 });
// //         };

// //         const fetchAverageRating = async () => {
// //             try {
// //                 const response = await axios.get(`http://localhost:8080/comments/rating/${userId}`);
// //                 setAverageRating(response.data.averageRating);
// //             } catch (error) {
// //                 console.error("Error fetching average rating:", error);
// //             }
// //         };

// //         fetchComments();
// //         fetchAverageRating();
// //     }, [userId]);

// //     return (
// //         <div className="recommendations-container">
// //             <h1>Recommendations</h1>
// //             <div className="rating">
// //                 {/* <span>Average Rating: <StarRating rating={averageRating} /> ({averageRating.toFixed(2)} Stars)</span> */}
// //             </div>
// //             <div className="comments-list">
// //                 {comments.map(comment => (
// //                     <div key={comment.commentCode} className="comment-card">
// //                         <div className="comment-header">
// //                             {/* <span>{comment.customerName}</span>
// //                             <StarRating rating={comment.rating} /> */}
// //                         </div>
// //                         <div className="comment-content">
// //                             <p>{comment.content}</p>
// //                             <span>{comment.comments_date}</span>
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // };

// // export default Recommendations;


// import React, { useContext, useEffect, useState } from 'react';
// import { UserContext } from '../App' ;
// import axios from 'axios';
// import StarRating from './StartRating';
// import '../css/Recommendations.css';


// const Recommendations = () => {
//     const user = useContext(UserContext);
//     const userId = user.id;
//     const [comments, setComments] = useState([]);
//     const [averageRating, setAverageRating] = useState(0);

//     useEffect(() => {
//         const fetchComments = () => {
//             axios.get(`http://localhost:8080/comments?IdProfessional=${userId}`)
//                 .then((response) => {
//                     if (response.data && response.data.length) {
//                         const fetchedRecommendations = response.data.map(comment => ({
//                             commentCode: comment.commentCode,
//                             queueCode: comment.queueCode,
//                             idProfessional: comment.idProfessional,
//                             idCustomer: comment.idCustomer,
//                             nameCustomer: comment.firstName + comment.lastName,
//                             rating: comment.rating,
//                             content: comment.content,
//                             comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
//                             customerName: `${comment.firstName} ${comment.lastName}`
//                         }));
//                         setComments(fetchedRecommendations);
//                     } else {
//                         setComments([]);
//                         console.log('No recommendations found');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error fetching recommendations:', error);
//                 });
//         };

//         const fetchAverageRating = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8080/comments/rating/${userId}`);
//                 setAverageRating(response.data.averageRating);
//             } catch (error) {
//                 console.error("Error fetching average rating:", error);
//             }
//         };

//         fetchComments();
//         fetchAverageRating();
//     }, [userId]);

//     return (
//         <div className="recommendations-container">
//             <h1>Recommendations</h1>
//             <div className="rating">
//                 <span  class="myRating "> My Average Rating: <StarRating rating={averageRating} /></span>
//             </div>
//             <div className="comments-list">
//                 {comments.map(comment => (
//                     <div key={comment.commentCode} className="comment-card">
//                         <div className="comment-header">
//                             <span>{comment.customerName}</span>
//                             <StarRating rating={comment.rating} />
//                         </div>
//                         <div className="comment-content">
//                             <p>{comment.content}</p>
//                             <span>{comment.comments_date}</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Recommendations;



import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContex';
import axios from 'axios';
import '../css/Recommendations.css';
import StarRating from './StartRating';

const Recommendations = () => {
    const {user} = useContext(UserContext);
    const userId = user.id;
    const [comments, setComments] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        const fetchComments = () => {
            axios.get(`http://localhost:8080/comments?IdProfessional=${userId}`)
                .then((response) => {
                    if (response.data && response.data.length) {
                        const fetchedRecommendations = response.data.map(comment => ({
                            commentCode: comment.commentCode,
                            queueCode: comment.queueCode,
                            idProfessional: comment.idProfessional,
                            idCustomer: comment.idCustomer,
                            nameCustomer: comment.firstName + comment.lastName,
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
