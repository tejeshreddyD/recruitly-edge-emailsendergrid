
import { ConfigProvider } from "antd";

import styleToken from "./styleToken.js";
import EmailSenderGrid from "./EmailSenderGrid.jsx";



const EmailSenderGridWithProvider = (props) => (
  <ConfigProvider theme={styleToken}>
    <EmailSenderGrid {...props} />
  </ConfigProvider>
);

const EmailSenderGridWrapper = ({ apiServer, apiKey, edgeUtil, userId, tenantId }) => {

  return (
    <EmailSenderGridWithProvider
      {...{
        apiServer,
        apiKey,
        edgeUtil,
        userId,
        tenantId,
      }}
    />
  );
};

window.EmailSenderGrid = EmailSenderGridWithProvider;

export default EmailSenderGridWrapper;
