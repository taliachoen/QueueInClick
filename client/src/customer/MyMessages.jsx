import  {React , useState, useEffect, useRef, useCallback,useContext} from 'react';
import axios from 'axios';
import '../css/MyMessages.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex'; 

const MyMessages = () => {
    const [messages, setMessages] = useState([]);
    const [allRead, setAllRead] = useState(false);
    const timeoutRef = useRef(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    // Fetch messages for the logged-in user
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/messages/${user.id}`);
                const fetchedMessages = response.data;
                setMessages(fetchedMessages);

                const unreadMessages = fetchedMessages.filter(message => message.isRead === 0);
                setAllRead(unreadMessages.length === 0);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [user.id]);

    // Handle clicking the 'Business Details' button
    const handleDetailsClick = (businessName) => {
        navigate(`../searchBusinessOwner`, { replace: true, state: { businessName } });
    };

    // Mark a message as read and update the state
    const markAsRead = async (messageCode) => {
        try {
            await axios.post(`http://localhost:8080/messages/${messageCode}/markAsRead`);
            // Update the state locally to reflect the change
            setMessages(messages.map(message =>
                message.messageCode === messageCode ? { ...message, isRead: 1 } : message
            ));
        } catch (error) {
            console.error('Error updating message read status:', error);
        }
    };

    const handleMouseEnter = useCallback((messageCode) => {
        timeoutRef.current = setTimeout(() => {
            markAsRead(messageCode);
        }, 2500);
    }, [messages]);

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
    };

    return (
        <div className="messages-container">
            <h1 className="titleMessage">Messages</h1>
            {allRead && <div className="all-read-message">Wonderful!! You've read all the messages.</div>}
            <h5>Hover over the title to see the content of the message</h5>
            <table className="messages-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Business</th>
                        <th>Professional</th>
                        <th>Title</th>
                        <th> Business Details</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map(message => (
                        <tr
                            key={message.messageCode}
                            className={message.isRead === 0 ? 'unread-message' : ''}
                            onMouseEnter={() => handleMouseEnter(message.messageCode)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <td>{new Date(message.message_date).toLocaleDateString()}</td>
                            <td>{message.customer_name}</td>
                            <td>{message.business_name}</td>
                            <td>{message.professional_name}</td>
                            <td className="tooltip">
                                {message.title}
                                <span className="tooltiptext">{message.content}</span>
                            </td>
                            <td>
                                <button id="moreDetails" onClick={() => handleDetailsClick(message.business_name)}>
                                    Business Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyMessages;










// import React, { useState, useEffect, useRef, useCallback,useContext} from 'react';
// import axios from 'axios';
// import '../css/MyMessages.css';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../userContex'; 


// const MyMessages = () => {
//     const [messages, setMessages] = useState([]);
//     const [allRead, setAllRead] = useState(false);
//     const timeoutRef = useRef(null);
//     const { user } = useContext(UserContext);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchMessages = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8080/messages/${user.id}`);

//                 const fetchedMessages = response.data;
//                 setMessages(fetchedMessages);
//                 const unreadMessages = fetchedMessages.filter(message => message.isRead === 0);
//                 setAllRead(unreadMessages.length === 0);
//             } catch (error) {
//                 console.error('Error fetching messages:', error);
//             }
//         };

//         fetchMessages();
//     }, []);

//     const handleDetailsClick = (businessName) => {
//         navigate(`../searchBusinessOwner`, { replace: true, state: { businessName } });
//     };

//     const markAsRead = async (messageCode) => {
//         try {
           
//             await axios.post(`http://localhost:8080/messages/${messageCode}/markAsRead`);
//             setMessages(response.data);

//             // setMessages(messages.map(message =>
//             //     message.messageCode === messageCode ? { ...message, isRead: 1 } : message
//             // ));

//             if (user && user.id) {
//                 fetchMessagesForCustomer();
//             }
//         } catch (error) {
//             console.error('Error updating message read status:', error);
//         }
//     };

//     const handleMouseEnter = useCallback((messageCode) => {
//         timeoutRef.current = setTimeout(() => {
//             markAsRead(messageCode);
//         }, 2500);
//     }, [messages]);

//     const handleMouseLeave = () => {
//         clearTimeout(timeoutRef.current);
//     };

//     return (
//         <div className="messages-container">
//             <h1 className="titleMessage">Messages</h1>
//             {allRead && <div className="all-read-message">Wonderful!! You've read all the messages.</div>}
//             <h5>stand on the title to see the content of the message</h5>
//             <table className="messages-table">
//                 <thead>
//                     <tr>
//                         <th>Date</th>
//                         <th>Customer</th>
//                         <th>Business</th>
//                         <th>Professional</th>
//                         <th>Title</th>
//                         <th> Business Details</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {messages.map(message => (
//                         <tr
//                             key={message.messageCode}
//                             className={message.isRead === 0 ? 'unread-message' : ''}
//                             onMouseEnter={() => handleMouseEnter(message.messageCode)}
//                             onMouseLeave={handleMouseLeave}
//                         >
//                             <td>{new Date(message.message_date).toLocaleDateString()}</td>
//                             <td>{message.customer_name}</td>
//                             <td>{message.business_name}</td>
//                             <td>{message.professional_name}</td>
//                             <td className="tooltip">
//                                 {message.title}
//                                 <span className="tooltiptext">{message.content}</span>
//                             </td>
//                             <td>
//                                 <button id="moreDetails" onClick={() => handleDetailsClick(message.business_name)}>
//                                     Business Details
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default MyMessages;