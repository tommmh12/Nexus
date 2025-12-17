/**
 * Application Policies
 * 
 * Centralized authorization logic for all resources.
 * Import from here instead of individual policy files.
 */

export * as ProjectPolicy from "./ProjectPolicy.js";
export * as TaskPolicy from "./TaskPolicy.js";
export * as MeetingPolicy from "./MeetingPolicy.js";
export * as BookingPolicy from "./BookingPolicy.js";
export * as ForumPolicy from "./ForumPolicy.js";
export * as NewsPolicy from "./NewsPolicy.js";

// Re-export middleware factories for convenience
export { requireProjectPermission } from "./ProjectPolicy.js";
export { requireTaskPermission, requireTaskCreatePermission } from "./TaskPolicy.js";
export { requireMeetingPermission } from "./MeetingPolicy.js";
export { requireBookingPermission } from "./BookingPolicy.js";
export { requireForumPermission } from "./ForumPolicy.js";
export { requireNewsPermission, requireNewsCreatePermission, requireDepartmentAccessPermission } from "./NewsPolicy.js";
