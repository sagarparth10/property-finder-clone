const UNASSIGNED = 'unassigned';
const MATCH_THRESHOLD = 40;
const DEALERS = new Set(['agent', 'broker', 'admin']);

const DEMO_USERS = [
  { email: 'maya.buyer@propertynexus.ai', name: 'Maya Al Farsi', role: 'user', phone: '+971 50 111 2222', territory: 'Dubai' },
  { email: 'john.dealer@propertynexus.ai', name: 'John Smith', role: 'agent', phone: '+971 50 123 4567', territory: 'Dubai Marina' },
  { email: 'sarah.dealer@propertynexus.ai', name: 'Sarah Johnson', role: 'agent', phone: '+971 50 765 4321', territory: 'Palm Jumeirah' },
  { email: 'amira.broker@propertynexus.ai', name: 'Amira Haddad', role: 'broker', phone: '+971 50 888 0000', territory: 'Dubai' },
  { email: 'admin@propertynexus.ai', name: 'Platform Admin', role: 'admin', phone: '+971 50 000 0001', territory: 'UAE' },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return cors(request, env, new Response(null, { status: 204 }));
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, '') || '/';

      // Static export only prebuilds /properties/_/ — serve that shell for any detail ID.
      // (ASSETS SPA fallback would otherwise return the home page HTML with a 200.)
      // Skip file-like segments so /properties/*.png is never rewritten to HTML.
      const propertyDetail = path.match(/^\/properties\/([^/]+)$/);
      const propertySegment = propertyDetail?.[1];
      const looksLikeStaticFile = !!propertySegment && /\.[a-zA-Z0-9]{2,8}$/.test(propertySegment);
      if (propertySegment && propertySegment !== '_' && !looksLikeStaticFile) {
        const shellUrl = new URL(request.url);
        shellUrl.pathname = '/properties/_/';
        return env.ASSETS.fetch(new Request(shellUrl.toString(), request));
      }

      if (!path.startsWith('/api')) {
        return env.ASSETS.fetch(request);
      }
      await ensureSeed(env);
      await enrichDemoListingMedia(env);
      const body = request.method === 'GET' || request.method === 'HEAD' ? null : await readJson(request);
      const res = await route(request, env, url, path, body);
      return cors(request, env, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error';
      const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
      return cors(request, env, json({ message }, status));
    }
  },
} satisfies ExportedHandler<Env>;

