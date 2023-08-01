import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useSelector } from 'react-redux';
import { Button, Container, Modal, ModalHeader, ModalBody } from 'reactstrap';
import TableContainer from '../../components/TableContainer';
import RequestDetailModal from './RequestDetailModal';  

const ListYourProjects = () => {
  const userId = useSelector(state => state._id);
  const [modal, setModal] = useState(false);
  const [requestDetail, setRequestDetail] = useState(null);
  const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
    axiosInstance.get,
    `/requests/user/${userId}`,
    'status',
    'data'
  );

  const fetchRequestDetail = async (requestId) => {
    const response = await axiosInstance.get(`/requests/${requestId}`);
    setRequestDetail(response?.data);
    toggle();
  };

  useEffect(() => {
    fetchData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchData])

  const columns = useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'project.projectName', // This is a nested field
      },

      {
        Header: 'Sent By',
        accessor: 'chainOfCommand[0].nextUserId.username', // This is a nested field in an array
      },
      {
        Header: 'Request Type',
        accessor: 'requestType',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          if (value === 0) {
            return 'Pending';
          } else if (value === 1) {
            return 'Approved';
          } else if (value === 2) {
            return 'Declined';
          }
        }
      },
      {
        Header: 'Actions',
        accessor: '_id',
        Cell: ({ value: requestId }) => (
          <Button onClick={() => fetchRequestDetail(requestId)}>
            View Details
          </Button>
        ),
      }
    ],
  );
  const toggle = () => setModal(!modal);

  return (
    <Container className={'pagecontainer'}>
      <div className='header'>
        <h1>Your Requests</h1>
      </div>
      <TableContainer
        data={data}
        pageCount={pageCount}
        fetchData={fetchData}
        loading={loadStatus}
        totalDataCount={totalDataCount}
        columns={columns}
      />
      <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} />  {/* The RequestDetailModal component */}
    </Container>
  )
}

export default ListYourProjects
