import axios from "axios";

const HUBSPOT_URL = "https://api.hubapi.com";
const headers = () => ({
  Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  "Content-Type": "application/json",
});

export const getContactByEmail = async (email) => {
  try {
    const response = await axios.get(
      `${HUBSPOT_URL}/crm/v3/objects/contacts/${encodeURIComponent(email)}`,
      {
        params: {
          idProperty: "email",
        },
        headers: headers(),
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    console.error(
      "HubSpot contact lookup failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const writeContact = async (contactData) => {
  try {
    const response = await axios.post(
      `${HUBSPOT_URL}/crm/v3/objects/contacts`,
      {
        properties: {
          firstname: contactData.firstName,
          lastname: contactData.lastName,
          email: contactData.email,
          ...(contactData.phone && {
            phone: contactData.phone,
          }),
        },
      },
      {
        headers: headers(),
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "HubSpot contact creation failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const updateContact = async (contactData, contactId) => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    if (!contactId) {
      throw new Error("Missing contactId");
    }

    if (!contactData) {
      throw new Error("Missing Contact Data");
    }

    const response = await axios.patch(
      `https://api.hubapi.com/crm/objects/2026-09/contacts/${contactId}`,
      {
        properties: contactData,
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
      "HubSpot contact update failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

export const deleteContact = async (contactId) => {
  try {
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;

    if (!hubspotApiKey) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    if (!contactId) {
      throw new Error("Missing contactId");
    }

    const response = await axios.delete(
      `https://api.hubapi.com/crm/objects/2026-09/contacts/{contactId}`,
      {
        headers: {
          Authorization: `Bearer ${hubspotApiKey}`,
        },
      },
    );

    return response.status === 204;
  } catch (error) {
    console.error(
      "HubSpot contact deletion failed:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
