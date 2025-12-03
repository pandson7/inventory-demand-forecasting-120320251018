import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent
} from '@mui/material';
import { TrendingUp, Assessment } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  product_id: string;
  product_name: string;
}

interface Forecast {
  product_id: string;
  forecast_date: string;
  predicted_demand: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
}

const ForecastGeneration: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [insights, setInsights] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.products);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    if (!selectedProduct) return;

    try {
      setGenerating(true);
      setAlert(null);

      const response = await axios.post(API_ENDPOINTS.forecastsGenerate, {
        product_id: selectedProduct
      });

      if (response.data.success) {
        setForecasts(response.data.forecasts || []);
        setInsights(response.data.insights || '');
        setAlert({ type: 'success', message: 'Forecast generated successfully!' });
      }
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.error || 'Failed to generate forecast'
      });
    } finally {
      setGenerating(false);
    }
  };

  const fetchExistingForecasts = async (productId: string) => {
    try {
      const response = await axios.get(API_ENDPOINTS.forecasts(productId));
      setForecasts(response.data.forecasts || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    }
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    if (productId) {
      fetchExistingForecasts(productId);
    } else {
      setForecasts([]);
    }
  };

  const chartData = {
    labels: forecasts.map(f => new Date(f.forecast_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Predicted Demand',
        data: forecasts.map(f => f.predicted_demand),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Upper Confidence',
        data: forecasts.map(f => f.confidence_interval_upper),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: 'Lower Confidence',
        data: forecasts.map(f => f.confidence_interval_lower),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Demand Forecast (Next 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Predicted Demand'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
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
        Demand Forecasting
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} alignItems="center">
          <Box flex="1">
            <FormControl fullWidth>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                label="Select Product"
              >
                <MenuItem value="">
                  <em>Choose a product</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.product_id} value={product.product_id}>
                    {product.product_name} ({product.product_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box flex="1">
            <Button
              variant="contained"
              onClick={generateForecast}
              disabled={!selectedProduct || generating}
              startIcon={generating ? <CircularProgress size={20} /> : <TrendingUp />}
              fullWidth
            >
              {generating ? 'Generating Forecast...' : 'Generate New Forecast'}
            </Button>
          </Box>
        </Box>

        {alert && (
          <Alert severity={alert.type} sx={{ mt: 2 }} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}
      </Paper>

      {forecasts.length > 0 && (
        <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={3}>
          <Box flex="2">
            <Paper sx={{ p: 3 }}>
              <Line data={chartData} options={chartOptions} />
            </Paper>
          </Box>
          
          <Box flex="1">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Forecast Summary
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total Forecasts: {forecasts.length} days
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Avg. Daily Demand: {(forecasts.reduce((sum, f) => sum + f.predicted_demand, 0) / forecasts.length).toFixed(1)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Peak Demand: {Math.max(...forecasts.map(f => f.predicted_demand)).toFixed(1)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  Min Demand: {Math.min(...forecasts.map(f => f.predicted_demand)).toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
            
            {insights && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Insights
                  </Typography>
                  <Typography variant="body2">
                    {insights}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ForecastGeneration;
