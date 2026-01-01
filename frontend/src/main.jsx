// import "@ant-design/v5-patch-for-react-19";
import { createRoot } from "react-dom/client";
import "./styles/variables.css";

import "./index.css";
import App from "./App.jsx";
import theme from "../theme.json";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/userContext";

createRoot(document.getElementById("root")).render(
  // <ConfigProvider theme={theme}>
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
  // </ConfigProvider>
);
