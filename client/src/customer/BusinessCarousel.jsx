
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../css/BusinessCarousel.css';

const BusinessCarousel = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [businesses, setBusinesses] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState('');

    useEffect(() => {
        fetchBusinessNames();
    }, []);

    const fetchBusinessNames = async () => {
        try {
            // setIsLoading(true);
            const response = await axios.get(`${apiUrl}/professionals/`);
            setBusinesses(response.data);
        } catch (error) {
            console.error('Failed to load business names.');
        }
        // setError('Failed to load business names.');)
        // } finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <div className="carousel-container">
            <h3>Check out these businesses!</h3>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }}>
                {businesses.map((business, index) => (
                    <SwiperSlide key={index}>
                        <div className="carousel-item">
                            <h4>{business.business_name}</h4>
                            <p><strong>Owner:</strong> {business.firstName} {business.lastName}</p>
                            <p><strong>Address:</strong> {business.address}</p>
                            <p><strong>Phone:</strong> {business.phone}</p>
                            <p><strong>Email:</strong> {business.email}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default BusinessCarousel;
