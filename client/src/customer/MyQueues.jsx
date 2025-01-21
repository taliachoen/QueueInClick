// // import React, { useContext, useEffect, useState } from 'react';
// // import axios from 'axios';
// // import { UserContext } from '../App' ;


// // function MyQueues() {
// //     const [queues, setQueues] = useState([]);
// //     const user = useContext(UserContext);
// //     useEffect(() => {
// //         axios.get(`http://localhost:8080/queues/${user.customerId}`)
// //             .then(response => {
// //                 setQueues(response.data);
// //             })
// //             .catch(error => {
// //                 console.error('There was an error fetching the queues!', error);
// //             });
// //     }, [user.customerId]);

// //     const cancelQueue = (queueCode) => {
// //         axios.put(`http://localhost:8080/queues/cancel/${queueCode}`)
// //             .then(response => {
// //                 setQueues(queues.filter(queue => queue.QueueCode !== queueCode));
// //             })
// //             .catch(error => {
// //                 console.error('There was an error cancelling the queue!', error);
// //             });
// //     };

// //     return (
// //         <div>
// //             <ul>
// //                 {queues.map(queue => (
// //                     <li key={queue.QueueCode}>
// //                         {queue.Date} - {queue.Hour} - {queue.Status}
// //                         <button onClick={() => cancelQueue(queue.QueueCode)}>Cancel</button>
// //                     </li>
// //                 ))}
// //             </ul>
// //         </div>
// //     );
// // }

// // export default MyQueues;
// import React, { useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import { UserContext } from '../userContex';
// import '../css/MyQueues.css';

// function MyQueues() {
//     const [queues, setQueues] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const {user} = useContext(UserContext);

//     useEffect(() => {
//         axios.get(`http://localhost:8080/queues/${user.id}`)
//             .then(response => {
//                 setQueues(response.data);
//                 setLoading(false);
//             })
//             .catch(error => {
//                 setError('There was an error fetching the queues!');
//                 setLoading(false);
//             });
//     }, [user.customerId]);

//     const cancelQueue = (queueCode) => {
//         axios.put(`http://localhost:8080/queues/cancel/${queueCode}`)
//             .then(response => {
//                 setQueues(queues.filter(queue => queue.QueueCode !== queueCode));
//             })
//             .catch(error => {
//                 setError('There was an error cancelling the queue!');
//             });
//     };

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }
//     return (
//         <div className="my-queues">
//             <h2>My Queues</h2>
//             <ul className="queue-list">
//                 {queues.map(queue => (
//                     <li key={queue.queueCode} className="queue-item">
//                         <span className="queue-info">{new Date(queue.Date).toLocaleDateString()} - {queue.Hour} - {queue.Status}</span>
//                         <button className="cancel-button" onClick={() => cancelQueue(queue.QueueCode)}>Cancel</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default MyQueues;


import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../userContex';
import '../css/MyQueues.css';

function MyQueues() {
    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);

    useEffect(() => {
        axios.get(`http://localhost:8080/queues/${user.id}`)
            .then(response => {
                setQueues(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('There was an error fetching the queues!');
                setLoading(false);
            });
    }, [user.id]);

    const cancelQueue = (queueCode) => {
        axios.put(`http://localhost:8080/queues/cancel/${queueCode}`)
            .then(response => {
                setQueues(queues.filter(queue => queue.QueueCode !== queueCode));
            })
            .catch(error => {
                setError('There was an error cancelling the queue!');
            });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="my-queues">
            <h2>My Queues</h2>
            <ul className="queue-list">
                {queues.map(queue => (
                    <li key={queue.QueueCode} className="queue-item">
                        <span className="queue-info">{new Date(queue.Date).toLocaleDateString()} - {queue.Hour} - {queue.Status}</span>
                        <button className="cancel-button" onClick={() => cancelQueue(queue.QueueCode)}>Cancel</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MyQueues;
