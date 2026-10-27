// Data layer. Both backends answer the same actions through call(action, payload):
//   Remote — Google Apps Script web app (Sheets + Drive), used when API_URL is set
//   Demo   — this browser's localStorage with example data; runs the same rules (core.js)
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const DEMO_KEY = 'contracthub_demo_v1';
  const DEMO_USER = 'contracthub_demo_user';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } }

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error('Could not read the file.'));
      r.readAsDataURL(file);
    });
  }

  // ------------------------------------------------------------ Remote

  const Remote = {
    mode: 'remote',
    token: null,

    async call(action, payload) {
      let res;
      try {
        res = await fetch(CFG.API_URL, {
          method: 'POST',
          // text/plain keeps this a "simple" request, so Apps Script needs no CORS preflight
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token: this.token, payload: payload || {} }),
        });
      } catch (e) {
        throw Object.assign(new Error('Cannot reach the server. Check your internet connection.'), { code: 'NETWORK' });
      }
      let out;
      try { out = await res.json(); } catch (e) {
        throw Object.assign(new Error('The server sent an unexpected reply. Check API_URL in config.js.'), { code: 'BAD_REPLY' });
      }
      if (!out.ok) throw Object.assign(new Error(out.error || 'Request failed'), { code: out.code });
      return out.data;
    },

    async upload(id, file) {
      return this.call('item.upload', { id, fileName: file.name, mimeType: file.type, base64: await readBase64(file) });
    },
  };

  // ------------------------------------------------------------ Demo

  function day(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const stamp = (offsetDays) => new Date(Date.now() + offsetDays * 864e5).toISOString();

  const DEMO_ACCOUNTS = {
    'sam.secov@gmail.com': 'Super admin — everything, including accounts, access and sections',
    'szesian.mitosc@gmail.com': 'Super admin',
    'eileen.secov@gmail.com': 'Super admin',
    'hafiz@example.com': 'Client Register, Contracts Register, Variation Orders, Bonds: Manager · Work Orders: Viewer',
    'mei@example.com': 'Service / Work Orders: Editor · Service Reports & SLA / KPI: Manager · Contracts Register: Viewer',
    'siti@example.com': 'Progress Claims & Payments: Manager · Bonds: Editor · Contracts Register: Viewer',
    'daniel@example.com': 'Service / Work Orders: Contributor (site — updates progress)',
    'raj@example.com': 'No section access — sees only the work orders and reports he follows',
  };

  function seed() {
    const SAM = 'sam.secov@gmail.com';
    const users = [
      ['sam.secov@gmail.com', 'Sam'], ['szesian.mitosc@gmail.com', 'Sze Sian'], ['eileen.secov@gmail.com', 'Eileen'], ['hafiz@example.com', 'Hafiz (Contracts)'],
      ['mei@example.com', 'Mei Ling (PM)'], ['siti@example.com', 'Siti (Finance)'], ['daniel@example.com', 'Daniel (Supervisor)'], ['raj@example.com', 'Raj (Technician)'],
    ].map(([id, name]) => ({ id, name, active: true, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) }));

    const ids = { clients: 's_clients', contracts: 's_contracts', orders: 's_orders', variations: 's_vos', claims: 's_claims', bonds: 's_bonds', reports: 's_reports' };
    const sections = window.TEMPLATES.map((t, i) => {
      const fields = clone(t.fields).map((f) => { if (f.type === 'link') f.target = ids[f.target] || ''; return f; });
      return { id: ids[t.id], name: t.name, template: t.id, order: i + 1, fields, stageField: t.stageField, archived: false, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) };
    });

    const access = [
      ['hafiz@example.com', 's_clients', 'manager'], ['hafiz@example.com', 's_contracts', 'manager'], ['hafiz@example.com', 's_vos', 'manager'], ['hafiz@example.com', 's_bonds', 'manager'], ['hafiz@example.com', 's_orders', 'viewer'],
      ['mei@example.com', 's_orders', 'editor'], ['mei@example.com', 's_reports', 'manager'], ['mei@example.com', 's_contracts', 'viewer'],
      ['siti@example.com', 's_claims', 'manager'], ['siti@example.com', 's_bonds', 'editor'], ['siti@example.com', 's_contracts', 'viewer'],
      ['daniel@example.com', 's_orders', 'contributor'],
    ].map(([userId, sectionId, level], i) => ({ id: 'a' + i, sectionId, userId, level, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) }));

    const item = (id, sectionId, title, data, editors, collaborators, ageDays) => ({
      id, sectionId, title, data, editors: editors || [], collaborators: collaborators || [], files: [],
      stageChangedAt: stamp(-(ageDays || 0)), createdBy: SAM, createdAt: stamp(-(ageDays || 0) - 2), updatedAt: stamp(-(ageDays || 0)),
    });
    const H = 'hafiz@example.com', M = 'mei@example.com', T = 'siti@example.com', D = 'daniel@example.com', R = 'raj@example.com';
    const pad = (n) => String(n).padStart(3, '0');
    const opt = (n) => (n === null ? '' : day(n));

    const client = (n, title, code, sector, contact, status, expiry, age) =>
      item('i_cl' + n, 's_clients', title, { clientCode: code, sector, contact, phone: '', status, vendorRegNo: code === '' ? '' : 'VR-DEMO-' + pad(n), expiryDate: opt(expiry), website: '', notes: '' }, [H], [], age);
    const items = [
      client(1, 'Client A (example)', 'CLA', 'oilgas', 'Mr Azman', 'active', 210, 90),
      client(2, 'Client B (example)', 'CLB', 'petchem', 'Ms Chong', 'active', 20, 90),
      client(3, 'Client C (example)', 'CLC', 'utilities', 'Mr Ravi', 'active', 400, 60),
      client(4, 'Client D (example)', 'CLD', 'oilgas', 'Ms Lim', 'prospect', null, 12),
      client(5, 'Client E (example)', 'CLE', 'government', 'Encik Hamdan', 'dormant', -10, 120),
    ];

    const ct = (n, title, clientId, type, owner, stage, value, claimed, start, end, terms, age) =>
      item('i_ct' + n, 's_contracts', title, { contractNo: 'CT-DEMO-' + pad(n), client: clientId, contractType: type, owner, stage, contractValue: value, claimedToDate: claimed, startDate: day(start), endDate: day(end), paymentTerms: terms, notes: '' }, [owner, H], [], age);
    items.push(
      ct(1, 'Maintenance of fire & gas systems — 3 years', 'i_cl1', 'service', M, 'active', 4200000, 1850000, -400, 695, '30d', 40),
      ct(2, 'Supply of valves & fittings — frame agreement', 'i_cl2', 'frame', H, 'active', 1500000, 620000, -200, 165, '60d', 30),
      ct(3, 'Insulation & painting call-out services', 'i_cl1', 'frame', M, 'renewal', 2800000, 2410000, -1050, 25, '30d', 9),
      ct(4, 'Control room upgrade — EPCC', 'i_cl3', 'project', H, 'awarded', 3650000, 0, 14, 380, 'milestone', 3),
      ct(5, 'Scaffolding services — 2 years', 'i_cl4', 'service', M, 'negotiation', 900000, 0, 30, 760, '30d', 16),
      ct(6, 'Calibration services 2023–2025', 'i_cl2', 'service', H, 'completed', 480000, 480000, -1100, -30, '30d', 28),
    );

    const wo = (n, title, ctId, location, supervisor, stage, priority, start, due, progress, value, age, eds) =>
      item('i_wo' + n, 's_orders', title, { woNo: 'WO-DEMO-' + pad(n), contract: ctId, location, supervisor, stage, priority, startDate: day(start), dueDate: day(due), progress, woValue: value, notes: '' }, eds || [D, M], [H], age);
    items.push(
      wo(1, 'Quarterly F&G detector testing — Platform A', 'i_ct1', 'Offshore Platform A', D, 'in_progress', 'high', -10, 5, 60, 185000, 10),
      wo(2, 'Replace 12 gas detectors — Platform B', 'i_ct1', 'Offshore Platform B', D, 'planning', 'urgent', 3, 20, 0, 96000, 6.5),
      wo(3, 'Insulation repair — pipe rack Area 3', 'i_ct3', 'Onshore terminal', D, 'completed', 'normal', -40, -3, 100, 142000, 3, [D, M, R]),
      wo(4, 'Painting of storage tank T-102', 'i_ct3', 'Onshore terminal', D, 'on_hold', 'high', -20, -2, 35, 230000, 9),
      wo(5, 'Supply of 40 ball valves', 'i_ct2', 'Kemaman supply base', H, 'closed', 'normal', -60, -30, 100, 128000, 25, [M]),
      wo(6, 'Emergency call-out — F&G panel fault', 'i_ct1', 'Offshore Platform A', D, 'received', 'urgent', 1, 2, 0, 18500, 0.3),
      wo(7, 'Supply of gate valves — batch 2', 'i_ct2', 'Kemaman supply base', H, 'in_progress', 'normal', -5, 12, 50, 74000, 5, [M]),
    );

    const vo = (n, title, ctId, woId, stage, submitted, approved, subDate, due, age) =>
      item('i_vo' + n, 's_vos', title, { voNo: 'VO-DEMO-' + pad(n), contract: ctId, order: woId, stage, submittedValue: submitted, approvedValue: approved, submittedDate: opt(subDate), responseDue: day(due), notes: '' }, [H], [M], age);
    items.push(
      vo(1, 'Additional scaffolding for tank T-102', 'i_ct3', 'i_wo4', 'submitted', 48000, 0, -16, -2, 16),
      vo(2, 'Extra 6 detectors at Platform B', 'i_ct1', 'i_wo2', 'negotiation', 52000, 0, -9, 5, 4),
      vo(3, 'Change insulation spec to aerogel blanket', 'i_ct3', 'i_wo3', 'approved', 86000, 79500, -45, -20, 20),
      vo(4, 'Night-shift premium for emergency call-out', 'i_ct1', 'i_wo6', 'identified', 0, 0, null, 7, 0.2),
    );

    const claim = (n, title, ctId, woId, status, amount, certified, retention, paid, inv, claimDate, due, paidDate, age) =>
      item('i_pc' + n, 's_claims', title, { claimNo: 'PC-DEMO-' + pad(n), contract: ctId, order: woId, status, claimAmount: amount, certifiedAmount: certified, retention, paidAmount: paid, invoiceNo: inv, claimDate: day(claimDate), dueDate: day(due), paidDate: opt(paidDate), notes: '' }, [T], [H], age);
    items.push(
      claim(14, 'Progress claim 14 — F&G maintenance (Sep)', 'i_ct1', '', 'paid', 152000, 152000, 7600, 144400, 'INV-DEMO-2210', -55, -25, -27, 27),
      claim(15, 'Progress claim 15 — F&G maintenance (Oct)', 'i_ct1', 'i_wo1', 'certified', 168000, 161500, 8075, 0, '', -12, 18, null, 2),
      claim(16, 'Insulation repair Area 3 — final claim', 'i_ct3', 'i_wo3', 'preparing', 142000, 0, 0, 0, '', -1, 29, null, 2.5),
      claim(17, 'Ball valves — delivery claim', 'i_ct2', 'i_wo5', 'invoiced', 128000, 128000, 0, 0, 'INV-DEMO-2231', -28, -2, null, 20),
      claim(18, 'Tank T-102 painting — 30% progress', 'i_ct3', 'i_wo4', 'disputed', 69000, 52000, 2600, 0, '', -15, 15, null, 6),
      claim(19, 'Calibration — retention release', 'i_ct6', '', 'submitted', 24000, 0, 0, 0, '', -9, 21, null, 9),
    );

    const bond = (n, title, type, ref, ctId, issuer, status, amount, issued, expiry, age) =>
      item('i_bd' + n, 's_bonds', title, { bondType: type, refNo: ref, contract: ctId, issuer, status, amount, issueDate: day(issued), expiryDate: day(expiry), notes: '' }, [H], [T], age);
    items.push(
      bond(1, 'Performance bond — CT-DEMO-001', 'pb', 'BG-DEMO-7781', 'i_ct1', 'Bank A (example)', 'active', 420000, -400, 755, 60),
      bond(2, 'Performance bond — CT-DEMO-003', 'pb', 'BG-DEMO-6620', 'i_ct3', 'Bank A (example)', 'renewal', 280000, -1050, 12, 9),
      bond(3, 'Contractor all-risk insurance — control room', 'insurance', 'POL-DEMO-1182', 'i_ct4', 'Insurer B (example)', 'active', 3650000, -5, 380, 5),
      bond(4, 'PETRONAS licence (SWEC)', 'cert', 'LIC-DEMO-0045', '', 'Licensing authority', 'active', 0, -700, 28, 60),
      bond(5, 'CIDB G7 registration', 'cert', 'CIDB-DEMO-11', '', 'CIDB', 'expired', 0, -1100, -6, 6),
      bond(6, 'Performance bond — CT-DEMO-006', 'pb', 'BG-DEMO-5104', 'i_ct6', 'Bank A (example)', 'released', 48000, -1100, -30, 28),
    );

    const rep = (n, title, no, type, ctId, woId, status, sla, score, date, due, age, cols) =>
      item('i_rp' + n, 's_reports', title, { reportNo: no, reportType: type, contract: ctId, order: woId, status, sla, score, reportDate: day(date), dueDate: day(due), notes: '' }, [M], cols || [D], age);
    items.push(
      rep(1, 'F&G monthly KPI review — September', 'KPI-DEMO-09', 'kpi', 'i_ct1', '', 'signed', 'met', 96, -25, -20, 20),
      rep(2, 'F&G monthly KPI review — October', 'KPI-DEMO-10', 'kpi', 'i_ct1', '', 'pending', '', '', -1, 4, 1),
      rep(3, 'Service report — detector testing Platform A', 'SR-DEMO-041', 'sr', 'i_ct1', 'i_wo1', 'submitted', 'met', '', -3, 4, 3),
      rep(4, 'Client NCR — late response to call-out', 'NCR-DEMO-003', 'ncr', 'i_ct1', 'i_wo6', 'action', 'missed', '', -4, -1, 4),
      rep(5, 'Service report — insulation Area 3', 'SR-DEMO-042', 'sr', 'i_ct3', 'i_wo3', 'signed', 'met', '', -3, 0, 2, [D, R]),
    );
    return { users, sections, access, items, comments: [] };
  }

  function demoStore() {
    let db = null;
    function load() {
      if (db) return db;
      try { db = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { db = null; }
      if (!db || !Array.isArray(db.sections)) db = seed();
      ['users', 'sections', 'access', 'items', 'comments'].forEach((t) => { if (!Array.isArray(db[t])) db[t] = []; });
      persist();
      return db;
    }
    function persist() { try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch (e) { /* blocked */ } }
    const noDrive = () => Core.fail('DEMO', 'Attachments are saved to Google Drive. They start working after the Google setup in README.md.');
    return {
      all: (t) => clone(load()[t]),
      insert: (t, rec) => { load()[t].push(clone(rec)); persist(); },
      insertMany: (t, recs) => { load()[t].push(...clone(recs)); persist(); },
      save: (t, rec) => {
        const rows = load()[t];
        const i = rows.findIndex((r) => r.id === rec.id);
        if (i < 0) throw Core.fail('NOT_FOUND', 'This record no longer exists.');
        rows[i] = clone(rec);
        persist();
      },
      del: (t, id) => { db[t] = load()[t].filter((r) => r.id !== id); persist(); },
      delWhere: (t, fn) => { db[t] = load()[t].filter((r) => !fn(r)); persist(); },
      now: () => new Date().toISOString(),
      uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      saveFile: () => { throw noDrive(); },
      readFile: () => { throw noDrive(); },
      reset: () => { try { localStorage.removeItem(DEMO_KEY); } catch (e) { /* blocked */ } db = null; },
    };
  }

  const store = demoStore();

  const Demo = {
    mode: 'demo',
    me: null,

    restore() {
      const email = ssGet(DEMO_USER);
      if (!email) return false;
      try { this.me = Core.identify(store, email, ''); } catch (e) { this.me = null; ssSet(DEMO_USER, null); }
      return !!this.me;
    },
    login(email) {
      this.me = Core.identify(store, email, '');
      ssSet(DEMO_USER, email);
    },
    logout() { this.me = null; ssSet(DEMO_USER, null); },
    accounts() {
      return store.all('users').filter((u) => u.active !== false)
        .map((u) => ({ id: u.id, name: u.name, note: DEMO_ACCOUNTS[u.id] || 'Added in this demo' }));
    },
    async call(action, payload) {
      if (!this.me) throw Core.fail('AUTH_REQUIRED', 'Please sign in.');
      // Re-check the account each call, like the server does
      this.me = Core.identify(store, this.me.id, '');
      return clone(Core.handle(store, this.me, action, payload || {}));
    },
    async upload(id, file) {
      return this.call('item.upload', { id, fileName: file.name, mimeType: file.type, base64: '' });
    },
    reset() { store.reset(); this.logout(); },
  };

  // On this computer, http://localhost:8765/?demo forces demo mode for testing.
  // &reset starts from fresh example data; &as=<email> signs in as that example account (used to record the user guide).
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const params = new URLSearchParams(location.search);
  const forceDemo = local && params.has('demo');
  if (forceDemo && params.has('reset')) store.reset();
  if (forceDemo && params.get('as')) { try { Demo.login(params.get('as')); } catch (e) { /* unknown example account */ } }
  Demo.clean = forceDemo && params.has('clean'); // hide the demo banner for user-guide screenshots
  window.API = CFG.API_URL && !forceDemo ? Remote : Demo;
})();
