
import { OnlineMeetingDetails, CreateOnlineMeetingRequest } from "../types/onlineMeeting.types";

export const onlineMeetingService = {
    getMeetings: async (): Promise<OnlineMeetingDetails[]> => {
        return [];
    },
    createMeeting: async (data: CreateOnlineMeetingRequest) => {
        return { success: true };
    },
    deleteMeeting: async (id: string) => {
        return { success: true };
    }
};
