export const API_BASE_URL = 'https://lx0esccnxg.execute-api.us-east-1.amazonaws.com/prod';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/products`,
  salesUpload: `${API_BASE_URL}/api/sales/upload`,
  sales: (productId: string) => `${API_BASE_URL}/api/sales/${productId}`,
  forecastsGenerate: `${API_BASE_URL}/api/forecasts/generate`,
  forecasts: (productId: string) => `${API_BASE_URL}/api/forecasts/${productId}`,
  inventory: `${API_BASE_URL}/api/inventory`,
  inventoryUpdate: (productId: string) => `${API_BASE_URL}/api/inventory/${productId}`,
  inventoryAlerts: `${API_BASE_URL}/api/inventory/alerts`
};
