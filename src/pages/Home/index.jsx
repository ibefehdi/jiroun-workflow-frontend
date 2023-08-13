import React, { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import "./Home.css"
import axiosInstance from '../../constants/axiosConstant'
const DetailSquare = ({ count, text }) => {
    return (
        <div className='box'>
            <h3>{count}</h3>
            <h5>{text}</h5>
        </div>
    )
}


const Home = () => {
    const [projectsCount, setProjectsCount] = useState()
    const [requestsCount, setRequestsCount] = useState();
    const [usersCount, setUsersCount] = useState();
    const [deletedRequestCount, setDeletedRequestCount] = useState();
    useEffect(() => {
        const fetchData = async () => {
            const projectCount = await axiosInstance.get('/projectscount')
            const userCount = await axiosInstance.get('/userscount')
            const requestCount = await axiosInstance.get('/requestscount')
            const deletedRequestCount = await axiosInstance.get('/deletedrequestscount')
            setProjectsCount(projectCount?.data?.count)
            setUsersCount(userCount?.data?.count)
            setRequestsCount(requestCount?.data?.count);
            setDeletedRequestCount(deletedRequestCount?.data.count)
        }
        fetchData();
    }, [projectsCount])
    return (
        <Container className='homeContainer' fluid>
            <h1 style={{ marginLeft: "1rem" }} className='Heading'>Dashboard</h1>
            <div className="detail-squares">
                <DetailSquare count={projectsCount} text={"Projects"} />
                <DetailSquare count={usersCount} text={"Users"} />
                <DetailSquare count={requestsCount} text={"Requests"} />
                <DetailSquare count={deletedRequestCount} text={"Deleted Requests"} />
            </div>
        </Container>

    )
}

export default Home