async function route(
  request: Request,
  env: Env,
  url: URL,
  path: string,
  body: any,
): Promise<Response> {
  const method = request.method;
  const user = await optionalUser(request, env);

  if (method === 'GET' && path === '/api/v1/properties') return listProperties(env, url);
  if (method === 'GET' && path === '/api/v1/properties/mine') {
    const me = requireUser(user);
    requireDealer(me);
    const rows = await sb(env, `properties?agent_id=eq.${me.id}&active=eq.true&order=created_at.desc`);
    return json(asList(rows));
  }
  const propOne = path.match(/^\/api\/v1\/properties\/([^/]+)$/);
  if (method === 'GET' && propOne) {
    const row = await sbOne(env, `properties?id=eq.${propOne[1]}`);
    if (!row) return json({ message: 'Listing not found' }, 404);
    return json(shape(row));
  }
  if (method === 'POST' && path === '/api/v1/properties') {
    const me = requireUser(user);
    requireDealer(me);
    return createProperty(env, me, body || {});
  }
  if (method === 'POST' && path === '/api/v1/properties/search') {
    url.searchParams.set('search', String(body?.query || ''));
    return listProperties(env, url);
  }
  const inquire = path.match(/^\/api\/v1\/properties\/([^/]+)\/inquire$/);
  if (method === 'POST' && inquire) return createInquiry(env, inquire[1], body || {}, user);
  const propMut = path.match(/^\/api\/v1\/properties\/([^/]+)$/);
  if (propMut && (method === 'PUT' || method === 'DELETE')) {
    const me = requireUser(user);
    requireDealer(me);
    if (method === 'DELETE') {
      await sb(env, `properties?id=eq.${propMut[1]}`, { method: 'DELETE' });
      return json({ ok: true });
    }
    const row = await sb(env, `properties?id=eq.${propMut[1]}`, {
      method: 'PATCH',
      body: JSON.stringify(toSnake(body || {})),
    });
    return json(shape(asOne(row)));
  }

  if (method === 'POST' && path === '/api/v1/auth/register') return register(env, body || {});
  if (method === 'POST' && path === '/api/v1/auth/login') return login(env, body || {});
  if (method === 'GET' && path === '/api/v1/auth/me') return json(publicUser(requireUser(user)));

  if (path.startsWith('/api/v1/crm')) {
    const me = requireUser(user);
    if (method === 'GET' && path === '/api/v1/crm/dashboard') return dashboard(env, me);
    if (method === 'GET' && path === '/api/v1/crm/leads') return listLeads(env, me, url);
    if (method === 'POST' && path === '/api/v1/crm/leads') return createLead(env, me, body || {});
    const claim = path.match(/^\/api\/v1\/crm\/leads\/([^/]+)\/claim$/);
    if (method === 'POST' && claim) return claimLead(env, me, claim[1]);
    const convert = path.match(/^\/api\/v1\/crm\/leads\/([^/]+)\/convert$/);
    if (method === 'POST' && convert) return convertLead(env, me, convert[1]);
    const status = path.match(/^\/api\/v1\/crm\/leads\/([^/]+)\/status$/);
    if (method === 'PATCH' && status) return updateLeadStatus(env, me, status[1], body?.status);
    if (method === 'GET' && path === '/api/v1/crm/opportunities') {
      requireDealer(me);
      const filter = me.role === 'admin' || me.role === 'broker' ? '' : `?owner_user_id=eq.${me.id}`;
      return json(asList(await sb(env, `opportunities${filter}${filter ? '&' : '?'}order=created_at.desc`)));
    }
    if (method === 'GET' && path === '/api/v1/crm/suggestions') return listSuggestions(env, me);
    const sug = path.match(/^\/api\/v1\/crm\/suggestions\/([^/]+)$/);
    if (method === 'PATCH' && sug) {
      requireDealer(me);
      const row = await sb(env, `suggestions?id=eq.${sug[1]}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: body?.status, updated_at: new Date().toISOString() }),
      });
      return json(shape(asOne(row)));
    }
  }

  if (method === 'POST' && path === '/api/v1/ai/chat') return aiChat(env, body || {});

  return json({ message: 'Not found' }, 404);
}

function cors(request: Request, env: Env, res: Response) {
  const origin = request.headers.get('Origin') || '';
  const allowed =
    origin === env.FRONTEND_URL ||
    origin === 'https://property.cognaitive.in' ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.workers.dev') ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1');
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', allowed ? origin : env.FRONTEND_URL || '*');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Vary', 'Origin');
  return new Response(res.body, { status: res.status, headers });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function readJson(request: Request) {
  const text = await request.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function sb(env: Env, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('apikey', env.SUPABASE_SERVICE_ROLE_KEY);
  headers.set('Authorization', `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
  headers.set('Content-Type', 'application/json');
  if (!headers.has('Prefer')) headers.set('Prefer', 'return=representation');
  const res = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, { ...init, headers });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Supabase ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function sbOne(env: Env, path: string) {
  const rows = await sb(env, path);
  return Array.isArray(rows) ? rows[0] : rows;
}

function asList(rows: any) {
  return Array.isArray(rows) ? rows.map(shape) : [];
}

function asOne(rows: any) {
  return Array.isArray(rows) ? rows[0] : rows;
}

function shape(row: any) {
  if (!row) return row;
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    out[toCamel(key)] = value;
  }
  out.id = row.id;
  out._id = row.id;
  return out;
}

function toCamel(key: string) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(input: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    out[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = value;
  }
  return out;
}

function publicUser(user: any) {
  const { password: _pw, ...safe } = user;
  return {
    ...safe,
    id: user.id,
    _id: user.id,
    canAccessAgentPortal: DEALERS.has(user.role),
  };
}

function requireUser(user: any) {
  if (!user) throw new Error('Unauthorized');
  return user;
}

function requireDealer(user: any) {
  if (!DEALERS.has(user.role)) throw new Error('Forbidden');
}

async function optionalUser(request: Request, env: Env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const payload = await verifyJwt(token, env.JWT_SECRET);
  if (!payload?.sub) return null;
  const row = await sbOne(env, `users?id=eq.${payload.sub}`);
  return row ? shape(row) : null;
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt);
  return `pbkdf2:${toHex(salt)}:${toHex(derived)}`;
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split(':');
  if (scheme !== 'pbkdf2' || !saltHex || !hashHex) return false;
  const derived = await pbkdf2(password, fromHex(saltHex));
  return toHex(derived) === hashHex;
}

async function pbkdf2(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    key,
    256,
  );
  return new Uint8Array(bits);
}

