import React from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import { Table, Button } from 'reactstrap';

const TableContainer = ({ data, columns,onEdit  }) => {
  data = data || [];
  columns = columns || [];
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  const generateSortingIndicator = column => {
    return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""
  }

  return (
    <>
      <div className="table-responsive react-table">
        <Table bordered hover {...getTableProps()}>
          <thead className="table-light table-nowrap">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    <div {...column.getSortByToggleProps()}>
                      {column.render('Header')}
                      {generateSortingIndicator(column)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
        <div className="p-2">
          <Button color="primary" onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </Button>
        </div>
        <div className="p-2">
          Page{' '}
          {pageIndex + 1} of {pageOptions.length}
        </div>
        <div className="p-2">
          <Button color="primary" onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </Button>
        </div>
      </div>

    </>
  );
};

export default TableContainer;
