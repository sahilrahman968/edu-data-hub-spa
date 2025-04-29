
import { toast } from "@/components/ui/sonner";

const BASE_URL = "http://localhost:3001";

export interface ApiResponse<T = any> {
  msg?: string;
  token?: string;
  [key: string]: any;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || "An error occurred");
  }
  return response.json();
};

export const signup = async (id: string, name: string, email: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/teachers/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, email, password }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/teachers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getBoards = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/boards`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const createBoard = async (id: string, name: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/board/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const getClasses = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/classes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const createClass = async (id: string, name: string, boardId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/class/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name, boardId }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const getSubjects = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/subjects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const createSubject = async (id: string, name: string, classId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/subject/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name, classId }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const getChapters = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/chapters`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const createChapter = async (id: string, name: string, subjectId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/chapter/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name, subjectId }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const getTopics = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/topics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};

export const createTopic = async (id: string, name: string, chapterId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/topic/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name, chapterId }),
    });
    return handleResponse<ApiResponse>(response);
  } catch (error: any) {
    toast.error(error.message);
    throw error;
  }
};
