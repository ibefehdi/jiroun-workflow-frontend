import React, { Fragment, useEffect, useState } from "react"
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
import "./TableContainer.css"
// Define a default UI for filtering
const Container = ({
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
    <Fragment className="table-container">
      <div className="table-responsive react-table">
        <Table bordered hover {...getTableProps()} className={`modern-table ${className}`}>
          <thead className="table-light table-nowrap">
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th key={column.id}>
                    <div className="mb-2" {...column.getSortByToggleProps()}>
                      {column.render("Header")}
                      {generateSortingIndicator(column)}
                    </div>

                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row)
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr>
                    {row.cells.map(cell => {
                      return (
                        <td key={cell.id} {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </td>
                      )
                    })}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </Table>

      </div>

      {isFooter ? (
        <tfoot>
          {footerGroups.map(group => {
            return (
              <Fragment key={group.getFooterGroupProps().key}>
                <tr key={group.id} {...group.getFooterGroupProps()}>
                  {group.headers.map(column => {
                    return (
                      <td key={group.id} {...column.getFooterProps()}>
                        {column.render("Footer")}
                      </td>
                    )
                  })}
                </tr>
              </Fragment>
            )
          })}
        </tfoot>
      ) : (
        <Row className="justify-content-md-end justify-content-center align-items-center">
          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button
                color="primary" className="pagination-button"
                onClick={() => {
                  localStorage.setItem("pageIndex", 0)
                  gotoPage(Number(localStorage.getItem("pageIndex")))
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
                  )
                  gotoPage(Number(localStorage.getItem("pageIndex")))
                }}
                disabled={
                  Number(localStorage.getItem("pageIndex")) === 0 ? true : false
                }
              >
                {"Previous"}
              </Button>
            </div>
          </Col>
          <Col className="col-md-auto d-none d-md-block">
            Page{" "}
            <strong>
              {locallyStoredPageIndex + 1} of {pageOptions.length}
            </strong>
          </Col>
          <Col className="col-md-auto">
            <Input
              type="number"
              min={1}
              style={{ width: 70 }}
              max={pageOptions.length}
              defaultValue={parseInt(localStorage.getItem("pageIndex")) + 1}
              onChange={onChangeInInput}
            />
          </Col>

          <Col className="col-md-auto">
            <div className="d-flex gap-1">
              <Button
                color="primary" className="pagination-button"
                onClick={() => {
                  localStorage.setItem(
                    "pageIndex",
                    Number(localStorage.getItem("pageIndex")) + 1
                  )
                  gotoPage(Number(localStorage.getItem("pageIndex")))
                }}
                disabled={!canNextPage}
              >
                {"Next"}
              </Button>
              <Button
                color="primary" className="pagination-button"
                onClick={() => {
                  localStorage.setItem("pageIndex", pageCount - 1)
                  gotoPage(Number(localStorage.getItem("pageIndex")))
                }}
                disabled={!canNextPage}
              >
                {"Last"}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Fragment>
  )
}

Container.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
}

export default Container