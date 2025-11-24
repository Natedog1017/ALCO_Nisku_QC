import React, { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import WeldLog from './components/WeldLog'
import Dashboard from './components/Dashboard'
import { Configuration } from '@azure/msal-browser'

// Replace with your SharePoint site
const SP_SITE_URL = 'https://yourcompany.sharepoint.com/sites/QC' // Paste yours here!

const msalConfig: Configuration = {
  auth: {
    clientId: 'your-app-registration-client-id', // Get this from Azure AD app reg (I'll guide below)
    authority: 'https://login.microsoftonline.com/your-tenant-id', // e.g., common or your tenant
    redirectUri: window.location.origin,
  },
}

const pca = new PublicClientApplication(msalConfig)

function App() {
  const [siteUrl, setSiteUrl] = useState(SP_SITE_URL)

  return (
    <MsalProvider instance={pca}>
      <AuthenticatedTemplate>
        <AppBar position="static">
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
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<Dashboard siteUrl={siteUrl} />} />
            <Route path="/welds" element={<WeldLog siteUrl={siteUrl} />} />
          </Routes>
        </Container>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h4">Sign in with Microsoft 365 to get started</Typography>
        </Box>
      </UnauthenticatedTemplate>
    </MsalProvider>
  )
}

export default App
