// import { fetchHandler } from "./fetch";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// export const api = {
//     filter: {
//     getFilterData: async (
//       bearerToken: string,
//       searchParams: Record<string, string | string[]>
//     ): Promise<FilterAPIResponse> => {
//       Object.keys(searchParams).forEach((key) => {
//         if (key === 'min_price' || key === 'max_price') {
//           delete searchParams[key];
//         }
//       });

//       // const { search } = searchParams || {};
//       // console.log('Search params before')
//     //   const stringified = stringifyQueryString(searchParams, 'bracket');
//       return await fetchHandler(
//         `${API_BASE_URL}/product/filter-data?${stringified}`,
//         {
//           headers: {
//             Authorization: `Bearer ${bearerToken}`,
//           },
//         }
//       );
//     },
//   },
// }