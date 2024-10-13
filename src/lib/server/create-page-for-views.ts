import {
  HTTP_BASIC_AUTH_HEADER
} from "$env/static/private"

export const setupPageViews = async (page_id: string) => {
  let response = await fetch('https://counter.gats.dev/create-page', {
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
