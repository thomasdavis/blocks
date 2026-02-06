export interface ApiRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface PaginationOptions {
  page?: number;
  per_page?: number;
}

/**
 * GET /users endpoint handler
 *
 * Returns a paginated list of users. Validates query parameters
 * and returns structured error responses for invalid input.
 */
export function getUsers(request: ApiRequest, options?: PaginationOptions): ApiResponse {
  const page = options?.page ?? 1;
  const perPage = options?.per_page ?? 20;

  if (page < 1 || perPage < 1 || perPage > 100) {
    return {
      status: 400,
      headers: { "content-type": "application/json" },
      body: {
        error: "invalid_parameters",
        message: "page must be >= 1, per_page must be between 1 and 100",
      },
    };
  }

  // In a real app this would query a database
  const users = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: {
      data: users,
      pagination: {
        page,
        per_page: perPage,
        total: users.length,
        total_pages: Math.ceil(users.length / perPage),
      },
    },
  };
}
