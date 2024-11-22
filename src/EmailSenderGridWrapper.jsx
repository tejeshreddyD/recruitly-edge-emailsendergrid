import { useEffect, useState } from "react";
import { Button, Input, message, Popconfirm, Table, Typography } from "antd";
import PropTypes from "prop-types";

import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";

import "./EmailSenderGridWrapper.css";

const { Search } = Input;
const { Text } = Typography;

const EmailSenderGridWrapper = ({ apiServer, apiKey }) => {
  const [rowData, setRowData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsError] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiServer}/api/marketing/senders`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const result = await response.json();
      console.log("API Response Data:", result);

      if (result && result.data) {
        const updatedData = result.data.map((item) => ({
          key: item.id,
          fromName: item.fromName || "N/A",
          fromEmail: item.fromEmail || "N/A",
          replyTo: item.replyToEmail || "N/A",
          createdBy: item.userName || "Unknown",
          createdOn: item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "N/A",
          domainVerified: item.domainVerified !== undefined ? item.domainVerified : false,
          verified: item.senderAuthorised !== undefined ? item.senderAuthorised : false, // Updated to take value from senderAuthorised
        }));
        setRowData(updatedData);
      } else {
        setRowData([]);
      }
      setIsError(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setIsError(true);
      message.error("Failed to load email senders data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiServer, apiKey]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiServer}/api/marketing/senders?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      message.success("Email sender successfully deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting sender: ", error);
      message.error("Failed to delete email sender");
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = rowData.filter((item) =>
    item.fromName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.fromEmail.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      key: "key",
      render: (text, record, index) => index + 1,
    },
    {
      title: "From Name",
      dataIndex: "fromName",
      key: "fromName",
      render: (text) => <span className="from-name-cell">{text}</span>,
      filters: [...new Set(rowData.map((item) => item.fromName))].map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.fromName === value,
    },
    {
      title: "From Email",
      dataIndex: "fromEmail",
      key: "fromEmail",
      render: (text) => <span className="from-email-cell">{text}</span>,
      filters: [...new Set(rowData.map((item) => item.fromEmail))].map((email) => ({
        text: email,
        value: email,
      })),
      onFilter: (value, record) => record.fromEmail === value,
    },
    {
      title: "Reply To",
      dataIndex: "replyTo",
      key: "replyTo",
      render: (text) => <span className="reply-to-cell">{text}</span>,
      filters: [...new Set(rowData.map((item) => item.replyTo))].map((replyTo) => ({
        text: replyTo,
        value: replyTo,
      })),
      onFilter: (value, record) => record.replyTo === value,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => <span className="created-by-cell">{text}</span>,
      filters: [...new Set(rowData.map((item) => item.createdBy))].map((createdBy) => ({
        text: createdBy,
        value: createdBy,
      })),
      onFilter: (value, record) => record.createdBy === value,
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
      render: (text) => <span className="created-on-cell">{text}</span>,
      filters: [...new Set(rowData.map((item) => item.createdOn))].map((createdOn) => ({
        text: createdOn,
        value: createdOn,
      })),
      onFilter: (value, record) => record.createdOn === value,
    },
    {
      title: "Domain Verified",
      dataIndex: "domainVerified",
      key: "domainVerified",
      render: (verified) =>
        verified ? (
          <Text className="verified-text">
            <CheckCircleOutlined /> VERIFIED
          </Text>
        ) : (
          <Text className="not-verified-text">
            <CloseCircleOutlined /> NOT VERIFIED
          </Text>
        ),
      filters: [
        { text: "Verified", value: true },
        { text: "Not Verified", value: false },
      ],
      onFilter: (value, record) => record.domainVerified === value,
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      render: (verified) =>
        verified ? (
          <Text className="verified-text">
            <CheckCircleOutlined /> VERIFIED
          </Text>
        ) : (
          <Text className="not-verified-text">
            <CloseCircleOutlined /> NOT VERIFIED
          </Text>
        ),
      filters: [
        { text: "Verified", value: true },
        { text: "Not Verified", value: false },
      ],
      onFilter: (value, record) => record.verified === value,
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Popconfirm
          placement="leftBottom"
          title="Confirm Delete"
          description={`Delete sender ${record.fromName}?`}
          onConfirm={() => handleDelete(record.key)}
          okText="Yes"
          cancelText="No"
        >
          <Button size="small" icon={<DeleteOutlined />} danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <Search
          placeholder="Search..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginRight: 10 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowClassName={(record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")}
      />
    </div>
  );
};

EmailSenderGridWrapper.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default EmailSenderGridWrapper;
