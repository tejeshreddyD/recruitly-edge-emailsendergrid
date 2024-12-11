import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import debounce from "lodash/debounce";
import "./styles.css";
import { RECRUITLY_AGGRID_LICENSE, RECRUITLY_AGGRID_THEME } from "@constants";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { LicenseManager } from "ag-grid-enterprise";
import { Button, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";



const { Search } = Input;

LicenseManager.setLicenseKey(RECRUITLY_AGGRID_LICENSE);

const EmailSenderGrid = ({ apiServer, apiKey }) => {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [gridHeight, setGridHeight] = useState(500);
  const containerRef = useRef(null);
  const gridRef = useRef(null);


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
      const calculated_height = window.innerHeight - offsetTop - 110;

      setGridHeight(calculated_height);
    }
  };

  useEffect(() => {
    const debouncedUpdate = debounce(calculateHeight, 100);
    debouncedUpdate();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
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
        pinned:'left',
        resizable:false,
        suppressMenu: true,
        width: 50,
        minWidth: 50


      },
      {
        headerName: "From Name",
        field: "fromName",
        suppressMenu: true,
        flex: 1,
        width: 150,
        minWidth: 200,
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
        suppressMenu: true,
        flex: 1,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: "Reply To",
        field: "replyTo",
        suppressMenu: true,
        flex: 1,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: "Created By",
        field: "createdBy",
        suppressMenu: true,
        flex: 1,
        width: 150,
        minWidth: 200,
      },
      {
        headerName: "Created On",
        field: "createdOn",
        suppressMenu: true,
        flex: 1,
        width: 150,
        minWidth: 200,
      },
      {
        headerName: "Domain Verified",
        field: "domainVerified",
        sortable: false,
        suppressMenu: true,
        flex: 1,
        width: 150,
        minWidth: 200,
        cellRenderer: (params) => {
          return params.value ? (
            <Tag style={{borderRadius:'15px'}} color="#11a75c" icon={<CheckCircleOutlined />}>
              Verified
            </Tag>
          ) : (
            <Tag style={{borderRadius:'15px'}} color="#ab0a00" icon={<CloseCircleOutlined />}>
              Not Verified
            </Tag>
          );
        },
      },
      {
        headerName: "Verified",
        field: "verified",
        flex: 1,
        width: 150,
        minWidth: 200,
        suppressMenu: true,
        sortable: false,
        cellRenderer: (params) => {
          return params.value ? (
            <Tag style={{borderRadius:'15px'}} color="#11a75c" icon={<CheckCircleOutlined />}>
              Verified
            </Tag>
          ) : (
            <Tag style={{borderRadius:'15px'}} color="#ab0a00" icon={<CloseCircleOutlined />}>
              Not Verified
            </Tag>
          );
        },
      },

      {
        headerName: "Action",
        cellRenderer: (params) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Button
              type="default"
              size="small"
              danger
              ghost
              icon={<DeleteOutlined style={{ fontSize: "12px" }} />}
              onClick={() => handleDelete(params.data)}
            >
              Delete
            </Button>
          </div>
        ),
        pinned: "right",
        resizable: false,
        sortable: false,
        suppressMenu: true,
        width: 120,
        minWidth: 120,
      },


    ],
    []
  );

  return (
    <div style={{ height: "100vh", width: "100%"}}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",

        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between",paddingLeft:'15px',paddingRight:'15px',paddingTop:'15px'}}
        >
          <Search
            size={"middle"}
            placeholder="Search..."
            allowClear
            onSearch={onQuickFilterChange}
            style={{ width: "250px" }}
          />
        </div>
        <div ref={containerRef} style={{ height: gridHeight, width: "100%",padding:'15px' }}
             className="ag-theme-quartz"
        >
          <AgGridReact
            theme={RECRUITLY_AGGRID_THEME}
            ref={gridRef}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, resizable: true }}
            rowHeight={50}
            enableColumnMove={false}
            loading={isLoading}
            suppressContextMenu={true}


          />
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