async function signJwt(payload: Record<string, unknown>, secret: string) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 }));
  const sig = await hmac(secret, `${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

async function verifyJwt(token: string, secret: string) {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const expected = await hmac(secret, `${header}.${body}`);
  if (expected !== sig) return null;
  const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return b64url(sig);
}

function b64url(input: string | ArrayBuffer) {
  const raw = typeof input === 'string' ? btoa(input) : btoa(String.fromCharCode(...new Uint8Array(input)));
  return raw.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function tokenFor(env: Env, user: any) {
  const token = await signJwt({ email: user.email, sub: user.id, role: user.role }, env.JWT_SECRET);
  return { access_token: token, token, user: publicUser(user) };
}

async function register(env: Env, body: any) {
  const existing = await sbOne(env, `users?email=eq.${encodeURIComponent(body.email)}`);
  if (existing) return json({ message: 'Email already registered' }, 409);
  const role = body.role === 'agent' || body.role === 'broker' ? body.role : 'user';
  const row = asOne(
    await sb(env, 'users', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email,
        name: body.name,
        password: await hashPassword(body.password),
        phone: body.phone || null,
        territory: body.territory || 'Dubai',
        role,
        active: true,
      }),
    }),
  );
  return json(await tokenFor(env, shape(row)));
}

async function login(env: Env, body: any) {
  const row = await sbOne(env, `users?email=eq.${encodeURIComponent(body.email || '')}`);
  if (!row || !(await verifyPassword(body.password || '', row.password))) {
    return json({ message: 'Invalid credentials' }, 401);
  }
  return json(await tokenFor(env, shape(row)));
}

async function listProperties(env: Env, url: URL) {
  const search = url.searchParams.get('search') || '';
  const type = url.searchParams.get('type') || '';
  const location = url.searchParams.get('location') || '';
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 20);
  let q = 'properties?active=eq.true&order=created_at.desc';
  if (type) q += `&type=eq.${type}`;
  if (location) q += `&location=ilike.*${location}*`;
  if (search) q += `&or=(title.ilike.*${search}*,description.ilike.*${search}*,location.ilike.*${search}*)`;
  const rows = asList(await sb(env, q));
  const minPrice = Number(url.searchParams.get('minPrice') || 0);
  const maxPrice = Number(url.searchParams.get('maxPrice') || 0);
  const bedrooms = Number(url.searchParams.get('bedrooms') || 0);
  const filtered = rows.filter((item) => {
    if (minPrice && Number(item.price) < minPrice) return false;
    if (maxPrice && Number(item.price) > maxPrice) return false;
    if (bedrooms && Number(item.bedrooms) !== bedrooms) return false;
    return true;
  });
  const start = (page - 1) * limit;
  return json({ items: filtered.slice(start, start + limit), total: filtered.length });
}

async function createProperty(env: Env, user: any, body: any) {
  const row = asOne(
    await sb(env, 'properties', {
      method: 'POST',
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        type: body.type,
        price: body.price,
        location: body.location,
        latitude: body.latitude ?? 25.2048,
        longitude: body.longitude ?? 55.2708,
        bedrooms: body.bedrooms ?? 0,
        bathrooms: body.bathrooms ?? 0,
        area: body.area ?? 0,
        furnished: !!body.furnished,
        verified: false,
        images: body.images || [],
        amenities: body.amenities || [],
        agent_id: user.id,
        developer: body.developer || null,
        availability: 'available',
        active: true,
        agent: { name: user.name, email: user.email, phone: user.phone },
      }),
    }),
  );
  const property = shape(row);
  const matching = await onListingCreated(env, property, user.id);
  return json({ property, matching });
}

async function createInquiry(env: Env, propertyId: string, body: any, user: any) {
  const property = shape(await sbOne(env, `properties?id=eq.${propertyId}`));
  if (!property) return json({ message: 'Listing not found' }, 404);
  const existing = await sbOne(
    env,
    `leads?email=eq.${encodeURIComponent(body.email)}&property_id=eq.${propertyId}&status=neq.converted&status=neq.disqualified`,
  );
  if (existing) return json({ lead: shape(existing), created: false });
  const lead = shape(
    asOne(
      await sb(env, 'leads', {
        method: 'POST',
        body: JSON.stringify({
          first_name: body.firstName,
          last_name: body.lastName || '',
          email: body.email,
          phone: body.phone || '',
          territory: property.location,
          location_preference: property.location,
          intent: property.type,
          estimated_amount: body.budget || property.price,
          bedrooms: property.bedrooms,
          property_id: propertyId,
          notes: body.notes || null,
          source: 'inquiry',
          status: 'new',
          owner_user_id: property.agentId || UNASSIGNED,
          claimed_at: property.agentId ? new Date().toISOString() : null,
          buyer_user_id: user?.id || null,
          suggested_property_ids: [propertyId],
        }),
      }),
    ),
  );
  await upsertSuggestion(env, {
    propertyId,
    leadId: lead.id,
    agentId: property.agentId,
    score: 95,
    reasons: ['Direct inquiry on this listing'],
    kind: 'inquiry',
  });
  return json({ lead, created: true });
}

async function listLeads(env: Env, user: any, url: URL) {
  const bucket = url.searchParams.get('bucket') || '';
  const status = url.searchParams.get('status') || '';
  let q = 'leads?order=created_at.desc';
  if (status && status !== 'all') q += `&status=eq.${status}`;
  if (user.role === 'user') q += `&or=(buyer_user_id.eq.${user.id},email.eq.${user.email})`;
  else if (user.role === 'agent') {
    if (bucket === 'mine') q += `&owner_user_id=eq.${user.id}`;
    else if (bucket === 'pool') q += `&owner_user_id=eq.${UNASSIGNED}`;
    else q += `&or=(owner_user_id.eq.${user.id},owner_user_id.eq.${UNASSIGNED})`;
  }
  const leads = asList(await sb(env, q));
  const all = asList(await sb(env, 'leads?select=id,owner_user_id,status,estimated_amount'));
  return json({
    leads,
    kpis: {
      poolCount: all.filter((l) => l.ownerUserId === UNASSIGNED && l.status !== 'converted' && l.status !== 'disqualified').length,
      mineCount: all.filter((l) => l.ownerUserId === user.id && l.status !== 'converted' && l.status !== 'disqualified').length,
      working: leads.filter((l) => l.status === 'working' || l.status === 'qualified').length,
      pipelineValue: leads
        .filter((l) => l.status !== 'converted' && l.status !== 'disqualified')
        .reduce((sum, l) => sum + Number(l.estimatedAmount || 0), 0),
    },
  });
}

async function createLead(env: Env, user: any, body: any) {
  const ownerUserId = DEALERS.has(user.role) ? user.id : UNASSIGNED;
  const row = asOne(
    await sb(env, 'leads', {
      method: 'POST',
      body: JSON.stringify({
        company: body.company || '',
        first_name: body.firstName,
        last_name: body.lastName || '',
        email: body.email,
        phone: body.phone || '',
        territory: body.territory || user.territory || 'Dubai',
        location_preference: body.locationPreference || body.territory || '',
        intent: body.intent || '',
        estimated_amount: body.estimatedAmount || 0,
        bedrooms: body.bedrooms || 0,
        notes: body.notes || null,
        property_id: body.propertyId || null,
        source: 'manual',
        status: DEALERS.has(user.role) ? 'working' : 'new',
        owner_user_id: ownerUserId,
        claimed_at: DEALERS.has(user.role) ? new Date().toISOString() : null,
        buyer_user_id: user.role === 'user' ? user.id : null,
      }),
    }),
  );
  return json(shape(row));
}

async function claimLead(env: Env, user: any, id: string) {
  requireDealer(user);
  const row = asOne(
    await sb(env, `leads?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        owner_user_id: user.id,
        claimed_at: new Date().toISOString(),
        status: 'working',
        updated_at: new Date().toISOString(),
      }),
    }),
  );
  return json(shape(row));
}

