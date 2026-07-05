export const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your production URL in Vercel env variables
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview deployments
    'http://localhost:3000/';
    
  // Make sure to include https:// and remove trailing slash
  url = url.includes('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};