import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Product {
  product_id: string;
  product_name: string;
  category: string;
  price: number;
  supplier: string;
  lead_time_days: number;
  created_at: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    supplier: '',
    lead_time_days: '7'
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.products);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAlert({ type: 'error', message: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        lead_time_days: parseInt(formData.lead_time_days)
      };

      const response = await axios.post(API_ENDPOINTS.products, productData);
      
      if (response.data.success) {
        setAlert({ type: 'success', message: 'Product created successfully' });
        setDialogOpen(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setAlert({ type: 'error', message: 'Failed to create product' });
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      category: '',
      price: '',
      supplier: '',
      lead_time_days: '7'
    });
    setEditingProduct(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Product Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Lead Time (Days)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell>{product.product_id}</TableCell>
                <TableCell>{product.product_name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.supplier}</TableCell>
                <TableCell>{product.lead_time_days}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Product Name"
            value={formData.product_name}
            onChange={(e) => handleInputChange('product_name', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Lead Time (Days)"
            type="number"
            value={formData.lead_time_days}
            onChange={(e) => handleInputChange('lead_time_days', e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