async function updateLeadStatus(env: Env, user: any, id: string, status: string) {
  requireDealer(user);
  const row = asOne(
    await sb(env, `leads?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    }),
  );
  return json(shape(row));
}

async function convertLead(env: Env, user: any, id: string) {
  requireDealer(user);
  const lead = shape(await sbOne(env, `leads?id=eq.${id}`));
  if (!lead) return json({ message: 'Lead not found' }, 404);
  const opp = shape(
    asOne(
      await sb(env, 'opportunities', {
        method: 'POST',
        body: JSON.stringify({
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          lead_id: lead.id,
          property_id: lead.propertyId || null,
          amount: lead.estimatedAmount || 0,
          owner_user_id: user.id,
          contact_name: `${lead.firstName} ${lead.lastName}`.trim(),
          contact_email: lead.email,
          stage: 'discovery',
        }),
      }),
    ),
  );
  await sb(env, `leads?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'converted',
      converted_opportunity_id: opp.id,
      converted_at: new Date().toISOString(),
    }),
  });
  return json(opp);
}

async function listSuggestions(env: Env, user: any) {
  let q = 'suggestions?order=score.desc';
  if (user.role === 'agent') q += `&agent_id=eq.${user.id}`;
  const rows = asList(await sb(env, q));
  const propertyIds = [...new Set(rows.map((r) => r.propertyId).filter(Boolean))];
  const leadIds = [...new Set(rows.map((r) => r.leadId).filter(Boolean))];
  const properties = propertyIds.length
    ? asList(await sb(env, `properties?id=in.(${propertyIds.join(',')})`))
    : [];
  const leads = leadIds.length ? asList(await sb(env, `leads?id=in.(${leadIds.join(',')})`)) : [];
  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p]));
  const leadMap = Object.fromEntries(leads.map((l) => [l.id, l]));
  return json(rows.map((row) => ({ ...row, property: propertyMap[row.propertyId] || null, lead: leadMap[row.leadId] || null })));
}

