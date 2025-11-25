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

// CHANGE ONLY THIS LINE IF YOUR NETLIFY URL EVER CHANGES
const SP_SITE_URL = 'https://alcoincca.sharepoint.com/sites/ALCOQuality';

// YOUR REAL AZURE AD IDs
const CLIENT_ID = '35e7feef-280f-46ac-84b6-88cdb9898ce7';
const TENANT_ID = 'cb27d626-9691-4932-8a43-c75911cfad16';

// EXACT REDIRECT URI — NO TRAILING SLASH (this is the magic one)
const REDIRECT_URI = 'https://6923f14960ae70008ead692-moonlit-buttercream-b81cef.netlify.app';

const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const pca = new PublicClientApplication(msalConfig);

function LoginButton() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await instance.loginPopup({
        scopes: ['User.Read', 'Sites.ReadWrite.All'],
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
      sx={{ minWidth: 280, py: 2, fontSize: '1.3rem' }}
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
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/welds">Log Weld</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard siteUrl={siteUrl} />} />
            <Route path="/welds" element={<WeldLog siteUrl={siteUrl} />} />
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
            gap: 4,
            p: 2,
          }}
        >
          <Typography variant="h3" gutterBottom color="primary">
            Nisku Weld QC Tracker
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, maxWidth: 700 }}>
            Fast, mobile, glove-friendly weld logging for ALCO’s shop floor
          </Typography>
          <LoginButton />
          <Alert severity="success" sx={{ mt: 2, maxWidth: 700 }}>
            <strong>Ready for action:</strong> Real-time weld logging, photo upload, QR scanning, welder continuity, NDE tracking, and one-click MDR packages — all in your SharePoint.
          </Alert>
        </Box>
      </UnauthenticatedTemplate>
    </MsalProvider>
  );
}

export default App;
