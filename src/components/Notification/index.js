import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../constants/axiosConstant';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

const Notification = () => {
    const [requests, setRequests] = useState();
    const [isMinimized, setIsMinimized] = useState(false);
    const userId = useSelector(state => state._id);

    useEffect(() => {
        async function fetchData() {
            const response = await axiosInstance.get(`/requestscount/receiver/${userId}`);
            setRequests(response?.data?.count);
            setIsMinimized(response?.data?.count === 0);

        }

        // Call fetchData once when the component mounts
        fetchData();

        // Set up an interval to call fetchData every 8 seconds
        const intervalId = setInterval(fetchData, 8000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [userId]); // Dependency array, re-run the effect if userId changes

    const toggleMinimize = () => {
        if (requests !== 0) {
            setIsMinimized(!isMinimized);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: isMinimized ? '-80px' : '20px',
            right: '20px',
            zIndex: '1000',
            backgroundColor: isMinimized ? "#5F9FFC" : '#f8f9fa',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            height: '100px',
            width: '200px', // Set a fixed width or adjust as needed
            display: 'flex',
            flexDirection: 'column', // Stack children vertically
            alignItems: 'center', // Align items to the start of the container
            justifyContent: 'center',
        }} onClick={toggleMinimize}>

            <div style={{ display: isMinimized ? 'none' : 'block', width: '100%' }}>
                You have {requests} requests. Click {<a href="/list_your_requests">here</a>} to respond.
            </div>
        </div>
    );
};

export default Notification;
