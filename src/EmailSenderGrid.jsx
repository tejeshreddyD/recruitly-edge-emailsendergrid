import { useEffect, useState } from "react";
import { Button, Input, message, Popconfirm, Table, Tag } from "antd";
import PropTypes from "prop-types";
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons";

import "./styles.css";

const { Search } = Input;

const EmailSenderGrid = ({ apiServer, apiKey }) => {
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
          createdOn: item.createdOn
            ? new Date(item.createdOn).toLocaleDateString()
            : "N/A",
          domainVerified:
            item.domainVerified !== undefined ? item.domainVerified : false,
          verified:
            item.senderAuthorised !== undefined
              ? item.senderAuthorised
              : false, // Updated to take value from senderAuthorised
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


    const handleSenderUpdate = (event) => {
      console.log("EDGE_SENDER_UPDATED event received:", event.detail);
      fetchData();
    };

    window.addEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);


    return () => {
      window.removeEventListener("EDGE_SENDER_UPDATED", handleSenderUpdate);
    };
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

  const filteredData = rowData.filter(
    (item) =>
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
    },
    {
      title: "From Email",
      dataIndex: "fromEmail",
      key: "fromEmail",
      render: (text) => <span className="from-email-cell">{text}</span>,
    },
    {
      title: "Reply To",
      dataIndex: "replyTo",
      key: "replyTo",
      render: (text) => <span className="reply-to-cell">{text}</span>,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => <span className="created-by-cell">{text}</span>,
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      key: "createdOn",
      render: (text) => <span className="created-on-cell">{text}</span>,
    },
    {
      title: "Domain Verified",
      dataIndex: "domainVerified",
      key: "domainVerified",
      render: (verified) =>
        verified ? (
          <Tag
            bordered={false}
            icon={<CheckCircleOutlined />}
            color="darkgreen"
          >
            VERIFIED
          </Tag>
        ) : (
          <Tag bordered={false} icon={<CloseCircleOutlined />} color="darkred">
            NOT VERIFIED
          </Tag>
        ),
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      render: (verified) =>
        verified ? (
          <Tag
            bordered={false}
            icon={<CheckCircleOutlined />}
            color="darkgreen"
          >
            VERIFIED
          </Tag>
        ) : (
          <Tag bordered={false} icon={<CloseCircleOutlined />} color="darkred">
            NOT VERIFIED
          </Tag>
        ),
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
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Search
          placeholder="Search..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginRight: 10 }}
        />
      </div>
      <Table
        bordered={true}
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowClassName={"table-row-light"}
      />
    </div>
  );
};

EmailSenderGrid.propTypes = {
  apiServer: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export default EmailSenderGrid;
