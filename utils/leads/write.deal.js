import axios from "axios";

export const writeDeal = async (dealData, contactId) => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    const response = await axios.post(
      "https://api.hubapi.com/crm/objects/2026-09/deals",
      {
        properties: dealData,

        ...(contactId && {
          associations: [
            {
              to: {
                id: contactId,
              },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 3,
                },
              ],
            },
          ],
        }),
      },
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "HubSpot deal creation failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateDeal = async (dealId, dealData) => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    if (!dealId) {
      throw new Error("Missing HubSpot deal ID");
    }

    const response = await axios.patch(
      `https://api.hubapi.com/crm/objects/2026-09/deals/${dealId}`,
      {
        properties: dealData,
      },
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "HubSpot deal update failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteDeal = async (dealId) => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    if (!dealId) {
      throw new Error("Missing dealId");
    }

    const response = await axios.delete(
      `https://api.hubapi.com/crm/objects/2026-09/deals/${dealId}`,
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
        },
      },
    );

    return response.status === 204;
  } catch (error) {
    console.error(
      "HubSpot deal deletion failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
