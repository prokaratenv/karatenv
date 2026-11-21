/* SETTINGS for the studio — the only file to edit when hosting Brain Dojo.
   leadEndpoints: where Parent Progress Report sign-ups are sent. Paste your
   GoHighLevel inbound webhook URL (and/or a Google Sheet web app URL) in the
   list, in quotes, separated by commas. See README "Parent Progress Report
   sign-up". While the list is empty, the report isn't locked. */
window.BD = window.BD || {};
BD.CONFIG = {
  leadEndpoints: [
    // "https://services.leadconnectorhq.com/hooks/XXXX/webhook-trigger/YYYY",
    "https://services.leadconnectorhq.com/hooks/9kmbGMBnCxQ35koz3RTn/webhook-trigger/fee18662-574a-4203-a874-777aef313690",
    "https://script.google.com/macros/s/AKfycbyP5EiR5NzP9GZ0ccb2Nl8yZcDRMyfoI5WVpOC9zd3Wq1ZLPYselJ22V2fdrAUSgcdV/exec",
  ],
  /* accountEndpoint: the Family Sync web app URL (tools/family-sync.gs). With it,
     parents sign in with their email and progress follows students to any device. */
  accountEndpoint: "https://script.google.com/macros/s/AKfycbwGjo6X4NQ94DZTZ14RSwaOv1MMczA2WuBb7ZrGW2-J9E7QbPsWyS4U4hEj7nh4_pDN3w/exec",
  studioName: "Engage Lifestyle Martial Arts",
  studioSite: "https://engagemartialarts.com"
};
