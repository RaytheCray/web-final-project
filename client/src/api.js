const BASE = 'http://localhost:3000/api';

export async function getWatchlist() {
  const res = await fetch(`${BASE}/ips`);
  return res.json();
}

export async function saveIP(entry) {
  const res = await fetch(`${BASE}/ips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function updateIP(id, changes) {
  const res = await fetch(`${BASE}/ips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  return res.json();
}

export async function deleteIP(id) {
  await fetch(`${BASE}/ips/${id}`, { method: 'DELETE' });
}

export async function lookupIP(ip) {
  const fields = 'status,message,country,countryCode,regionName,city,isp,org,proxy,hosting,query';
  const res = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);
  return res.json();
}
