import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../constants/axiosConstant';
import { useGETAPI } from '../../hooks/useGETAPI';
import { useSelector } from 'react-redux';
import { Button, Container, Modal, ModalHeader, ModalBody } from 'reactstrap';
import TableContainer from '../../components/TableContainer';
import RequestDetailModal from './RequestDetailModal';

const ListYourProjects = () => {
  const userId = useSelector(state => state._id);
  console.log(userId);
  const [modal, setModal] = useState(false);
  const [requestDetail, setRequestDetail] = useState(null);
  const { data, fetchData, pageCount, totalDataCount, loadStatus } = useGETAPI(
    axiosInstance.get,
    `/requestsreceivedbyuser/user/${userId}`,
    'status',
    'data'
  );
  const {
    data: sentData,
    fetchData: fetchSentData,
    pageCount: sentPageCount,
    totalDataCount: sentTotalDataCount,
    loadStatus: sentLoadStatus
  } = useGETAPI(
    axiosInstance.get,
    `/requestsmadebyuser/user/${userId}`,
    'status',
    'data'
  );

  useEffect(() => {
    fetchSentData({
      pageSize: 10,
      pageIndex: 1,
    });
  }, [fetchSentData]);
  const fetchRequestDetail = async (requestId) => {
    console.log(requestId + "This is the request detail");
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
        accessor: 'project.projectName',
      },
      {
        Header: 'Request Type',
        accessor: 'requestType',
      },
      {
        Header: 'Sender',
        accessor: data => {
          // Get the chain of command item where nextUserId equals userId
          const chainItem = data.chainOfCommand.find(item => item.nextUserId._id === userId);
          // If such an item exists, return a concatenated string of fName and lName
          return chainItem ? `${chainItem.userId.fName} ${chainItem.userId.lName}` : '';
        },
        // This id field is necessary when accessor is a function.
        // It must be unique for each column.
        id: 'senderName'
      },
      {
        Header: 'Status',
        accessor: data => {
          // Get the chain of command item where nextUserId equals userId
          const chainItem = data.chainOfCommand.find(item => item.nextUserId._id === userId);
          // If such an item exists, return the status.
          // You might want to convert this numerical status into human-readable form
          return chainItem ? chainItem.status : '';
        },
        id: 'chainItemStatus',
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
  const sentColumns = useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'project.projectName',
      },
      {
        Header: 'Request Type',
        accessor: 'requestType',
      },
      {
        Header: 'Sent To',
        accessor: data => {
          // Get the chain of command item where nextUserId equals userId
          const chainItem = data.chainOfCommand.find(item => item.userId._id === userId);
          // If such an item exists, return a concatenated string of fName and lName
          return chainItem ? `${chainItem.userId.fName} ${chainItem.userId.lName}` : '';
        },
        // This id field is necessary when accessor is a function.
        // It must be unique for each column.
        id: 'senderName'
      },
      {
        Header: 'Status',
        accessor: data => {
          // Get the chain of command item where nextUserId equals userId
          const chainItem = data.chainOfCommand.find(item => item.userId._id === userId);
          // If such an item exists, return the status.
          // You might want to convert this numerical status into human-readable form
          return chainItem ? chainItem.status : '';
        },
        id: 'chainItemStatus',
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
        <h1>Requests Received by User</h1>
      </div>
      <TableContainer
        data={data}
        pageCount={pageCount}
        fetchData={fetchData}
        loading={loadStatus}
        totalDataCount={totalDataCount}
        columns={columns}
      />
      <RequestDetailModal isOpen={modal} toggle={toggle} requestDetail={requestDetail} />
      <div className='header'>
        <h1>Requests Sent By User</h1>
        
      </div>
      <TableContainer
          data={sentData}
          pageCount={sentPageCount}
          fetchData={fetchSentData}
          loading={sentLoadStatus}
          totalDataCount={sentTotalDataCount}
          columns={sentColumns}
        />
    </Container>
  )
}

export default ListYourProjects
