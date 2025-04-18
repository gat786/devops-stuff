import {
  HTTP_BASIC_AUTH_HEADER
} from "$env/static/private"

const counter_app_base_url = "https://page-view-counter.apps.gats.dev"

export const setupPageViews = async (page_id: string) => {
  console.log(HTTP_BASIC_AUTH_HEADER)
  let response = await fetch(`${counter_app_base_url}/create-page`, {
    method: 'POST', 
    body: JSON.stringify({page_id}),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${HTTP_BASIC_AUTH_HEADER}`
    }
  });

  let jsonResponse = await response.json();
  console.log('Response status: ', response.status);
  console.log('Page views setup response: ', jsonResponse);
  return jsonResponse;
}
