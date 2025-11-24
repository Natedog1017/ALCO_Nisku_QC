import React, { useState } from 'react';
import { 
  MsalProvider, 
  AuthenticatedTemplate, 
  UnauthenticatedTemplate, 
  useMsal 
} from '@azure/msal-react';
import { PublicClientApplication, Configuration } from '@azure/msal-browser';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Alert,
} from '@mui/material';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import WeldLog from './components/WeldLog';
import Dashboard from './components/Dashboard';

// ──────────────────────────────────────────────────────────────
// UPDATE THESE WITH YOUR REAL VALUES (After Azure AD setup)
// ──────────────────────────────────────────────────────────────
const SP_SITE_URL = 'https://YOURCOMPANY.sharepoint.com/sites/QC'; // e.g., https://alco.sharepoint.com/sites/QC
const CLIENT_ID = '00000000-0000-0000-0000-000000000000'; // From Azure AD App Registration
const TENANT_ID = '00000000-0000-0000-0000-000000000000'; // Or use 'common' for multi-tenant
// ──────────────────────────────────────────────────────────────

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage', // For offline support
    storeAuthStateInCookie: false, // Better for privacy
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case 0: console.error(message); break; // Error
          case 1: console.warn(message); break; // Warning
          case 2: console.info(message); break; // Info
          case 3: console.debug(message); break; // Verbose
        }
      },
    },
  },
};

const pca = new PublicClientApplication(msalConfig);

function LoginButton() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await instance.loginPopup({
        scopes: ['User.Read', 'Sites.ReadWrite.All'], // For SharePoint access
      });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Button 
      color="primary" 
      variant="contained" 
      size="large" 
      onClick={handleLogin}
      sx={{ minWidth: 200 }} // Glove-friendly size
    >
      Sign in with Microsoft 365
    </Button>
  );
}

function App() {
  const [siteUrl] = useState(SP_SITE_URL);

  return (
    <MsalProvider instance={pca}>
      <AuthenticatedTemplate>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Nisku Weld QC Tracker
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/welds">
              Log Weld
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard siteUrl={siteUrl} />} />
            <Route path="/welds" element={<WeldLog siteUrl={siteUrl} />} />
            <Route path="*" element={<Typography>Page not found</Typography>} />
          </Routes>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            gap: 3,
            p: 2,
          }}
        >
          <Typography variant="h3" gutterBottom color="primary">
            Welcome to Nisku Weld QC Tracker
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Fast, mobile QC logging for your fab shop – powered by SharePoint.
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 500, mb: 3 }}>
            Sign in with your Microsoft 365 account to log welds, track NDE, check welder quals, and generate MDR packages. Works offline too.
          </Typography>
          <LoginButton />
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Shop Floor Ready:</strong> Glove-friendly buttons, QR scanning, photo uploads, and auto-sync.
          </Alert>
        </Box>
      </UnauthenticatedTemplate>
    </MsalProvider>
  );
}

export default App;
