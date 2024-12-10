import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button, Input, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./styles.css";

const { Search } = Input;

const EmailSenderGrid = ({ apiServer, apiKey }) => {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 80); // Initial height
  const containerRef = useRef(null);


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
      message.error("Failed to load email senders data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiServer, apiKey]);

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
        maxWidth: 70,
      },
      {
        headerName: "From Name",
        field: "fromName",
        flex: 1,
      },
      { headerName: "From Email", field: "fromEmail", flex: 1 },
      { headerName: "Reply To", field: "replyTo", flex: 1 },
      { headerName: "Created By", field: "createdBy", flex: 1 },
      { headerName: "Created On", field: "createdOn", flex: 1 },
      {
        headerName: "Domain Verified",
        field: "domainVerified",
        cellRenderer: ({ value }) =>
          value ? (
            <span className="tag-verified">
              <CheckCircleOutlined /> Verified
            </span>
          ) : (
            <span className="tag-not-verified">
              <CloseCircleOutlined /> Not Verified
            </span>
          ),
        flex: 1,
      },
      {
        headerName: "Verified",
        field: "verified",
        cellRenderer: ({ value }) =>
          value ? (
            <span className="tag-verified">
              <CheckCircleOutlined /> Verified
            </span>
          ) : (
            <span className="tag-not-verified">
              <CloseCircleOutlined /> Not Verified
            </span>
          ),
        flex: 1,
      },
      {
        headerName: "Action",
        cellRenderer: ({ data }) => (
          <Button
            size={"small"}
            icon={<DeleteOutlined />}
            danger
          >
            Delete
          </Button>
        ),
        flex: 1,
      },
    ],
    []
  );

  return (
    <div ref={containerRef} style={{ padding: "20px", overflow: "hidden" }}>
      <div style={{ marginBottom: "20px" }}>
        <Search
          placeholder="Search..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <div
        className="ag-theme-quartz"
        style={{
          height: gridHeight,
          width: "100%",
        }}
      >
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          domLayout="autoHeight"
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
