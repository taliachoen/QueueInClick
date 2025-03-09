// const api_url = "https://data.gov.il/api/3/action/datastore_search";
// const cities_resource_id = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
// const city_name_key = "שם_ישוב";

// const getCities = async () => {
//   try {
//     const response = await axios.get(api_url, {
//       params: { resource_id: cities_resource_id, limit: 1000 },
//       responseType: "json"
//     });

//     const records = response?.data?.result?.records || [];
//     const cities = records.map(record => record[city_name_key].trim());
//     return cities;
//   } catch (error) {
//     console.error("Error fetching cities:", error);
//   }
// };

// // קריאה לפונקציה
// getCities();
