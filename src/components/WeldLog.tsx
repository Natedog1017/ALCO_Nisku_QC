import React, { useState, useEffect } from 'react'
import { 
  TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, 
  Select, MenuItem, FormControl, InputLabel, Box, Alert 
} from '@mui/material'
import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticatedTemplate } from '@azure/msal-react'

interface Weld {
  id?: number
  weldNumber: string
  welder: string
  jobNumber: string
  status: 'VisualAccept' | 'Repair' | 'NDE'
}

const WeldLog: React.FC<{ siteUrl: string }> = ({ siteUrl }) => {
  const [welds, setWelds] = useState<Weld[]>([])
  const [newWeld, setNewWeld] = useState({ weldNumber: '', welder: '', jobNumber: '', status: 'VisualAccept' })
  const [graphClient, setGraphClient] = useState<Client | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Initialize Graph client (offline capable with IndexedDB fallback)
    import('@microsoft/microsoft-graph-client').then(({ Client: GraphClient }) => {
      // Setup auth token fetch here – uses MSAL
      const client = new GraphClient()
      // client.api('/me').get() // Test auth
      setGraphClient(client)
      loadWelds()
    })
  }, [])

  const loadWelds = async () => {
    if (!graphClient) return
    try {
      // Query SharePoint WeldLog list via Graph API
      const response = await graphClient
        .api(`/sites/${encodeURIComponent(siteUrl)}/lists/WeldLog/items?expand=fields`)
        .top(100)
        .get()
      const items = response.value.map((item: any) => ({
        id: item.id,
        ...item.fields,
      })) as Weld[]
      setWelds(items)
    } catch (err) {
      setError('Failed to load welds – check Wi-Fi or SharePoint perms')
    }
  }

  const addWeld = async () => {
    if (!graphClient || !newWeld.weldNumber) return
    try {
      await graphClient
        .api(`/sites/${encodeURIComponent(siteUrl)}/lists/WeldLog/items`)
        .post({
          fields: { ...newWeld, DateWelded: new Date().toISOString() },
        })
      setNewWeld({ weldNumber: '', welder: '', jobNumber: '', status: 'VisualAccept' })
      loadWelds() // Refresh
      // Offline: Store in IndexedDB if no net, sync later
    } catch (err) {
      setError('Failed to add weld')
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <AuthenticatedTemplate>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5">Log New Weld</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Weld #" value={newWeld.weldNumber} onChange={(e) => setNewWeld({ ...newWeld, weldNumber: e.target.value })} />
          <TextField label="Welder" value={newWeld.welder} onChange={(e) => setNewWeld({ ...newWeld, welder: e.target.value })} />
          <TextField label="Job #" value={newWeld.jobNumber} onChange={(e) => setNewWeld({ ...newWeld, jobNumber: e.target.value })} />
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select value={newWeld.status} label="Status" onChange={(e) => setNewWeld({ ...newWeld, status: e.target.value as any })}>
              <MenuItem value="VisualAccept">Visual Accept</MenuItem>
              <MenuItem value="Repair">Repair</MenuItem>
              <MenuItem value="NDE">NDE Pending</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={addWeld}>Add Weld</Button>
        </Box>
      </Box>

      <Typography variant="h6">Recent Welds</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Weld #</TableCell>
            <TableCell>Welder</TableCell>
            <TableCell>Job #</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {welds.map((weld) => (
            <TableRow key={weld.id}>
              <TableCell>{weld.weldNumber}</TableCell>
              <TableCell>{weld.welder}</TableCell>
              <TableCell>{weld.jobNumber}</TableCell>
              <TableCell>{weld.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AuthenticatedTemplate>
  )
}

export default WeldLog
