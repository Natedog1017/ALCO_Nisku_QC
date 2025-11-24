import React from 'react'
import { Typography, Card, CardContent, Grid } from '@mui/material'

const Dashboard: React.FC<{ siteUrl: string }> = ({ siteUrl }) => {
  // Add charts/dashboards here – e.g., weld counts, expiry alerts
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5">Total Welds Today</Typography>
            <Typography variant="h3">42</Typography> {/* Pull from SharePoint */}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5">Rejection Rate</Typography>
            <Typography variant="h3" color="error">2.3%</Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* Add more: Welder expiry alerts, PDF export button, etc. */}
    </Grid>
  )
}

export default Dashboard
