
const getPageViews = async (page_id: string) => {
  let response = await fetch(`https://counter.gats.dev/get-views`, {method: 'POST', body: JSON.stringify({page_id})});
  return response.json();
}
