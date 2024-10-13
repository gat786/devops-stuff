const setupPageViews = async (page_id: string) => {
  let response = await fetch('https://counter.gats.dev/create-page-view', {method: 'POST', body: JSON.stringify({page_id})});
  return response.json();
}

const getPageViews = async (page_id: string) => {
  let response = await fetch(`https://counter.gats.dev/get-views`, {method: 'POST', body: JSON.stringify({page_id})});
  return response.json();
}
