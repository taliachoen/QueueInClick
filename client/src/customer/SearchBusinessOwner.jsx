import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex';
import axios from 'axios';
import '../css/SearchBusinessOwner.css';
import { useLocation } from 'react-router-dom';
import BusinessCarousel from './BusinessCarousel'; // יבוא הקומפוננטה החדשה
import Swal from 'sweetalert2';

const SearchBusinessOwner = () => {
    const location = useLocation();
    const [searchField, setSearchField] = useState(location.state?.businessName || '');

    useEffect(() => {
        if (location.state?.businessName) {
            handleSearch(location.state.businessName);
        }
    }, [location.state]);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userId = user?.id || null;
    const [hasUserCommented, setHasUserCommented] = useState(false);
    //const [searchField, setSearchField] = useState('');
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
    const [formattedDate, setformattedDate] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (recommendations.length <= 2) {
            setCurrentRecommendations(recommendations);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 2) % recommendations.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [recommendations]);

    useEffect(() => {
        setCurrentRecommendations(recommendations.slice(currentIndex, currentIndex + 2));
    }, [currentIndex, recommendations]);

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
                console.log(businessDetails, "businessDetails");
                const startDate = new Date(businessDetails.startDate);
                const formattedDate = startDate.toLocaleDateString('he-IL'); // פורמט בעברית
                setformattedDate(formattedDate);
                console.log(formattedDate); //זה יציג תאריך כמו "31/03/2025"
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
            const response = await axios.get(`http://localhost:8080/comments?idProfessional=${idProfessional}`);
            console.log(response.data);
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
        console.log('handleSendComment called');

        if (userRating === 0) {
            Swal.fire('Error', 'Please select a rating before submitting.', 'error');
            return;
        }
        if (!userComment.trim()) {
            Swal.fire('Error', 'Please enter a comment before submitting.', 'error');
            return;
        }

        try {
            // 🔹 בדיקת האם מותר להגיב
            const checkResponse = await axios.get('http://localhost:8080/comments/check', {
                params: { IdProfessional: businessDetails.idProfessional, IdCustomer: userId }
            });

            console.log("🔵 Response from server:", checkResponse.data); // בדיקת נתונים שמתקבלים

            if (!checkResponse.data.canCommented) {
                // ❌ המשתמש *לא* יכול להגיב – עליו לחכות!
                Swal.fire({
                    title: 'Please wait',
                    text: `You can leave another comment on ${checkResponse.data.nextAllowedDate}.`,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                setUserComment('');
                setUserRating(0);
                return;
            }

            // ✅ המשתמש *יכול* לשלוח תגובה – שולחים לשרת
            const newComment = {
                queueCode: 20,
                idProfessional: businessDetails.idProfessional,
                idCustomer: userId,
                rating: userRating,
                content: userComment,
                comments_date: new Date().toISOString().split('T')[0]
            };

            console.log('Sending new comment:', newComment);
            await axios.post('http://localhost:8080/comments', newComment);

            // איפוס טופס לאחר שליחה
            setUserRating(0);
            setUserComment('');
            await fetchRecommendations(businessDetails.idProfessional);

            Swal.fire('Success', 'Your comment has been submitted successfully.', 'success');

        } catch (error) {
            console.error('Error sending comment:', error.response?.data || error.message);
            Swal.fire('Error', `There was an issue submitting your comment: ${error.response?.data?.message || error.message}`, 'error');
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
                            <p>Start Date: {formattedDate}</p>
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
                                            <span>
                                                Rating:
                                                {[...Array(5)].map((_, starIndex) => (
                                                    <span
                                                        key={starIndex}
                                                        style={{
                                                            color: starIndex < rec.rating ? 'yellow' : 'gray', // צבע צהוב אם הכוכב נבחר, אפור אם לא
                                                            fontSize: '20px', // גודל הכוכב (אפשר לשנות לפי הצורך)
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>


                    </div>
                )}
            </main>
            {searchStatus === '' && <BusinessCarousel />}
        </div>
    );
};

export default SearchBusinessOwner;