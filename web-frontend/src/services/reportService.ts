import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface ProjectReport {
  id: string;
  projectId: string; // Changed from number to string (UUID)
  department: string;
  title: string;
  content: string;
  submittedBy: string;
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback?: string;
  attachments?: {
    name: string;
    url: string;
    date: string;
    type: "file" | "image";
    source: string;
    uploader: string;
  }[];
}

export const reportService = {
  getReportsByProject: async (projectId: string): Promise<ProjectReport[]> => {
    const response = await axios.get(
      `${API_URL}/reports/project/${projectId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  createReport: async (
    reportData: Partial<ProjectReport>
  ): Promise<ProjectReport> => {
    const response = await axios.post(`${API_URL}/reports`, reportData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  reviewReport: async (
    reportId: string,
    status: "Approved" | "Rejected",
    feedback: string
  ): Promise<ProjectReport> => {
    const response = await axios.patch(
      `${API_URL}/reports/${reportId}/review`,
      { status, feedback },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
