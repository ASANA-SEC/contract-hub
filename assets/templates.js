// Starter templates for new sections. Once a section is created its columns live in the
// Google Sheet and are edited in the app (Customize), so changing this file only affects
// sections created afterwards. `target` on a link column names another template id; it is
// matched to the section created from that template, so a template must come after the
// ones it links to.
(function () {
  'use strict';
  const o = (value, label, color, extra) => Object.assign({ value, label, color }, extra || {});
  const title = (label) => ({ key: 'title', label, type: 'text', required: true, system: true, onCard: true });

  const priority = () => ({ key: 'priority', label: 'Priority', type: 'select', onCard: true, options: [o('normal', 'Normal', 'gray'), o('high', 'High', 'amber'), o('urgent', 'Urgent', 'red')] });
  const contract = () => ({ key: 'contract', label: 'Contract', type: 'link', target: 'contracts', onCard: true });

  window.TEMPLATES = [
    {
      id: 'clients',
      name: 'Client Register',
      blurb: 'Clients with contact, sector and vendor registration expiry.',
      stageField: 'status',
      fields: [
        title('Client name'),
        { key: 'clientCode', label: 'Client code', type: 'text', onCard: true },
        { key: 'sector', label: 'Sector', type: 'select', onCard: true, options: [o('oilgas', 'Oil & Gas', 'blue'), o('petchem', 'Petrochemical', 'purple'), o('utilities', 'Utilities / Power', 'teal'), o('government', 'Government / GLC', 'amber'), o('other', 'Others', 'gray')] },
        { key: 'contact', label: 'Contact person', type: 'text' },
        { key: 'phone', label: 'Phone / email', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('prospect', 'Prospect', 'amber', { alertDays: 30 }),
          o('active', 'Active Client', 'green'),
          o('dormant', 'Dormant', 'gray'),
          o('inactive', 'Inactive', 'gray', { done: true }),
        ] },
        { key: 'vendorRegNo', label: 'Our vendor reg. no. (with client)', type: 'text' },
        { key: 'expiryDate', label: 'Vendor registration expiry', type: 'date', due: true, onCard: true },
        { key: 'website', label: 'Website / vendor portal', type: 'url' },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'contracts',
      name: 'Contracts Register',
      blurb: 'Every contract from award to completion, with value, period and claimed to date.',
      stageField: 'stage',
      fields: [
        title('Contract title'),
        { key: 'contractNo', label: 'Contract / PO no.', type: 'text', required: true, onCard: true },
        { key: 'client', label: 'Client', type: 'link', target: 'clients', onCard: true },
        { key: 'contractType', label: 'Contract type', type: 'select', onCard: true, options: [o('supply', 'Supply', 'blue'), o('service', 'Service / Maintenance', 'teal'), o('project', 'Project / EPCC', 'purple'), o('frame', 'Frame Agreement / Call-out', 'amber')] },
        { key: 'owner', label: 'Contract owner (PM)', type: 'person', onCard: true },
        { key: 'stage', label: 'Stage', type: 'select', options: [
          o('negotiation', 'Under Negotiation', 'amber', { alertDays: 14 }),
          o('awarded', 'Awarded (LOA)', 'blue', { alertDays: 7 }),
          o('active', 'Active', 'green'),
          o('suspended', 'Suspended', 'red', { alertDays: 14 }),
          o('renewal', 'Renewal / Extension', 'purple', { alertDays: 14 }),
          o('completed', 'Completed', 'teal', { done: true }),
          o('terminated', 'Terminated', 'gray', { done: true }),
        ] },
        { key: 'contractValue', label: 'Contract value', type: 'currency', total: true, onCard: true },
        { key: 'claimedToDate', label: 'Claimed to date', type: 'currency', total: true },
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'endDate', label: 'End / expiry date', type: 'date', due: true, onCard: true },
        { key: 'paymentTerms', label: 'Payment terms', type: 'select', options: [o('30d', '30 days', 'blue'), o('60d', '60 days', 'teal'), o('90d', '90 days', 'purple'), o('milestone', 'By milestone', 'amber')] },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'orders',
      name: 'Service / Work Orders',
      blurb: 'Work orders and call-outs under each contract, from receipt to completion and claim.',
      stageField: 'stage',
      fields: [
        title('Scope of work'),
        { key: 'woNo', label: 'WO / SO no.', type: 'text', required: true, onCard: true },
        contract(),
        { key: 'location', label: 'Location / site', type: 'text', onCard: true },
        { key: 'supervisor', label: 'Site supervisor', type: 'person' },
        { key: 'stage', label: 'Stage', type: 'select', options: [
          o('received', 'Received', 'gray', { alertDays: 2 }),
          o('planning', 'Planning / Mobilising', 'amber', { alertDays: 5 }),
          o('in_progress', 'In Progress', 'blue'),
          o('on_hold', 'On Hold', 'red', { alertDays: 7 }),
          o('completed', 'Completed — to claim', 'teal', { alertDays: 5 }),
          o('closed', 'Closed (claimed)', 'green', { done: true }),
          o('cancelled', 'Cancelled', 'gray', { done: true }),
        ] },
        priority(),
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'dueDate', label: 'Target completion', type: 'date', due: true, onCard: true },
        { key: 'progress', label: 'Progress', type: 'percent' },
        { key: 'woValue', label: 'WO value', type: 'currency', total: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'variations',
      name: 'Variation Orders',
      blurb: 'Changes to scope or value, from identification to client approval.',
      stageField: 'stage',
      fields: [
        title('Variation description'),
        { key: 'voNo', label: 'VO no.', type: 'text', required: true, onCard: true },
        contract(),
        { key: 'order', label: 'Work order', type: 'link', target: 'orders' },
        { key: 'stage', label: 'Stage', type: 'select', options: [
          o('identified', 'Identified', 'gray', { alertDays: 3 }),
          o('preparing', 'Preparing Quotation', 'amber', { alertDays: 5 }),
          o('submitted', 'Submitted to Client', 'blue', { alertDays: 14 }),
          o('negotiation', 'Under Negotiation', 'purple', { alertDays: 7 }),
          o('approved', 'Approved', 'green', { done: true }),
          o('rejected', 'Rejected', 'red', { done: true }),
          o('withdrawn', 'Withdrawn', 'gray', { done: true }),
        ] },
        { key: 'submittedValue', label: 'Submitted value', type: 'currency', total: true, onCard: true },
        { key: 'approvedValue', label: 'Approved value', type: 'currency', total: true, onCard: true },
        { key: 'submittedDate', label: 'Submitted on', type: 'date' },
        { key: 'responseDue', label: 'Client response due', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'claims',
      name: 'Progress Claims & Payments',
      blurb: 'Claims from preparation and client certification to invoice and payment.',
      stageField: 'status',
      fields: [
        title('Claim description'),
        { key: 'claimNo', label: 'Claim no.', type: 'text', required: true, onCard: true },
        contract(),
        { key: 'order', label: 'Work order', type: 'link', target: 'orders' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('preparing', 'Preparing', 'gray', { alertDays: 3 }),
          o('submitted', 'Submitted', 'amber', { alertDays: 7 }),
          o('certified', 'Certified by Client', 'blue', { alertDays: 3 }),
          o('invoiced', 'Invoiced', 'purple'),
          o('partial', 'Partially Paid', 'teal'),
          o('disputed', 'Disputed', 'red'),
          o('paid', 'Paid', 'green', { done: true }),
        ] },
        { key: 'claimAmount', label: 'Claim amount', type: 'currency', total: true, onCard: true },
        { key: 'certifiedAmount', label: 'Certified amount', type: 'currency', total: true },
        { key: 'retention', label: 'Retention held', type: 'currency', total: true },
        { key: 'paidAmount', label: 'Paid', type: 'currency', total: true },
        { key: 'invoiceNo', label: 'Invoice no.', type: 'text' },
        { key: 'claimDate', label: 'Claim date', type: 'date' },
        { key: 'dueDate', label: 'Payment due', type: 'date', due: true, onCard: true },
        { key: 'paidDate', label: 'Paid on', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'bonds',
      name: 'Bonds, Insurance & Licences',
      blurb: 'Performance bonds, guarantees, insurance and licences, with expiry alerts.',
      stageField: 'status',
      fields: [
        title('Description'),
        { key: 'bondType', label: 'Type', type: 'select', onCard: true, options: [o('pb', 'Performance Bond', 'blue'), o('apg', 'Advance Payment Guarantee', 'purple'), o('insurance', 'Insurance Policy', 'teal'), o('licence', 'Licence / Permit', 'amber'), o('cert', 'Certificate (CIDB / PETRONAS / ISO)', 'gray')] },
        { key: 'refNo', label: 'Policy / ref. no.', type: 'text', onCard: true },
        { key: 'contract', label: 'Contract', type: 'link', target: 'contracts' },
        { key: 'issuer', label: 'Bank / insurer / authority', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('active', 'Active', 'green'),
          o('renewal', 'Renewal in Progress', 'amber', { alertDays: 7 }),
          o('expired', 'Expired', 'red'),
          o('released', 'Released / Closed', 'gray', { done: true }),
        ] },
        { key: 'amount', label: 'Amount / sum insured', type: 'currency', total: true, onCard: true },
        { key: 'issueDate', label: 'Issued on', type: 'date' },
        { key: 'expiryDate', label: 'Expiry date', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'reports',
      name: 'Service Reports & SLA / KPI',
      blurb: 'Service reports, monthly KPI / SLA reviews and client complaints, to sign-off.',
      stageField: 'status',
      fields: [
        title('Report / KPI item'),
        { key: 'reportNo', label: 'Report no.', type: 'text', onCard: true },
        { key: 'reportType', label: 'Type', type: 'select', onCard: true, options: [o('sr', 'Service Report', 'blue'), o('kpi', 'Monthly KPI / SLA Review', 'purple'), o('ncr', 'Client NCR / Complaint', 'red'), o('feedback', 'Customer Feedback', 'teal')] },
        contract(),
        { key: 'order', label: 'Work order', type: 'link', target: 'orders' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('pending', 'Pending', 'gray', { alertDays: 2 }),
          o('submitted', 'Submitted to Client', 'amber', { alertDays: 7 }),
          o('action', 'Action Required', 'red', { alertDays: 3 }),
          o('signed', 'Signed / Accepted', 'green', { done: true }),
          o('closed', 'Closed', 'gray', { done: true }),
        ] },
        { key: 'sla', label: 'SLA result', type: 'select', onCard: true, options: [o('met', 'Met', 'green'), o('missed', 'Missed', 'red'), o('na', 'N/A', 'gray')] },
        { key: 'score', label: 'KPI score', type: 'percent' },
        { key: 'reportDate', label: 'Report date', type: 'date' },
        { key: 'dueDate', label: 'Due to client', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
  ];

  /** A new section's settings from a template, with link columns pointed at existing sections. */
  window.sectionFromTemplate = function (tpl, sections) {
    const fields = JSON.parse(JSON.stringify(tpl.fields)).map((f) => {
      if (f.type === 'link') {
        const t = sections.find((s) => s.template === f.target && !s.archived);
        f.target = t ? t.id : '';
      }
      return f;
    });
    return { name: tpl.name, template: tpl.id, fields, stageField: tpl.stageField };
  };
})();
