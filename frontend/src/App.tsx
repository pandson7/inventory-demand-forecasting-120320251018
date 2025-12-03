import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import SalesUpload from './components/SalesUpload';
import ForecastGeneration from './components/ForecastGeneration';
import InventoryManagement from './components/InventoryManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Demand Forecasting System
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Dashboard" />
            <Tab label="Products" />
            <Tab label="Sales Upload" />
            <Tab label="Forecasting" />
            <Tab label="Inventory" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Dashboard />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ProductManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SalesUpload />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <ForecastGeneration />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <InventoryManagement />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;
