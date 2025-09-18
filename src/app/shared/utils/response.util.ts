export function handleResponse<T = any>(response: any): T {
  if (response && typeof response === 'object') {
    // Handle paginated responses
    if (response.results !== undefined) {
      return response.results as T;
    }
    // Handle wrapped responses
    if (response.data !== undefined) {
      return response.data as T;
    }
    // Return the response as-is
    return response as T;
  }
  return response as T;
}