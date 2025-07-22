import { createHashRouter } from "react-router-dom";

import { Layout } from "@/components/Layout";
import SettingsPage from "@/pages/settings";
import HomePage from "@/pages/home";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
