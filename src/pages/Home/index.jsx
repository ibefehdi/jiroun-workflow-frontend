import React, { useEffect, useState } from 'react'
import { Container } from 'reactstrap'
import "./Home.css"
import axiosInstance from '../../constants/axiosConstant'
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DetailSquare = ({ count, text, path }) => {
    const superAdmin = useSelector(state => state.superAdmin)
    const history = useHistory();
    const handleBoxClick = () => {
        if (path) {
            history.push(path);
        }
    };

    return (

        <div className='box' onClick={superAdmin ? handleBoxClick : null}>
            <h3>{count}</h3>
            <h5>{text}</h5>
        </div>
    )
}


const Home = () => {
    const superAdmin = useSelector(state => state.superAdmin);

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
                <DetailSquare count={projectsCount} text={"Projects"} path={"/projectsmanagement"} />
                <DetailSquare count={usersCount} text={"Users"} path={superAdmin ? "/usermanagement" : undefined} />
                <DetailSquare count={requestsCount} text={"Requests"} path={"/listyourrequests"} />
                <DetailSquare count={deletedRequestCount} text={"Deleted Requests"} path={"/deletedRequests"} />
            </div>
        </Container>

    )
}

export default Home