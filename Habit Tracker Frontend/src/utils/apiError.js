/**
 * Extract user-friendly error message from API error response.
 * Handles: { error }, { message }, validation { errors }, and generic fallback.
 */
export function getApiErrorMessage(error) {
  try {
    if (error == null) return 'Something went wrong. Please try again.';
    if (typeof error === 'string') return error;
    
    // Network / timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request took too long. Please check your connection and try again.';
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return error?.message || 'Network error. Please check your connection and try again.';
    }
    
    // API response errors
    const response = error.response;
    if (!response) return 'An unexpected error occurred.';
    
    const data = response.data;
    if (!data) return `Server error: ${response.status || 'Unknown'}`;
    
    // Check for different error message formats
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.title === 'string') return data.title;
    
    // Validation errors
    if (data.errors && typeof data.errors === 'object') {
      const parts = Object.entries(data.errors)
        .map(([k, v]) => (Array.isArray(v) ? v.join(' ') : String(v)))
        .filter(Boolean);
      return parts.length ? parts.join('. ') : 'Validation failed.';
    }
    
    // ASP.NET Core validation errors
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(e => e.description || e.errorMessage).join('. ');
    }
    
    return 'An unexpected error occurred.';
  } catch (err) {
    console.error('Error in getApiErrorMessage:', err);
    return 'An unexpected error occurred.';
  }
}
