import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import debounce from "lodash/debounce";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button, Input } from "antd";
import "./styles.css";

const { Search } = Input;

const EmailSenderGrid = ({ apiServer, apiKey }) => {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [gridHeight, setGridHeight] = useState(500);
  const containerRef = useRef(null);


  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiServer}/api/marketing/senders`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.data) {
        const updatedData = result.data.map((item) => ({
          key: item.id,
          id: item.id,
          fromName: item.fromName || "N/A",
          fromEmail: item.fromEmail || "N/A",
          replyTo: item.replyToEmail || "N/A",
          createdBy: item.userName || "Unknown",
          createdOn: item.createdOn
            ? new Date(item.createdOn).toLocaleDateString()
            : "N/A",
          domainVerified: item.domainVerified ?? false,
          verified: item.senderAuthorised ?? false,
        }));
        setRowData(updatedData);
      } else {
        setRowData([]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      alert("Failed to load email senders data");
    } finally {
      setIsLoading(false);
    }
  };


  const calculateHeight = () => {
    if (containerRef.current) {
      const offsetTop = containerRef.current.getBoundingClientRect().top;
      const calculatedHeight = window.innerHeight - offsetTop - 110;
      setGridHeight(Math.max(calculatedHeight, 400));
    }
  };

  // Recalculate height on window resize
  useEffect(() => {
    calculateHeight();
    const handleResize = () => calculateHeight();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(() => {
    fetchData();

    const handleSenderUpdate = (event) => {
      console.log("EDGE_SENDER_UPDATED event received:", event.detail);
      fetchData();
    };

    window.addEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);

    const debouncedUpdate = debounce(calculateHeight, 100);
    calculateHeight();
    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [apiServer, apiKey]);


  const handleEdit = async (sender) => {
    try {
      console.log("Sender object:", sender);
      await window.EDGE_UTIL.senderAction({
        actionCode: "EDIT_SENDER",
        paramsObj: { sender: sender },
      });
    } catch (error) {
      console.error("Error opening sender form for editing:", error);
    }
  };


  const handleDelete = async (sender) => {
    try {
      console.log("Sender object:", sender);
      await window.EDGE_UTIL.senderAction({
        actionCode: "DELETE_SENDER",
        paramsObj: { sender: sender },
      });
    } catch (error) {
      console.error("Error deleting sender:", error);
    }
  };


  const onQuickFilterChange = (value) => {
    setSearchText(value);
  };


  const filteredData = useMemo(() => {
    return rowData.filter(
      (item) =>
        item.fromName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.fromEmail.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [rowData, searchText]);


  const columnDefs = useMemo(
    () => [
      {
        headerName: "#",
        valueGetter: "node.rowIndex + 1",
        flex: 1,
        sortable: false,
        width: 60,
      },
      {
        headerName: "From Name",
        field: "fromName",
        flex: 1,
        cellRenderer: (params) => {
          return (
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => handleEdit(params.data)}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "From Email",
        field: "fromEmail",
        flex: 1,
      },
      {
        headerName: "Reply To",
        field: "replyTo",
        flex: 1,
      },
      {
        headerName: "Created By",
        field: "createdBy",
        flex: 1,
      },
      {
        headerName: "Created On",
        field: "createdOn",
        flex: 1,
      },
      {
        headerName: "Domain Verified",
        field: "domainVerified",
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? (
            <div className="ag-custom-tag verified">Verified</div>
          ) : (
            <div className="ag-custom-tag not-verified">Not Verified</div>
          );
        },
      },
      {
        headerName: "Verified",
        field: "verified",
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? (
            <div className="ag-custom-tag verified">Verified</div>
          ) : (
            <div className="ag-custom-tag not-verified">Not Verified</div>
          );
        },
      },
      {
        headerName: "Action",
        cellRenderer: (params) => (
          <button
            className="delete-button"
            onClick={() => handleDelete(params.data)}
          >
            Delete
          </button>
        ),
        width: 120,
      },
    ],
    []
  );

  return (
    <div ref={containerRef} style={{ height: "100vh", width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", padding: "15px" }}
        >
          <Search
            size={"middle"}
            placeholder="Search..."
            allowClear
            onSearch={onQuickFilterChange}
            style={{ width: "250px" }}
          />
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{ height: gridHeight, width: "100%" }}
            className="ag-theme-quartz"
          >
            <AgGridReact
              ref={containerRef}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, resizable: true }}
              rowHeight={50}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EmailSenderGrid.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default EmailSenderGrid;
