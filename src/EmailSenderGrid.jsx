import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, message, Popconfirm, Table, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import "./styles.css";

const { Search } = Input;

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
          key:item.id,
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
      message.success(`Opened form to edit sender "${sender.fromName}".`);
    } catch (error) {
      console.error("Error opening sender form for editing:", error);
      message.error(`Failed to open sender form for "${sender?.fromName || "Unknown"}".`);
    }
  };

  const handleDelete = async (sender) => {
    try {
      console.log("Sender object:", sender);
      await window.EDGE_UTIL.senderAction({
        actionCode: "DELETE_SENDER",
        paramsObj: { sender : sender },
      });
      message.success(`Email sender "${sender.fromName}" successfully deleted.`);
      fetchData();
    } catch (error) {
      console.error("Error deleting sender:", error);
      message.error(`Failed to delete email sender: "${sender?.fromName || "Unknown"}"`);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = rowData.filter(
    (item) =>
      item.fromName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.fromEmail.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "From Name",
      dataIndex: "fromName",
      key: "fromName",
      render: (text, record) => (
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => handleEdit(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "From Email",
      dataIndex: "fromEmail",
      key: "fromEmail",
    },
    {
      title: "Reply To",
      dataIndex: "replyTo",
      key: "replyTo",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
    },
    {
      title: "Domain Verified",
      dataIndex: "domainVerified",
      key: "domainVerified",
      render: (verified) =>
        verified ? (
          <Tag icon={<CheckCircleOutlined />} style={{borderRadius:'15px'}} color="#11a75c">
            Verified
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} style={{borderRadius:'15px'}} color="#ab0a00">
            Not Verified
          </Tag>
        ),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      render: (verified) =>
        verified ? (
          <Tag icon={<CheckCircleOutlined />} style={{borderRadius:'15px'}} color="#11a75c">Verified
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} style={{borderRadius:'15px'}} color="#ab0a00">Not Verified
          </Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          size={"small"}
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record)}
        >
          Delete
        </Button>
      ),
    },
    ]

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Search
          placeholder="Search..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowClassName="table-row-light"
      />
    </div>
  );
};

EmailSenderGrid.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default EmailSenderGrid;
