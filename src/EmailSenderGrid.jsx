import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./styles.css";

const EmailSenderGrid = ({ apiServer, apiKey }) => {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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
          createdOn: item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "N/A",
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

  useEffect(() => {
    fetchData();

    const handleSenderUpdate = (event) => {
      console.log("EDGE_SENDER_UPDATED event received:", event.detail);
      fetchData();
    };

    window.addEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);

    return () => {
      window.removeEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);
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

  const handleSearch = (e) => {
    setSearchText(e.target.value);
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
            <div className="ag-custom-tag verified">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
              </svg>
              Verified
            </div>
          ) : (
            <div className="ag-custom-tag not-verified">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Not Verified
            </div>
          );
        },
      },
      {
        headerName: "Verified",
        field: "verified",
        flex: 1,
        cellRenderer: (params) => {
          return params.value ? (
            <div className="ag-custom-tag verified">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z" />
              </svg>
              Verified
            </div>
          ) : (
            <div className="ag-custom-tag not-verified">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Not Verified
            </div>
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
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={handleSearch}
          style={{ width: "300px", padding: "5px" }}
        />
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: "500px", width: "100%",overflow: "hidden"  }}
      >
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true,  resizable: true }}
          rowHeight={50}
          loadingOverlayComponentParams={{
            loadingMessage: "Loading data...",
          }}
        />
      </div>
    </div>
  );
};

EmailSenderGrid.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default EmailSenderGrid;
