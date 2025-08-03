import { createHashRouter } from "react-router-dom";

import { Layout } from "@/components/Layout";
import SettingsPage from "@/pages/settings";
import ChatPage from "@/pages/chat";
import HistoryPage from "@/pages/HistoryPage";
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
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "documents",
        element: <ChatPage />,
      },
      {
        path: "downloads",
        element: <ChatPage />,
      },
      {
        path: "picture",
        element: <ChatPage />,
      },
      {
        path: "movies",
        element: <ChatPage />,
      },
      {
        path: "music",
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
