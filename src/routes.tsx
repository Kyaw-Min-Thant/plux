import { createHashRouter } from "react-router-dom";

import { Layout } from "@/components/Layout";
import SettingsPage from "@/pages/settings";
import ChatPage from "@/pages/chat";
import DXTPage from "@/pages/dxt";
import DXTDetail from "@/pages/DxtDetail";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "dxt",
        element: <DXTPage />,
      },
      {
        path: "dxt/:user/:repo",
        element: <DXTDetail />,
      },
    ],
  },
]);
