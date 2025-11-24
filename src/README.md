# Nisku Weld QC Tracker

Fast, mobile web app for fabrication QC using SharePoint Lists.

## Setup
1. Update `src/App.tsx` with your SharePoint site URL and Azure AD client/tenant IDs.
2. `npm install`
3. `npm run dev` for local testing.
4. Deploy to Azure Static Web Apps.

## Azure AD App Reg (5 mins)
- Go to portal.azure.com > Azure Active Directory > App registrations > New.
- Name: "NiskuWeldQC".
- Redirect URI: Web, `https://your-app.azurestaticapps.net`.
- API perms: Microsoft Graph > Delegated: Sites.ReadWrite.All.
- Grab Client ID and Tenant ID, paste into App.tsx.
