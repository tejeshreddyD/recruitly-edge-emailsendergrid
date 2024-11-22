import React from "react";
import EmailSenderGridWrapper from "./EmailSenderGridWrapper.jsx";

const App = ({
               apiServer = "https://api.edge.recruitly.io",
               apiKey = "HIRE61360F7E79E6D3834958B12773FBAA334EE1"
             }) => {
  return <EmailSenderGridWrapper apiServer={apiServer} apiKey={apiKey} />;
};

export default App;