async function dashboard(env: Env, user: any) {
  requireDealer(user);
  const listingQ = user.role === 'admin' || user.role === 'broker' ? 'properties?active=eq.true' : `properties?active=eq.true&agent_id=eq.${user.id}`;
  const listings = asList(await sb(env, listingQ));
  const leads = asList(await sb(env, 'leads?status=neq.converted&status=neq.disqualified'));
  const openLeads = leads.filter((l) => user.role === 'admin' || user.role === 'broker' || l.ownerUserId === user.id || l.ownerUserId === UNASSIGNED);
  const suggestions = asList(
    await sb(env, user.role === 'admin' || user.role === 'broker' ? 'suggestions?status=eq.new' : `suggestions?status=eq.new&agent_id=eq.${user.id}`),
  );
  const opps = asList(
    await sb(env, user.role === 'admin' || user.role === 'broker' ? 'opportunities?select=*' : `opportunities?owner_user_id=eq.${user.id}`),
  );
  const stages = [
    { id: 'discovery', label: 'Discovery', probability: 10 },
    { id: 'qualified', label: 'Qualified', probability: 30 },
    { id: 'quoted', label: 'Quoted', probability: 50 },
    { id: 'negotiation', label: 'Negotiation', probability: 70 },
    { id: 'won', label: 'Won', probability: 100 },
    { id: 'lost', label: 'Lost', probability: 0 },
  ];
  return json({
    listings: listings.length,
    openLeads: openLeads.length,
    newSuggestions: suggestions.length,
    pipelineValue: opps.filter((o) => o.stage !== 'lost').reduce((sum, o) => sum + Number(o.amount || 0), 0),
    stages: stages.map((s) => ({ ...s, count: opps.filter((o) => o.stage === s.id).length })),
  });
}

async function onListingCreated(env: Env, property: any, agentId: string) {
  const leads = asList(await sb(env, 'leads?status=neq.converted&status=neq.disqualified'));
  let matched = 0;
  for (const lead of leads) {
    const { score, reasons } = scoreListingToLead(property, lead);
    if (score < MATCH_THRESHOLD) continue;
    await upsertSuggestion(env, {
      propertyId: property.id,
      leadId: lead.id,
      agentId: lead.ownerUserId === UNASSIGNED ? agentId : lead.ownerUserId,
      score,
      reasons,
      kind: 'listing_match',
    });
    matched += 1;
  }
  return { matched };
}

