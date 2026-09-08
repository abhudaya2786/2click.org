import { env } from '../env';

export type HubSpotCaseLead = {
  caseReference: string;
  serviceSlug: string;
  projectTitle: string;
  city: string;
  stateRegion: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
};

/**
 * Optional, non-blocking CRM sync. BuildEco remains authoritative; HubSpot is a
 * downstream lead mirror only. No token = disabled. Never expose the token to Vite.
 */
export async function syncCaseLeadToHubSpot(lead: HubSpotCaseLead): Promise<{ enabled: boolean; ok: boolean }> {
  const token = env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return { enabled: false, ok: true };

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: lead.clientEmail,
          firstname: lead.clientName,
          phone: lead.clientPhone || '',
          city: lead.city,
          state: lead.stateRegion,
          hs_lead_status: 'NEW',
          lifecyclestage: 'lead',
        },
      }),
    });

    if (response.ok || response.status === 409) return { enabled: true, ok: true };
    console.warn('[BuildEcoGroup] HubSpot sync skipped/failed with status', response.status, lead.caseReference);
    return { enabled: true, ok: false };
  } catch (error) {
    console.warn('[BuildEcoGroup] HubSpot sync unavailable; case creation remains successful.', lead.caseReference, error);
    return { enabled: true, ok: false };
  }
}
