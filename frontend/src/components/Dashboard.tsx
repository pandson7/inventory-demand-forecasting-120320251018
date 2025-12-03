import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Alert, Box, CircularProgress } from '@mui/material';
import { WarningAmber, TrendingUp, Inventory, Assessment } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface InventoryAlert {
  product_id: string;
  current_stock: number;
  reorder_point: number;
  alert_type: string;
  severity: string;
  message: string;
}

interface DashboardStats {
  totalProducts: number;
  lowStockAlerts: number;
  totalInventoryValue: number;
  forecastAccuracy: number;
}

const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockAlerts: 0,
    totalInventoryValue: 0,
    forecastAccuracy: 95.2
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory alerts
      const alertsResponse = await axios.get(API_ENDPOINTS.inventoryAlerts);
      setAlerts(alertsResponse.data.alerts || []);
      
      // Fetch products for stats
      const productsResponse = await axios.get(API_ENDPOINTS.products);
      const products = productsResponse.data.products || [];
      
      // Fetch inventory data
      const inventoryResponse = await axios.get(API_ENDPOINTS.inventory);
      const inventory = inventoryResponse.data.inventory || [];
      
      setStats({
        totalProducts: products.length,
        lowStockAlerts: alertsResponse.data.alerts?.length || 0,
        totalInventoryValue: inventory.reduce((sum: number, item: any) => sum + (item.current_stock * 50), 0),
        forecastAccuracy: 95.2
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Inventory color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningAmber color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Alerts
                  </Typography>
                  <Typography variant="h5">
                    {stats.lowStockAlerts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Inventory Value
                  </Typography>
                  <Typography variant="h5">
                    ${stats.totalInventoryValue.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Forecast Accuracy
                  </Typography>
                  <Typography variant="h5">
                    {stats.forecastAccuracy}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventory Alerts
          </Typography>
          {alerts.length === 0 ? (
            <Alert severity="success">
              No inventory alerts at this time. All products are adequately stocked.
            </Alert>
          ) : (
            <Box>
              {alerts.map((alert, index) => (
                <Alert 
                  key={index} 
                  severity={alert.severity === 'CRITICAL' ? 'error' : 'warning'}
                  sx={{ mb: 1 }}
                >
                  <strong>{alert.product_id}</strong>: {alert.message}
                  <br />
                  Current Stock: {alert.current_stock} | Reorder Point: {alert.reorder_point}
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
