import React from "react";
import { Overview } from "../../components/dashboard/Overview";

/**
 * Manager Dashboard Page
 * Shows department-level overview and statistics
 */
export const ManagerDashboardPage: React.FC = () => {
  return <Overview viewMode="manager" />;
};
