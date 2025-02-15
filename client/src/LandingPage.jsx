import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitterSquare, faFacebookSquare, faSnapchatSquare } from '@fortawesome/free-brands-svg-icons';
import { TfiNewWindow } from "react-icons/tfi";
import { GiSofa } from "react-icons/gi";
import { GoStopwatch } from "react-icons/go";
import './css/LandingPage.css';
import logo from './image/logo.png';

const Section = ({ title, children, className }) => (
    <section className={`landing-section ${className}`}>
        <h3 className="landing-title">{title}</h3>
        <hr />
        {children}
    </section>
);

const DropdownCust = ({ options, onSelect }) => (
    <div id="optionCust" >
        {options.map((option, index) => (
            <button key={index} onClick={() => onSelect(option.path)}>
                {option.label}
            </button>
        ))}
    </div>
);

const DropdownPorff = ({ options, onSelect }) => (
    <div id="optionProff"  >
        {options.map((option, index) => (
            <button key={index} onClick={() => onSelect(option.path)}>
                {option.label}
            </button>
        ))}
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [showCustomerOptions, setShowCustomerOptions] = useState(false);
    const [showProfessionalOptions, setShowProfessionalOptions] = useState(false);

    const customerOptions = [
        { label: 'Login', path: '/login?type=customer' },
        { label: 'Register', path: '/registerCustomer' }
    ];
    const professionalOptions = [
        { label: 'Login', path: '/login?type=professional' },
        { label: 'Register', path: '/BusinessRegistration/step1' }
    ];
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className='landing-page'>
            <header className="landing-header">
                <div className="landing-button-container">
                    <button type="button" onClick={() => setShowCustomerOptions(!showCustomerOptions)}>Customer</button>
                    {showCustomerOptions && <DropdownCust options={customerOptions} onSelect={handleNavigate} />}
                    <button type="button" onClick={() => setShowProfessionalOptions(!showProfessionalOptions)}>Professional</button>
                    {showProfessionalOptions && <DropdownPorff  options={professionalOptions} onSelect={handleNavigate} />}
                </div>
            </header>
            <div className="landing-main-content">
                <img id="LogoQuick" src={logo} alt="Logo" />
                <Section title="About us" className="landing-white-section">
                    <p>
                        Effortlessly Schedule Your Appointments!
                        Are you tired of the hassle of booking appointments? <br></br>What if managing your schedule could be as simple as a single click?<br></br>
                        With queueInClick, you can book appointments quickly and easily, whenever it’s convenient for you. No more waiting on hold, no more back-and-forth—just a seamless and stress-free experience designed to fit your busy life.
                    </p>
                </Section>
                <Section title="Our advantages" className="landing-colored-section">
                    <ul className="landing-grid landing-packages">
                        <li>
                            <TfiNewWindow size="80px" />
                            <h4>Innovation</h4>
                            <p>Conduct in an innovative and practical way.</p>
                        </li>
                        <li>
                            <GiSofa size="80px" />
                            <h4>Comfort</h4>
                            <p>Simple and intuitive design for effortless use.</p>
                        </li>
                        <li>
                            <GoStopwatch size="80px" />
                            <h4>Efficiency</h4>
                            <p>Book appointments anytime, anywhere..</p>
                        </li>
                    </ul>
                </Section>

            </div>

            <footer className="landing-footer">
                <p>All rights reserved to Shira Rosen and Talia Cohen.</p>
                <ul>
                    <li><a href="#"><FontAwesomeIcon icon={faTwitterSquare} /></a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faFacebookSquare} /></a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faSnapchatSquare} /></a></li>
                </ul>
            </footer>
        </div>
    );
};

export default LandingPage;
