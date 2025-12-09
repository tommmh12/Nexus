import React from "react";
import { ProjectModule } from "../../components/projects/ProjectModule";
import { getPermissions } from "../../utils/permissions";

/**
 * Manager Projects Page
 * Can manage projects in own department only
 */
export const ManagerProjectsPage: React.FC = () => {
  const permissions = getPermissions("department-manager");

  return (
    <ProjectModule
      permissions={permissions}
      viewMode="department" // Manager sees department projects only
    />
  );
};
