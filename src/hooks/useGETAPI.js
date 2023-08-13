import { useState, useRef, useCallback } from "react"

export const useGETAPI = (getAPI, url, status, listField = "data") => {
  const [pageCount, setPageCount] = useState(0)
  const [totalDataCount, setTotalDataCount] = useState(0)
  const [data, setData] = useState([])
  const [loadStatus, setLoadStatus] = useState(false)
  const fetchIdRef = useRef(0)
  const fetchData = useCallback(
    ({
      pageSize,
      pageIndex,
      searchTerm = "",
      searchType = "",
      extraFilter = {},
      recordId = "",
    }) => {
      const fetchId = ++fetchIdRef.current
      if (fetchId === fetchIdRef.current) {
        let optionalParams = {}
        if (searchType?.length > 0 && searchTerm?.length > 0) {
          optionalParams = {
            search: searchTerm ? searchTerm : null,
            searchType: searchType,
          }
        }
        if (Object.keys(extraFilter).length !== 0) {
          optionalParams = {
            ...optionalParams,
            ...extraFilter,
          }
        }
        setLoadStatus(true)
        getAPI(`${url}${recordId ? "/" + recordId : ""}`, {
          method: "GET",
          params: {
            page: pageIndex ? pageIndex + 1 : 1,
            resultsPerPage: pageSize ? pageSize : 10,
            // sort: "asc",
            ...optionalParams,
            // status: status ? status : null,
          },
        })
          .then(res => {
            if (
              typeof res.data[listField] == "object" ||
              typeof res.data[listField] == "Array"
            ) {
              setData(res.data[listField])
            } else {
              setData([])
            }
            setLoadStatus(false)
            res.data.count && setPageCount(Math.ceil(res.data.count / pageSize))
            res.data.count && setTotalDataCount(res.data.count)

            //For Logisitcs Dashboard Pagination
            res.data.metadata?.total &&
              setPageCount(Math.ceil(res.data.metadata.total / pageSize))
            res.data.metadata?.total &&
              setTotalDataCount(res.data.metadata.total)
          })
          .catch(error => {
            console.log("Error in useGETApi Hook.", error)
            setLoadStatus(false)
          })
      }
    },
    [getAPI, listField, url]
  )
  return { data, fetchData, pageCount, totalDataCount, loadStatus }
}