import React, { Fragment, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
} from "react-table"
import { Table, Row, Col, Button, Input } from "reactstrap"
import { Filter, DefaultColumnFilter } from "./filters"
import _ from "lodash"
import { useHistory } from "react-router-dom/cjs/react-router-dom.min"
import "./ScrollableList.css"
// Define a default UI for filtering
const TableContainer = ({
  columns,
  refresh,
  data,
  fetchData,
  fetchDataV1,
  isGlobalFilter,
  pageCount: controlledPageCount,
  totalDataCount,
  extraFilter,
  isAddOptions,
  isAddUserList,
  handleOrderClicks,
  handleUserClick,
  handleCustomerClick,
  isAddCustList,
  className,
  customPageSize,
  customPageSizeOptions,
  isFooter,
  isNewOrderTable,
  enableShowRecords = true, // allows user to choose how many records to show on page
  enableSearch = true,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    footerGroups,
    setHiddenColumns,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
        // sortBy: [
        //   {
        //     desc: false
        //     ,
        //   },
        // ],
      },
      autoResetPage: false,
      manualPagination: true,
      pageCount: controlledPageCount || 1,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination
  )

  const history = useHistory()
  const [currentHistoryPath, setCurrentHistoryPath] = useState("")
  const [locallyStoredPageIndex, setLocallyStoredPageIndex] = useState(0)
  const [searchTerm, setSearchTerm] = useState(null)
  const [searchType, setSearchType] = useState("")
  const generateSortingIndicator = column => {
    return column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""
  }

  const onChangeInSelect = event => {
    setPageSize(Number(event.target.value))
  }
  const listRef = useRef(null);

  useEffect(() => {
      const handleScroll = () => {
          if (
              listRef.current &&
              listRef.current.offsetHeight + listRef.current.scrollTop >= listRef.current.scrollHeight
          ) {
              if (canNextPage) {
                  gotoPage(pageIndex + 1);
              }
          }
      };

      listRef.current.addEventListener('scroll', handleScroll);
      return () => listRef.current.removeEventListener('scroll', handleScroll);
  }, [pageIndex, canNextPage]);
  const onChangeInInput = event => {
    const page = event.target.value ? Number(event.target.value) - 1 : 0
    localStorage.setItem("pageIndex", page)
    gotoPage(Number(localStorage.getItem("pageIndex")))
  }

  const _handleSearch = _.debounce(
    search => {
      setSearchTerm(search)
      gotoPage(0)
    },
    1500,
    {
      maxWait: 300,
    }
  )

  useEffect(() => {
    setHiddenColumns(
      columns
        .filter(column => column.isVisible === false)
        .map(column => column.accessor)
    )
  }, [setHiddenColumns, columns])

  useEffect(() => {
    if (localStorage.getItem("pageIndex")) {
      fetchDataV1 &&
        fetchDataV1(
          pageSize,
          Number(localStorage.getItem("pageIndex")),
          searchTerm,
          searchType
        )
    }
  }, [fetchDataV1, pageIndex, pageSize, searchTerm, searchType])

  useEffect(() => {
    setCurrentHistoryPath(history.location.pathname)
  }, [])

  useEffect(() => {
    if (
      history.action === "PUSH" &&
      history.location.pathname !== currentHistoryPath
    ) {
      localStorage.setItem("pageIndex", 0)
    }
  }, [])

  useEffect(() => {
    setLocallyStoredPageIndex(Number(localStorage.getItem("pageIndex")))
  }, [localStorage.getItem("pageIndex")])

  // useEffect(() => {
  //   data.length === 0 && gotoPage(0) // whenever the data gets updated force user to first page
  // }, [data])

  useEffect(() => {
    const val = parseInt(localStorage.getItem("pageIndex"))
      // I have renamed my fetchData to fetchDataV1 to avoid name clash
      ; (fetchData || refresh) &&
        fetchData({
          pageIndex: val,
          // ...(!(searchTerm && searchType) && { pageIndex: val }),
          pageSize,
          searchTerm,
          searchType,
          extraFilter,
        })
  }, [
    fetchData,
    pageIndex,
    pageSize,
    searchTerm,
    searchType,
    extraFilter,
    refresh,
  ])

  return (
    <Fragment className="list-container">
      <div className="table-responsive react-table">
        <div ref={listRef} className="scrollable-list">
          {page.map(row => {
            prepareRow(row);
            return (
              <div className="list-item" key={row.getRowProps().key}>
                {row.cells.map(cell => (
                  <div key={cell.id} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {isFooter ? (
          <Row className="justify-content-md-end justify-content-center align-items-center">
            <Col className="col-md-auto">
              <div className="d-flex gap-1">
                <Button
                  color="primary" className="pagination-button"
                  onClick={() => {
                    localStorage.setItem("pageIndex", 0);
                    gotoPage(Number(localStorage.getItem("pageIndex")));
                  }}
                  disabled={!canPreviousPage}
                >
                  {"First"}
                </Button>
                <Button
                  color="primary" className="pagination-button"
                  onClick={() => {
                    localStorage.setItem(
                      "pageIndex",
                      Number(localStorage.getItem("pageIndex")) - 1
                    );
                    gotoPage(Number(localStorage.getItem("pageIndex")));
                  }}
                  disabled={
                    Number(localStorage.getItem("pageIndex")) === 0 ? true : false
                  }
                >
                  {"Previous"}
                </Button>
              </div>
            </Col>
            {/* ... Rest of the footer, if needed ... */}
          </Row>
        ) : null}
      </div>
    </Fragment>
  );
}

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
}

export default TableContainer