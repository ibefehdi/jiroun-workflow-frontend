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
  const flattenData = (data) => {
    return data.flatMap(item => {
      return item.chainOfCommand.map(chainItem => {
        return {
          ...item,
          chainOfCommand: chainItem,  // replacing chainOfCommand with a single item
          senderName: `${chainItem?.userId?.fName} ${chainItem?.userId?.lName}`,
          chainItemStatus: chainItem.status
        };
      });
    });
  };

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
  const flatData = flattenData(data)
  const sentFlatData = flattenData(sentData);

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
        accessor: 'senderName',  // No need for function now, directly access senderName
      },
      {
        Header: 'Status',
        accessor: 'chainItemStatus',  // No need for function now, directly access chainItemStatus
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
        Header: 'Global Status',
        accessor: "status",
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
          // Get the chain of command item where userId equals Redux userId
          const chainItem = data?.chainOfCommand;

          // If such an item exists, return a concatenated string of fName and lName
          // of the next user in the chain of command (nextUserId)
          return chainItem && chainItem.userId ? `${chainItem.userId.fName} ${chainItem.userId.lName}` : '';
        },
        // This id field is necessary when accessor is a function.
        // It must be unique for each column.
        id: 'recipientName'
      },

      {
        Header: 'Status',
        accessor: 'chainItemStatus',  // No need for function now, directly access chainItemStatus
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
        Header: 'Global Status',
        accessor: "status",
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
        data={flatData}
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
        data={sentFlatData}
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