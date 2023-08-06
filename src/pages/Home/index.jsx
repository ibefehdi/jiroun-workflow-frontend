import React, { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import "./Home.css"
import axiosInstance from '../../constants/axiosConstant'
const DetailSquare = ({ count, text }) => {
    return (
        <div className='box'>
            <h3>{count}</h3>
            <h5 style={{ color: "#01CCFF" }}>{text}</h5>
        </div>
    )
}


const Home = () => {
    const [projectsCount, setProjectsCount] = useState()
    const [requestsCount, setRequestsCount] = useState();
    const [usersCount, setUsersCount] = useState();
    useEffect(() => {
        const fetchData = async () => {
            const projectCount = await axiosInstance.get('/projectscount')
            const userCount = await axiosInstance.get('/userscount')
            const requestCount = await axiosInstance.get('/new/requestscount')
            setProjectsCount(projectCount?.data?.count)
            setUsersCount(userCount?.data?.count)
            setRequestsCount(requestCount?.data?.count);
        }
        fetchData();
        console.log(projectsCount)
    }, [projectsCount])
    return (
        <Container fluid>
            <h1 className='Heading'>Dashboard</h1>
            <div className="detail-squares">
                <DetailSquare count={projectsCount} text={"Projects"} />
                <DetailSquare count={usersCount} text={"Users"} />
                <DetailSquare count={requestsCount} text={"Requests"} />
            </div>
        </Container>

    )
}

export default Home