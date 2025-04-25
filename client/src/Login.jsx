import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import './css/Login.css';
import Swal from 'sweetalert2';
import { UserContext } from './userContex';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const location = useLocation();
    const [formUserData, setFormUserData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [userType, setUserType] = useState('customer');

    const handleGoBack = () => {
        navigate(`LandingPage`);
    };

    // Detect user type from URL query params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');
        if (type) {
            setUserType(type);
        }
    }, [location]);

    // Handle login form submission
    const handleSubmitLogin = (e) => {
        e.preventDefault();
        const errors = validate(formUserData);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            const endpoint = userType === 'customer'
                ? 'http://localhost:8080/customers/login'
                : 'http://localhost:8080/professionals/login';

            axios.post(endpoint, formUserData)
                .then((response) => {
                    if (response.status === 200) {
                        const user = response.data;
                        console.log("useruser" , user);

                        // Prepare user context data depending on user type
                        const userContextData = userType === 'customer'
                            ? {
                                id: user.idCustomer,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                cityCode: user.cityCode,
                                cityName: user.cityName,
                                address: user.address,
                                phone: user.phone,
                                userType: 'customers'
                            }
                            : {
                                id: user.idProfessional,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                domainCode: user.domainCode,
                                domainName: user.domainName,
                                startDate: user.startDate,
                                email: user.email,
                                cityCode: user.cityCode,
                                cityName: user.cityName,
                                address: user.address,
                                phone: user.phone,
                                business_name: user.business_name,
                                logo: user.logo,
                                userType: 'professionals'
                            };

                        // Update global user state
                        setUser(userContextData);

                        // Show success alert and redirect
                        Swal.fire({
                            icon: 'success',
                            title: 'Login Successful',
                            text: `Welcome, ${user.firstName}!`,
                            showConfirmButton: false,
                            timer: 1500
                        });

                        navigate(`/${userType}Menu/${user.firstName}`);
                    }
                })
                .catch(error => {
                    // Handle login errors
                    let errorMessage = 'Something went wrong, please try again later';
                    if (error.response) {
                        if (error.response.status === 401) {
                            errorMessage = 'Invalid email or password';
                        } else if (error.response.status === 500) {
                            errorMessage = 'Internal server error, please try again later';
                        }
                    }

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage,
                        showConfirmButton: true
                    });

                    // Reset form fields
                    setFormUserData({
                        email: '',
                        password: ''
                    });

                    if (error.response?.status !== 401) {
                        console.error('Login error:', error);
                    }
                });
        }
    };

    // Handle input field changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };

    // Basic form validation
    const validate = (values) => {
        const errors = {};
        if (!values.email) {
            errors.email = "Email is required!";
        }
        if (!values.password) {
            errors.password = "Password is required";
        } else if (values.password.length < 4 || values.password.length > 40) {
            errors.password = "Password must be between 4 and 40 characters";
        }
        return errors;
    };

    // Redirect to registration page
    const handleRegister = () => {
        const registerPath = userType === 'customer' ? '/registerCustomer' : '/BusinessRegistration/step1';
        navigate(registerPath);
    };

    return (
        <div id="login-container">
            <form id="login-form" onSubmit={handleSubmitLogin}>
                <button onClick={handleGoBack} id="back-button" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '10px' }}>
                    🔙 
                </button>

                <h1>Login</h1>
                <div>
                    <label>Email</label>
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={formUserData.email}
                        onChange={handleChange}
                        autoComplete="username"
                    />
                    <p>{formErrors.email}</p>

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formUserData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
                    <p>{formErrors.password}</p>
                </div>

                <div>
                    <button type="submit">Login</button>
                    <button type="button" onClick={handleRegister} id="register-button">Register</button>
                </div>
            </form>
        </div>
    );
};

export default Login;














// import { useState, useEffect, useContext } from "react";
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from "axios";
// import './css/Login.css';
// import Swal from 'sweetalert2';
// import { UserContext } from './userContex';

// const Login = () => {
//     const navigate = useNavigate();
//     const { setUser } = useContext(UserContext);
//     const location = useLocation();
//     const [formUserData, setFormUserData] = useState({
//         email: '',
//         password: '',
//     });
//     const [formErrors, setFormErrors] = useState({});
//     const [userType, setUserType] = useState('customer');  

