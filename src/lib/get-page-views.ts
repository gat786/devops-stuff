
const counter_app_base_url = "https://page-view-counter.apps.gats.dev"

export const getPageViews = async (page_id: string) => {
  let response = await fetch(`${counter_app_base_url}/get-views`, {
    method: 'POST', 
    body: JSON.stringify({'page_id': page_id}),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export const addPageView = async (page_id: string) => {
  let response = await fetch(`${counter_app_base_url}/add-view`, {
    method: 'POST', 
    body: JSON.stringify({'page_id': page_id}),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}