async function upsertSuggestion(
  env: Env,
  input: { propertyId: string; leadId: string; agentId: string; score: number; reasons: string[]; kind: string },
) {
  const existing = await sbOne(env, `suggestions?property_id=eq.${input.propertyId}&lead_id=eq.${input.leadId}`);
  if (existing) {
    return shape(
      asOne(
        await sb(env, `suggestions?id=eq.${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            score: input.score,
            reasons: input.reasons,
            agent_id: input.agentId,
            updated_at: new Date().toISOString(),
          }),
        }),
      ),
    );
  }
  return shape(
    asOne(
      await sb(env, 'suggestions', {
        method: 'POST',
        body: JSON.stringify({
          property_id: input.propertyId,
          lead_id: input.leadId,
          agent_id: input.agentId,
          score: input.score,
          reasons: input.reasons,
          kind: input.kind,
          status: 'new',
        }),
      }),
    ),
  );
}

function scoreListingToLead(listing: any, lead: any) {
  const reasons: string[] = [];
  let score = 0;
  const loc = String(listing.location || '').toLowerCase();
  const pref = String(lead.locationPreference || lead.territory || '').toLowerCase();
  if (pref && loc.includes(pref.split(',')[0].trim())) {
    score += 40;
    reasons.push(`Location fit: ${listing.location}`);
  }
  if (lead.intent && listing.type === lead.intent) {
    score += 20;
    reasons.push(`Intent match (${listing.type})`);
  }
  if (lead.bedrooms > 0 && Number(listing.bedrooms) === Number(lead.bedrooms)) {
    score += 20;
    reasons.push(`${listing.bedrooms} bedrooms`);
  }
  if (lead.estimatedAmount > 0) {
    const ratio = Number(listing.price) / Number(lead.estimatedAmount);
    if (ratio >= 0.8 && ratio <= 1.2) {
      score += 20;
      reasons.push('Budget within 20%');
    }
  }
  return { score, reasons };
}

async function aiChat(env: Env, body: any) {
  const base = (env.OLLAMA_BASE_URL || 'https://ollama.cognaitive.in').replace(/\/$/, '');
  const model = env.OLLAMA_MODEL || 'llama3:latest';
  const history = Array.isArray(body.history) ? body.history : [];
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: `You are Property Nexus, an AI concierge helping users navigate UAE real estate. Respond in ${(body.language || 'en').toUpperCase()} when appropriate.`,
        },
        ...history
          .filter((entry: any) => entry.role === 'assistant' || entry.role === 'user')
          .map((entry: any) => ({ role: entry.role, content: entry.content })),
        { role: 'user', content: String(body.message || '') },
      ],
    }),
  });
  if (!res.ok) return json({ response: 'I am having trouble reaching the AI engine right now.' });
  const data: any = await res.json();
  return json({ response: data?.message?.content || 'I could not generate a response at the moment.' });
}

const VILLA_DEMO_API_ID = 'e76b5ab7-b3d0-43a2-ba28-11b4bb5dfd89';
const PENTHOUSE_DEMO_API_ID = '5f61ffff-d7e5-445b-80f6-c711f2875be9';

async function enrichDemoListingMedia(env: Env) {
  const GALLERIES: {
    key: string;
    images: string[];
    match: (id: string, title: string, location: string) => boolean;
    patch?: Record<string, unknown>;
  }[] = [
    {
      key: 'penthouse',
      images: [
        '/media/penthouse-skyline.webp',
        '/media/penthouse-living-room.webp',
        '/media/penthouse-kitchen.webp',
        '/media/penthouse-bedroom.webp',
        '/media/penthouse-terrace.webp',
        '/media/penthouse-dining.webp',
      ],
      // Match UUID / exact title first — Palm Jumeirah must never get villa media.
      match: (id, title, location) =>
        id === PENTHOUSE_DEMO_API_ID ||
        title.includes('premium 4br penthouse') ||
        ((location.includes('palm') || title.includes('palm')) && title.includes('penthouse')),
    },
    {
      key: 'villa',
      images: [
        '/media/villa-pool-exterior.webp',
        '/media/villa-living-room.webp',
        '/media/villa-kitchen.webp',
        '/media/villa-bedroom.webp',
        '/media/villa-aerial.webp',
        '/media/villa-night-exterior.webp',
      ],
      // Exact UUID or exact demo title only — never bare "Jumeirah" (matches Palm Jumeirah).
      match: (id, title, location) =>
        id === VILLA_DEMO_API_ID ||
        title === 'spacious 3br villa in jumeirah' ||
        (title.includes('villa') &&
          location.includes('jumeirah') &&
          !location.includes('palm') &&
          !title.includes('penthouse') &&
          !title.includes('palm')),
      patch: {
        description:
          'Contemporary two-story white villa with an infinity pool, warm teak soffits, floor-to-ceiling glass, and a built-in outdoor kitchen. Indoor-outdoor living across living, kitchen, and bedroom suites — ideal for families seeking a modern Jumeirah lifestyle.',
        furnished: true,
        amenities: ['Garden', 'Pool', 'Parking', 'Maid Room', 'Outdoor Kitchen', 'Storage'],
      },
    },
    {
      key: 'marina',
      images: [
        '/media/marina-exterior.webp',
        '/media/marina-living-room.webp',
        '/media/marina-kitchen.webp',
        '/media/marina-bedroom.webp',
        '/media/marina-bathroom.webp',
        '/media/marina-balcony.webp',
      ],
      match: (_id, title, location) =>
        title.includes('luxurious 2br apartment') ||
        (location.includes('marina') && (title.includes('2br') || title.includes('apartment'))),
    },
    {
      key: 'downtown',
      images: [
        '/media/downtown-living-room.webp',
        '/media/downtown-kitchen.webp',
        '/media/downtown-bedroom.webp',
        '/media/downtown-bathroom.webp',
        '/media/downtown-workspace.webp',
        '/media/downtown-exterior.webp',
      ],
      match: (_id, title, location) =>
        title.includes('modern 1br studio') ||
        (location.includes('downtown') && (title.includes('studio') || title.includes('1br'))),
    },
  ];

  const rows = asList(
    await sb(env, 'properties?select=id,title,location,images&active=eq.true&limit=100'),
  );

  for (const row of rows) {
    const id = String(row.id || '');
    const title = String(row.title || '').toLowerCase();
    const location = String(row.location || '').toLowerCase();
    const gallery = GALLERIES.find((g) => g.match(id, title, location));
    if (!gallery) continue;

    const images = Array.isArray(row.images) ? row.images : [];
    const hero = String(images[0] || '');
    const expectedHero = gallery.images[0];
    const sameHero =
      hero === expectedHero ||
      // already on webp set, or legacy png paths that still need upgrading to webp
      (hero.replace(/\.png$/, '.webp') === expectedHero && !hero.endsWith('.png'));
    const heroOk = images.length >= 6 && sameHero && images.every((src: unknown) => !String(src).endsWith('.png'));
    if (heroOk) continue;

    await sb(env, `properties?id=eq.${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        images: gallery.images,
        ...(gallery.patch || {}),
      }),
    });
  }
}

