const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiResponse<T> = {
  data: T;
};

export type BillListItem = {
  id: string;
  title: string;
  shortTitle: string | null;
  billNumber: string | null;
  year: number | null;
  house: string | null;
  ministry: string | null;
  status: string | null;
  introducedDate: string | null;
  source: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type BillStage = {
  id: string;
  billId: string;
  stage: string;
  house: string | null;
  stageDate: string | null;
  description: string | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillVersion = {
  id: string;
  billId: string;
  versionLabel: string;
  versionDate: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  source: string;
  rawSourceData: unknown;
  createdAt: string;
  updatedAt: string;
};

export type BillDetail = BillListItem & {
  rawSourceData: unknown;
  stages: BillStage[];
  versions: BillVersion[];
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T> | {
    error: { message: string; statusCode: number };
  };

  if (!response.ok) {
    const message =
      "error" in payload ? payload.error.message : "Request failed";
    throw new Error(message);
  }

  return (payload as ApiResponse<T>).data;
}

export function getBills() {
  return apiGet<BillListItem[]>("/api/bills");
}

export function getBillById(id: string) {
  return apiGet<BillDetail>(`/api/bills/${id}`);
}

export function getBillTimeline(id: string) {
  return apiGet<BillStage[]>(`/api/bills/${id}/timeline`);
}

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResult = {
  user: AuthUser;
  token: string;
};

export type FollowRecord = {
  id: string;
  userId: string;
  billId: string;
  createdAt: string;
  bill: BillListItem;
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T> | {
    error: { message: string; statusCode: number };
  };

  if (!response.ok) {
    const message =
      "error" in payload ? payload.error.message : "Request failed";
    throw new Error(message);
  }

  return (payload as ApiResponse<T>).data;
}

export function loginUser(input: { email: string; password: string }) {
  return apiRequest<AuthResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe(token: string) {
  return apiRequest<AuthUser>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getMyFollows(token: string) {
  return apiRequest<FollowRecord[]>("/api/me/follows", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function followBill(id: string, token: string) {
  return apiRequest<FollowRecord>(`/api/bills/${id}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function unfollowBill(id: string, token: string) {
  return apiRequest<{ unfollowed: boolean }>(`/api/bills/${id}/follow`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}