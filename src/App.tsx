import React, { useState } from 'react';
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import WeldLog from './components/WeldLog';
import Dashboard from './components/Dashboard';

// ──────────────────────────────────────────────────────────────
// UPDATE THESE TWO LINES WITH YOUR REAL VALUES LATER
// ──────────────────────────────────────────────────────────────
const SP_SITE_URL = 'https://YOURCOMPANY.sharepoint.com/sites/QC'; // ← change this
// ──────────────────────────────────────────────────────────────

// MSAL v3 configuration – fill in your Azure AD app registration later
const msalConfig = {
  auth: {
    clientId: '00000000-0000-0000-0000-000000000000', // ← replace with your App (client) ID
    authority: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000', // ← replace with your Tenant ID (or use "common")
    redirectUri: window.location.origin,
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

  const handleLogin = () => {
    instance
      .loginPopup({
        scopes: ['User.Read', 'Sites.ReadWrite.All'],
      })
      .then(() => navigate('/'))
      .catch((e: any) => console.error(e));
  };

  return (
    <Button color="inherit" variant="outlined" onClick={handleLogin}>
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
          }}
        >
          <Typography variant="h4" gutterBottom>
            Nisku Weld QC Tracker
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 500 }}>
            Sign in with your company Microsoft 365 account to start logging welds,
            viewing dashboards, and generating MDR packages.
          </Typography>
          <LoginButton />
          <Alert severity="info" sx={{ mt: 4 }}>
            Works on phones, tablets, and rugged Windows devices — no Power Apps slowness!
          </Alert>
        </Box>
      </UnauthenticatedTemplate>
    </MsalProvider>
  );
}

export default App;
