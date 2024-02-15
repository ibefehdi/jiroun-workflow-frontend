import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../constants/axiosConstant';

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

        fetchData();
        const intervalId = setInterval(fetchData, 8000);
        return () => clearInterval(intervalId);
    }, [userId]);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div onClick={toggleMinimize} style={{
            position: 'fixed',
            bottom: isMinimized ? '-80px' : '20px',
            right: '20px',
            zIndex: '1000',
            backgroundColor: isMinimized ? "#6C757D" : '#33C7F4', // Oranges for higher visibility
            padding: '10px',
            borderRadius: '10px', // Slightly more rounded
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', // Stronger shadow for more depth
            height: '120px', // Slightly larger for more content
            width: '250px', // Adjusted width
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease', // Smooth transition for attention
            transform: isMinimized ? 'scale(0.8)' : 'scale(1)', // Scale effect on minimize/maximize
            cursor: 'pointer', // Change cursor to indicate clickable
        }}>
            <div style={{ display: isMinimized ? 'none' : 'block', width: '100%', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                You have {requests} requests. Click <a href="/list_your_requests" style={{ color: 'white' }}>here</a> to respond.
            </div>
        </div>
    );
};

export default Notification;
