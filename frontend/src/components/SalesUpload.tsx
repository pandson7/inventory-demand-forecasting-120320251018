import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Alert, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { CloudUpload, FilePresent } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface UploadResult {
  success: boolean;
  message: string;
  records?: number;
}

const SalesUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Read and preview CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const data = lines.map(line => line.split(',').map(cell => cell.trim()));
        setCsvData(data.slice(0, 10)); // Show first 10 rows for preview
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        
        const response = await axios.post(API_ENDPOINTS.salesUpload, {
          csvData: csvContent
        });

        setResult({
          success: response.data.success,
          message: response.data.message,
          records: response.data.records
        });
      };
      
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: error.response?.data?.error || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const createSampleData = () => {
    const sampleCsv = `product_id,sale_date,quantity_sold,unit_price
product_1733248896123_abc123,2024-11-01,5,299.99
product_1733248896123_abc123,2024-11-02,3,299.99
product_1733248896123_abc123,2024-11-03,8,299.99
product_1733248896123_abc123,2024-11-04,2,299.99
product_1733248896123_abc123,2024-11-05,6,299.99`;
    
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_sales_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sales Data Upload
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Historical Sales Data
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Upload a CSV file with columns: product_id, sale_date, quantity_sold, unit_price
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
          >
            Select CSV File
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          
          <Button
            variant="text"
            onClick={createSampleData}
          >
            Download Sample CSV
          </Button>
        </Box>

        {file && (
          <Box sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilePresent color="primary" />
              <Typography variant="body2">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
            </Box>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading and processing sales data...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {result.message}
            {result.records && ` (${result.records} records processed)`}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={<CloudUpload />}
        >
          Upload Sales Data
        </Button>
      </Paper>

      {csvData.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Preview (First 10 rows)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {csvData[0]?.map((header, index) => (
                    <TableCell key={index}><strong>{header}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {csvData.slice(1).map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default SalesUpload;
