import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, Chip, Card, CardContent
} from '@mui/material';
import { Edit, Warning, CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface InventoryItem {
  product_id: string;
  current_stock: number;
  reorder_point: number;
  max_stock: number;
  last_updated: string;
}

interface Product {
  product_id: string;
  product_name: string;
  category: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    current_stock: '',
    reorder_point: '',
    max_stock: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, productsResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.inventory),
        axios.get(API_ENDPOINTS.products)
      ]);
      
      setInventory(inventoryResponse.data.inventory || []);
      setProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to fetch inventory data' });
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.product_id === productId);
    return product?.product_name || productId;
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return { status: 'OUT_OF_STOCK', color: 'error', icon: <Error /> };
    } else if (item.current_stock <= item.reorder_point) {
      return { status: 'LOW_STOCK', color: 'warning', icon: <Warning /> };
    } else {
      return { status: 'IN_STOCK', color: 'success', icon: <CheckCircle /> };
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      current_stock: item.current_stock.toString(),
      reorder_point: item.reorder_point.toString(),
      max_stock: item.max_stock.toString()
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingItem) return;

    try {
      const updateData = {
        current_stock: parseInt(formData.current_stock),
        reorder_point: parseInt(formData.reorder_point),
        max_stock: parseInt(formData.max_stock)
      };

      const response = await axios.put(
        API_ENDPOINTS.inventoryUpdate(editingItem.product_id),
        updateData
      );

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Inventory updated successfully' });
        setDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      setAlert({ type: 'error', message: 'Failed to update inventory' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      current_stock: '',
      reorder_point: '',
      max_stock: ''
    });
    setEditingItem(null);
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const outOfStock = inventory.filter(item => item.current_stock === 0).length;
    const lowStock = inventory.filter(item => 
      item.current_stock > 0 && item.current_stock <= item.reorder_point
    ).length;
    const inStock = totalItems - outOfStock - lowStock;

    return { totalItems, outOfStock, lowStock, inStock };
  };

  const stats = getInventoryStats();

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
        Inventory Management
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        <Box flex="1 1 200px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h5">
                {stats.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 200px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Stock
              </Typography>
              <Typography variant="h5" color="success.main">
                {stats.inStock}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 200px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock
              </Typography>
              <Typography variant="h5" color="warning.main">
                {stats.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box flex="1 1 200px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h5" color="error.main">
                {stats.outOfStock}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Reorder Point</TableCell>
                <TableCell>Max Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={item.product_id}>
                    <TableCell>{getProductName(item.product_id)}</TableCell>
                    <TableCell>{item.current_stock}</TableCell>
                    <TableCell>{item.reorder_point}</TableCell>
                    <TableCell>{item.max_stock}</TableCell>
                    <TableCell>
                      <Chip
                        icon={stockStatus.icon}
                        label={stockStatus.status.replace('_', ' ')}
                        color={stockStatus.color as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(item.last_updated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Inventory: {editingItem && getProductName(editingItem.product_id)}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Stock"
            type="number"
            value={formData.current_stock}
            onChange={(e) => handleInputChange('current_stock', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Reorder Point"
            type="number"
            value={formData.reorder_point}
            onChange={(e) => handleInputChange('reorder_point', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Max Stock"
            type="number"
            value={formData.max_stock}
            onChange={(e) => handleInputChange('max_stock', e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Update Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;
