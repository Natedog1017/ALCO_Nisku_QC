import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Alert, CircularProgress, IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';

const SITE_URL = 'https://alcoincca.sharepoint.com/sites/ALCOQuality';
const LIST_NAME = 'ALCO Welding Log';

interface Weld {
  id?: string;
  Title?: string;           // Weld #
  Welder?: string;
  JobNumber?: string;
  Status?: string;
  DateWelded?: string;
  Photo?: { name: string; url: string }[];
}

const WeldLog: React.FC = () => {
  const { accounts, instance } = useMsal();
  const [welds, setWelds] = useState<Weld[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newWeld, setNewWeld] = useState({
    Title: '',
    Welder: '',
    JobNumber: '',
    Status: 'VisualAccept'
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const getGraphClient = async (): Promise<Client> => {
    const token = await instance.acquireTokenSilent({
      scopes: ['Sites.ReadWrite.All'],
      account: accounts[0]
    });
    return Client.init({
      authProvider: (done) => done(null, token.accessToken)
    });
  };

  const loadWelds = async () => {
    try {
      const client = await getGraphClient();
      const res = await client
        .api(`${SITE_URL}/lists('${LIST_NAME}')/items`)
        .expand('fields($select=Title,Welder,JobNumber,Status,DateWelded)')
        .top(100)
        .get();

      setWelds(res.value.map((i: any) => i.fields));
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load welds – check Wi-Fi or permissions');
      setLoading(false);
    }
  };

  const addWeld = async () => {
    if (!newWeld.Title) return;
    try {
      const client = await getGraphClient();
      const item = await client
        .api(`${SITE_URL}/lists('${LIST_NAME}')/items`)
        .post({
          fields: {
            ...newWeld,
            DateWelded: new Date().toISOString()
          }
        });

      if (photo) {
        await client
          .api(`${SITE_URL}/lists('${LIST_NAME}')/items/${item.id}/driveItem/uploadAttachment`)
          .put(photo);
      }

      setNewWeld({ Title: '', Welder: '', JobNumber: '', Status: 'VisualAccept' });
      setPhoto(null);
      loadWelds();
    } catch (err) {
      setError('Failed to save weld – try again');
    }
  };

  useEffect(() => {
    loadWelds();
  }, []);

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>Log New Weld</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <TextField label="Weld #" value={newWeld.Title}
          onChange={(e) => setNewWeld({ ...newWeld, Title: e.target.value })} />
        <TextField label="Welder" value={newWeld.Welder}
          onChange={(e) => setNewWeld({ ...newWeld, Welder: e.target.value })} />
        <TextField label="Job #" value={newWeld.JobNumber}
          onChange={(e) => setNewWeld({ ...newWeld, JobNumber: e.target.value })} />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={newWeld.Status}
            onChange={(e) => setNewWeld({ ...newWeld, Status: e.target.value })}>
            <MenuItem value="VisualAccept">Visual Accept</MenuItem>
            <MenuItem value="Repair">Repair</MenuItem>
            <MenuItem value="NDE">NDE Required</MenuItem>
          </Select>
        </FormControl>

        <label>
          <input type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && setPhoto(e.target.files[0])} />
          <IconButton color="primary" component="span" size="large">
            <PhotoCamera fontSize="large" />
          </IconButton>
          {photo && <Typography variant="body2">{photo.name}</Typography>}
        </label>

        <Button variant="contained" size="large" onClick={addWeld}>
          Add Weld
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Weld #</TableCell>
              <TableCell>Welder</TableCell>
              <TableCell>Job #</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {welds.map((w, i) => (
              <TableRow key={i}>
                <TableCell>{w.Title}</TableCell>
                <TableCell>{w.Welder}</TableCell>
                <TableCell>{w.JobNumber}</TableCell>
                <TableCell>{w.Status}</TableCell>
                <TableCell>{w.DateWelded?.split('T')[0]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default WeldLog;
