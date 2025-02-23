import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex';
import axios from 'axios';
import '../css/SearchBusinessOwner.css';

const SearchBusinessOwner = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userId = user?.id || null;
    const [hasUserCommented, setHasUserCommented] = useState(false);
    const [searchField, setSearchField] = useState('');
    const [businessName, setBusinessName] = useState([]);
    const [filteredBusinessNames, setFilteredBusinessNames] = useState([]);
    const [businessDetails, setBusinessDetails] = useState(null);
    const [searchStatus, setSearchStatus] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [currentRecommendations, setCurrentRecommendations] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBusinessNames();
    }, []);

    const fetchBusinessNames = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:8080/professionals/business_name`);
            setBusinessName(response.data);
            setFilteredBusinessNames(response.data);
        } catch (error) {
            setError('Failed to load business names.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFieldChange = (e) => {
        const value = e.target.value;
        setSearchField(value);

        if (!value.trim()) {
            setFilteredBusinessNames(businessName);
        } else {
            setFilteredBusinessNames(
                businessName.filter(business =>
                    business.business_name?.toLowerCase().includes(value.toLowerCase())
                )
            );
        }
    };

    const handleSearch = async (name) => {
        if (!name.trim()) {
            alert('Please enter a business name.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setSearchStatus('searching');

            const response = await axios.get(`http://localhost:8080/professionals/name/${name}`);
            if (response.data) {
                setBusinessDetails(response.data);
                setSearchStatus('found');
                fetchRecommendations(response.data.idProfessional);
            } else {
                setBusinessDetails(null);
                setSearchStatus('not found');
            }
        } catch (error) {
            setError('Failed to fetch business details.');
            setSearchStatus('not found');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecommendations = async (idProfessional) => {
        try {
            const response = await axios.get(`http://localhost:8080/comments?IdProfessional=${idProfessional}`);
            const fetchedRecommendations = response.data.map(comment => ({
                commentCode: comment.commentCode,
                queueCode: comment.queueCode,
                idProfessional: comment.idProfessional,
                idCustomer: comment.idCustomer,
                rating: comment.rating,
                content: comment.content,
                comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
                customerName: `${comment.firstName} ${comment.lastName}`
            }));

            setRecommendations(fetchedRecommendations);
            setCurrentRecommendations(fetchedRecommendations.slice(0, 2));
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const handleSendComment = async () => {
        if (userRating === 0) {
            alert('Please select a rating before submitting.');
            return;
        }
        if (!userComment.trim()) {
            alert('Please enter a comment before submitting.');
            return;
        }

        const newComment = {
            queueCode: 20,
            IdProfessional: businessDetails.idProfessional,
            IdCustomer: userId,
            rating: userRating,
            content: userComment,
            comments_date: new Date().toISOString().split('T')[0]
        };

        try {
            await axios.post('http://localhost:8080/comments', newComment);
            setUserRating(0);
            setUserComment('');
            fetchRecommendations(businessDetails.idProfessional);
        } catch (error) {
            console.error('Error sending comment:', error);
        }
    };

    const navigateToInviteQueue = (businessDetails) => {
        navigate(`../inviteQueue`, { replace: true, state: { domainName: businessDetails.domainName, cityName: businessDetails.cityName } });
    };

    return (
        <div className="search-business-owner">
            <div className="search-bar">
                <input
                    list="fields"
                    placeholder="Who are you looking for?"
                    value={searchField}
                    onChange={handleFieldChange}
                />
                <datalist id="fields">
                    {filteredBusinessNames.map((field, index) => (
                        <option key={index} value={field.business_name} />
                    ))}
                </datalist>
                <button onClick={() => handleSearch(searchField)}>Search</button>
            </div>

            <main className="content">
                {isLoading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {searchStatus === 'not found' && !isLoading && <p>No suitable business found</p>}
                {searchStatus === 'found' && businessDetails && (
                    <div className="details-container">
                        <div className="business-details">
                            <h3>Business Details</h3>
                            <p>Business name: {businessDetails.business_name}</p>
                            <p>Business owner: {businessDetails.firstName} {businessDetails.lastName}</p>
                            <p>Address: {businessDetails.address}</p>
                            <p>Phone: {businessDetails.phone}</p>
                            <p>Email: {businessDetails.email}</p>
                            <div className="invite-button-container">
                                <button className="invite-button" onClick={() => navigateToInviteQueue(businessDetails)}>Invite Queue</button>
                            </div>
                            
                            {!hasUserCommented && (
                                <div className="rating-section">
                                    <h3>Rate me</h3>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={star <= userRating ? 'filled-star' : 'empty-star'}
                                                onClick={() => setUserRating(star)}
                                            >
                                                {star <= userRating ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </div>

                                    <textarea
                                        id='back_color'
                                        placeholder="Write me a recommendation / comment / enlightenment"
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                    />
                                    <button
                                        id='sendButton'
                                        onClick={handleSendComment}
                                        disabled={userComment.trim() === '' || userRating === 0}
                                    >
                                        Send
                                    </button>
                                </div>
                            )}
                            {hasUserCommented && (
                                <p>You have already commented on this business.</p>
                            )}
                        </div>

                        <div className="recommendations-list">
                            <h3>What do they say about us...</h3>
                            {recommendations.length === 0 ? (
                                <p>No recommendations yet.</p>
                            ) : (
                                currentRecommendations.map((rec, index) => (
                                    <div key={index} className="recommendation">
                                        <div className="recommendation-content">{rec.content}</div>
                                        <div className="recommendation-author">
                                            <p>{rec.customerName}</p>
                                            <span>{rec.comments_date}</span>
                                            <br />
                                            <span>Rating: {Array(rec.rating).fill('★').join('')}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                       
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchBusinessOwner;










// import React, { useState, useEffect, useContext } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { UserContext } from '../userContex';
// import axios from "axios";
// import '../css/SearchBusinessOwner.css';

// const SearchBusinessOwner = () => {
//     const navigate = useNavigate();
//     const [searchField, setSearchField] = useState('');
//     const [businessName, setBusinessName] = useState([]);
//     const [businessDetails, setBusinessDetails] = useState(null);
//     const [searchStatus, setSearchStatus] = useState('');
//     const [recommendations, setRecommendations] = useState([]);
//     const [currentRecommendations, setCurrentRecommendations] = useState([]);
//     const [userRating, setUserRating] = useState(0);
//     const [userComment, setUserComment] = useState('');
//     const [hasUserCommented, setHasUserCommented] = useState(false);
//     const {user} = useContext(UserContext);
//     const userId = user.id;
//     const { state } = useLocation();

//     useEffect(() => {
//         if (state && state.name) {
//             setSearchField(state.name);
//             handleSearch(state.name);
//         }
//     }, [state]);

//     const handleFieldChange = (e) => {
//         const selectedField = e.target.value;
//         setSearchField(selectedField);
//     };
//     useEffect(() => {
//         if (searchStatus === 'found') {
//             fetchRecommendations();
//             checkIfUserCommented();
//         } else {
//             setRecommendations([]);
//             setCurrentRecommendations([]);
//         }
//     }, [searchStatus]);

//     useEffect(() => {
//         fetchBuisnessName();
//     }, []);

//     const fetchBuisnessName = () => {
//         axios.get(`http://localhost:8080/professionals/business_name`)
//             .then(response => {
//                 setBusinessName(response.data);

//             })
//             .catch(error => {
//                 console.error('Error fetching fields:', error);
//             });
//     };

//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (recommendations.length > 2) {
//                 setCurrentRecommendations(prevRecommendations => {
//                     const nextIndex = (recommendations.indexOf(prevRecommendations[1]) + 1) % recommendations.length;
//                     return [recommendations[nextIndex], recommendations[(nextIndex + 1) % recommendations.length]];
//                 });
//             }
//         }, 2000);

//         return () => clearInterval(interval);
//     }, [recommendations]);

//     const fetchRecommendations = () => {
//         if (businessDetails) {
//             axios.get(`http://localhost:8080/comments?IdProfessional=${businessDetails.idProfessional}`)
//                 .then((response) => {
//                     if (response.data && response.data.length) {
//                         const fetchedRecommendations = response.data.map(comment => ({
//                             commentCode: comment.commentCode,
//                             queueCode: comment.queueCode,
//                             idProfessional: comment.idProfessional,
//                             idCustomer: comment.idCustomer,
//                             rating: comment.rating,
//                             content: comment.content,
//                             comments_date: new Date(comment.comments_date).toLocaleDateString('en-GB'),
//                             customerName: `${comment.firstName} ${comment.lastName}`
//                         }));
//                         setRecommendations(fetchedRecommendations);
//                         setCurrentRecommendations(fetchedRecommendations.slice(0, 2));
//                     } else {
//                         setRecommendations([]);
//                         setCurrentRecommendations([]);
//                         console.log('No recommendations found');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error fetching recommendations:', error);
//                 });
//         }
//     };

//     const handleSearch = (name) => {
//         setRecommendations([]);
//         setCurrentRecommendations([]);
//         setSearchStatus('searching');
//         console.log("name" , name);
//         axios.get(`http://localhost:8080/professionals/${name}`)
//             .then((response) => {
//                 if (response.data) {
//                     const foundBusiness = response.data;
//                     setBusinessDetails(foundBusiness);
//                     console.log(foundBusiness);
//                     setSearchStatus('found');
//                 } else {
//                     setBusinessDetails(null);
//                     setSearchStatus('not found');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error searching for business:', error);
//                 setBusinessDetails(null);
//                 setSearchStatus('not found');
//             });
//     };

//     const checkIfUserCommented = () => {
//         if (businessDetails) {
//             axios.get(`http://localhost:8080/comments?IdCustomer=${userId}&IdProfessional=${businessDetails.idProfessional}`)
//                 .then((response) => {
//                     if (response.data && response.data.length > 0) {
//                         setHasUserCommented(true);
//                     } else {
//                         setHasUserCommented(false);
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error checking user comments:', error);
//                 });
//         }
//     };

//     const handleSendComment = () => {
//         if (userRating === 0) {
//             alert('Please select a rating before submitting.');
//             return;
//         }

//         const newComment = {
//             queueCode: 20,
//             IdProfessional: businessDetails.idProfessional,
//             IdCustomer: userId,
//             rating: userRating,
//             content: userComment,
//             comments_date: new Date().toISOString().split('T')[0]
//         };

//         axios.post('http://localhost:8080/comments', newComment)
//             .then((response) => {
//                 console.log('Comment sent successfully:', response.data);
//                 setUserRating(0);
//                 setUserComment('');
//                 fetchRecommendations();
//                 checkIfUserCommented();
//             })
//             .catch(error => {
//                 console.error('Error sending comment:', error);
//             });
//     };

//     // const navigateToInviteQueue = (businessName) => {
//     //     navigate(`../inviteQueue`, { replace: true, state: { name: businessName } });
//     // };
//     const navigateToInviteQueue = (businessDetails) => {
//         navigate(`../inviteQueue`, { replace: true, state: { domainName: businessDetails.domainName, cityName: businessDetails.cityName } });
//     };


//     return (
//         <div className="search-business-owner">
//             <div className="search-bar">
//                 <input
//                     list="fields"
//                     placeholder="Who are you looking for???"
//                     value={searchField}
//                     onChange={handleFieldChange}
//                 />
//                 <datalist id="fields">
//                     {businessName.map((field, index) => (
//                         <option key={index} value={field.business_name} />
//                     ))}
//                 </datalist>
//                 <button onClick={() => handleSearch(searchField)}>Search</button>
//             </div>

//             <main className="content">
//                 {searchStatus === 'not found' && <p>No suitable business found</p>}
//                 {searchStatus === 'found' && businessDetails && (
//                     <div className="details-container">
//                         <div className="business-details">
//                             <div className="business-info">
//                                 <h3>Business Details</h3>
//                                 <p>Business name: {businessDetails.business_name}</p>
//                                 <p>Business owner name: {businessDetails.firstName + " " + businessDetails.lastName}</p>
//                                 <p>Address: {businessDetails.address}</p>
//                                 <p>City: {businessDetails.cityName}</p>
//                                 <p>Phone: {businessDetails.phone}</p>
//                                 <p>Year of business opening: {new Date(businessDetails.startDate).toLocaleDateString()}</p>
//                                 <p>Email: {businessDetails.email}</p>
//                             </div>
//                             {/* Move the Invite Queue button here */}
//                             <div className="invite-button-container">
//                                 <button className="invite-button" onClick={() => navigateToInviteQueue(businessDetails)}>Invite Queue</button>
//                             </div>
//                             {!hasUserCommented && (
//                                 <div className="rating-section">
//                                     <h3>Rate me</h3>
//                                     <div className="stars">
//                                         {[1, 2, 3, 4, 5].map(star => (
//                                             <span
//                                                 key={star}
//                                                 className={star <= userRating ? 'filled-star' : 'empty-star'}
//                                                 onClick={() => setUserRating(star)}
//                                             >
//                                                 {star <= userRating ? '★' : '☆'}
//                                             </span>
//                                         ))}
//                                     </div>

//                                     <textarea
//                                         id='back_color'
//                                         placeholder="Write me a recommendation / comment / enlightenment"
//                                         value={userComment}
//                                         onChange={(e) => setUserComment(e.target.value)}
//                                     />
//                                     <button
//                                         id='sendButton'
//                                         onClick={handleSendComment}
//                                         disabled={userComment.trim() === '' || userRating === 0}
//                                     >
//                                         Send
//                                     </button>
//                                 </div>
//                             )}
//                             {hasUserCommented && (
//                                 <p>You have already commented on this business.</p>
//                             )}
//                         </div>
//                         <div className="recommendations-list">
//                             <h3>What do they say about us...</h3>
//                             <br />
//                             <br />
//                             {recommendations.length === 0 ? (
//                                 <p>No recommendations found for this business yet.</p>
//                             ) : (
//                                 currentRecommendations.map((rec, index) => (
//                                     <div key={index}>
//                                         <div className="recommendation">
//                                             <div className="recommendation-content">{rec.content}</div>
//                                             <div className="recommendation-author">
//                                                 <p>{rec.customerName}</p>
//                                                 <span>{rec.comments_date}</span>
//                                                 <br />
//                                                 <span>Rating: {Array(rec.rating).fill('★').join('')}</span>
//                                             </div>
//                                         </div>
//                                         <br />
//                                         <br />
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// };

// export default SearchBusinessOwner;