//     useEffect(() => {
//         const queryParams = new URLSearchParams(location.search);
//         const type = queryParams.get('type');
//         if (type) {
//             setUserType(type);
//         }
//     }, [location]);

//     const handleSubmitLogin = (e) => {
//         e.preventDefault();
//         const errors = validate(formUserData);
//         setFormErrors(errors);
//         if (Object.keys(errors).length === 0) {
//             const endpoint = userType === 'customer' ? 'http://localhost:8080/customers/login' : 'http://localhost:8080/professionals/login';
//             axios.post(endpoint, formUserData)
//                 .then((response) => {
//                     if (response.status === 200) {
//                         const user = response.data;
//                         if (user) {
//                             const userContextData = userType === 'customer'
//                                 ? {
//                                     id: user.idCustomer,
//                                     firstName: user.firstName,
//                                     lastName: user.lastName,
//                                     email: user.email,
//                                     cityCode: user.cityCode,
//                                     cityName: user.cityName,
//                                     address: user.address,
//                                     phone: user.phone,
//                                     userType: 'customers'
//                                 }
//                                 : {
//                                     id: user.idProfessional,
//                                     firstName: user.firstName,
//                                     lastName: user.lastName,
//                                     domainCode: user.domainCode,
//                                     domainName: user.domainName,
//                                     startDate: user.startDate,
//                                     email: user.email,
//                                     cityCode: user.cityCode,
//                                     cityName: user.cityName,
//                                     address: user.address,
//                                     phone: user.phone,
//                                     business_name: user.business_name,
//                                     logo: user.logo,
//                                     userType: 'professionals'
//                                 };
//                             setUser(userContextData);
//                             Swal.fire({
//                                 icon: 'success',
//                                 title: 'Login Successful',
//                                 text: `Welcome, ${user.firstName}!`,
//                                 showConfirmButton: false,
//                                 timer: 1500
//                             });
//                             navigate(`/${userType}Menu/${user.firstName}`);
//                         }
//                     }
//                 })
//                 .catch(error => {
//                     let errorMessage = 'Something went wrong, please try again later';
//                     if (error.response) {
//                         if (error.response.status === 401) {
//                             errorMessage = 'Invalid email or password';
//                         } else if (error.response.status === 500) {
//                             errorMessage = 'Internal server error, please try again later';
//                         }
//                     }
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Error',
//                         text: errorMessage,
//                         showConfirmButton: true
//                     });

//                     setFormUserData({
//                         email: '',
//                         password: ''
//                     });
//                     if (error.response?.status !== 401) {
//                         console.error('Login error:', error);
//                     }
//                 });
//         }
//     };


//     const handleChange = (event) => {
//         const { name, value } = event.target;
//         setFormUserData((prevUserData) => ({
//             ...prevUserData,
//             [name]: value,
//         }));
//     };

//     const validate = (values) => {
//         const errors = {};
//         if (!values.email) {
//             errors.email = "Email is required!";
//         }
//         if (!values.password) {
//             errors.password = "Password is required";
//         } else if (values.password.length < 4 || values.password.length > 40) {
//             errors.password = "Password must be between 4 and 40 characters";
//         }
//         return errors;
//     };

//     const handleRegister = () => {
//         const registerPath = userType === 'customer' ? '/registerCustomer' : '/BusinessRegistration/step1';
//         navigate(registerPath);
//     };

//     return (
//         <div id="login-container">
//             <form id="login-form" onSubmit={handleSubmitLogin}>
//                 <h1>Login</h1>
//                 <div>
//                     <label>Email</label>
//                     <input
//                         type="text"
//                         name="email"
//                         placeholder="Email"
//                         value={formUserData.email}
//                         onChange={handleChange}
//                         autoComplete="username"
//                     />
//                     <p>{formErrors.email}</p>
//                     <label>Password</label>
//                     <input
//                         type="password"
//                         name="password"
//                         placeholder="Password"
//                         value={formUserData.password}
//                         onChange={handleChange}
//                         autoComplete="current-password"
//                     />
//                     <p>{formErrors.password}</p>
//                 </div>
//                 <div>
//                     <button type="submit">Login</button>
//                     <button type="button" onClick={handleRegister} id="register-button">Register</button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default Login;