async function ensureSeed(env: Env) {
  const existing = await sb(env, 'users?select=id&limit=1');
  if (Array.isArray(existing) && existing.length > 0) return;
  const password = await hashPassword('Demo1234!');
  const created: Record<string, any> = {};
  for (const demo of DEMO_USERS) {
    const row = shape(
      asOne(
        await sb(env, 'users', {
          method: 'POST',
          body: JSON.stringify({ ...demo, password, active: true }),
        }),
      ),
    );
    created[demo.email] = row;
  }
  const john = created['john.dealer@propertynexus.ai'];
  const sarah = created['sarah.dealer@propertynexus.ai'];
  const maya = created['maya.buyer@propertynexus.ai'];
  const listings = [
    {
      title: 'Luxurious 2BR Apartment in Dubai Marina',
      description: 'Stunning 2-bedroom apartment with marina views. Modern amenities and premium finishes.',
      type: 'rent',
      price: 85000,
      location: 'Dubai Marina, Dubai',
      latitude: 25.0762,
      longitude: 55.1352,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      furnished: true,
      verified: true,
      images: [
        '/media/marina-exterior.webp',
        '/media/marina-living-room.webp',
        '/media/marina-kitchen.webp',
        '/media/marina-bedroom.webp',
        '/media/marina-bathroom.webp',
        '/media/marina-balcony.webp',
      ],
      amenities: ['Gym', 'Pool', 'Parking', 'Balcony', 'Security'],
      agent_id: john.id,
      developer: 'Emaar Properties',
      agent: { name: john.name, email: john.email },
    },
    {
      title: 'Modern 1BR Studio in Downtown',
      description: 'Contemporary studio apartment in the heart of Downtown Dubai.',
      type: 'rent',
      price: 55000,
      location: 'Downtown Dubai',
      latitude: 25.1972,
      longitude: 55.2744,
      bedrooms: 1,
      bathrooms: 1,
      area: 650,
      furnished: true,
      verified: false,
      images: [
        '/media/downtown-living-room.webp',
        '/media/downtown-kitchen.webp',
        '/media/downtown-bedroom.webp',
        '/media/downtown-bathroom.webp',
        '/media/downtown-workspace.webp',
        '/media/downtown-exterior.webp',
      ],
      amenities: ['Gym', 'Rooftop', 'Security', 'Balcony'],
      agent_id: john.id,
      agent: { name: john.name, email: john.email },
    },
    {
      title: 'Spacious 3BR Villa in Jumeirah',
      description:
        'Contemporary two-story white villa with an infinity pool, warm teak soffits, floor-to-ceiling glass, and a built-in outdoor kitchen. Indoor-outdoor living across living, kitchen, and bedroom suites — ideal for families seeking a modern Jumeirah lifestyle.',
      type: 'sale',
      price: 1200000,
      location: 'Jumeirah, Dubai',
      latitude: 25.1969,
      longitude: 55.2444,
      bedrooms: 3,
      bathrooms: 3,
      area: 2800,
      furnished: true,
      verified: true,
      images: [
        '/media/villa-pool-exterior.webp',
        '/media/villa-living-room.webp',
        '/media/villa-kitchen.webp',
        '/media/villa-bedroom.webp',
        '/media/villa-aerial.webp',
        '/media/villa-night-exterior.webp',
      ],
      amenities: ['Garden', 'Pool', 'Parking', 'Maid Room', 'Outdoor Kitchen', 'Storage'],
      agent_id: sarah.id,
      developer: 'Nakheel Properties',
      agent: { name: sarah.name, email: sarah.email },
    },
    {
      title: 'Premium 4BR Penthouse in Palm Jumeirah',
      description: 'Exclusive penthouse with panoramic sea views and premium finishes.',
      type: 'sale',
      price: 2500000,
      location: 'Palm Jumeirah, Dubai',
      latitude: 25.1162,
      longitude: 55.1365,
      bedrooms: 4,
      bathrooms: 4,
      area: 4500,
      furnished: true,
      verified: true,
      images: [
        '/media/penthouse-skyline.webp',
        '/media/penthouse-living-room.webp',
        '/media/penthouse-kitchen.webp',
        '/media/penthouse-bedroom.webp',
        '/media/penthouse-terrace.webp',
        '/media/penthouse-dining.webp',
      ],
      amenities: ['Gym', 'Pool', 'Beach', 'Concierge', 'Parking'],
      agent_id: sarah.id,
      developer: 'Damac Properties',
      agent: { name: sarah.name, email: sarah.email },
    },
  ];
  for (const listing of listings) {
    await sb(env, 'properties', {
      method: 'POST',
      body: JSON.stringify({ ...listing, availability: 'available', active: true }),
    });
  }
  await sb(env, 'leads', {
    method: 'POST',
    body: JSON.stringify({
      first_name: 'Maya',
      last_name: 'Al Farsi',
      email: 'maya.buyer@propertynexus.ai',
      phone: '+971 50 111 2222',
      territory: 'Dubai Marina',
      location_preference: 'Dubai Marina',
      intent: 'rent',
      bedrooms: 2,
      estimated_amount: 90000,
      source: 'portal',
      status: 'new',
      owner_user_id: UNASSIGNED,
      buyer_user_id: maya.id,
      notes: 'Wants marina view, furnished, gym + pool.',
    }),
  });
}

