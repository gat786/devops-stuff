
export const getPageViews = async (page_id: string) => {
  let response = await fetch(`https://counter.gats.dev/get-views`, {
    method: 'POST', 
    body: JSON.stringify({'page_id': page_id}),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}
