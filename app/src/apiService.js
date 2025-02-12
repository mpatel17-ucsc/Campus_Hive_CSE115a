const API_KEY = process.env.REACT_APP_CSCAPI_KEY;
const BASE_URL = "https://api.countrystatecity.in/v1/countries/US";

export const fetchStates = async () => {
  try {
    const response = await fetch(`${BASE_URL}/states`, {
      method: "GET",
      headers: { "X-CSCAPI-KEY": API_KEY },
    });

    if (!response.ok) throw new Error("Failed to fetch states");

    const data = await response.json();
    return data.map((state) => ({
      name: state.name,
      iso2: state.iso2, // Use ISO code for cities
    }));
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

export const fetchCities = async (stateIso) => {
  try {
    const response = await fetch(`${BASE_URL}/states/${stateIso}/cities`, {
      method: "GET",
      headers: { "X-CSCAPI-KEY": API_KEY },
    });

    if (!response.ok) throw new Error("Failed to fetch cities");

    const data = await response.json();
    return data.map((city) => city.name); // Just return names
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};


