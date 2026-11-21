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
     families link devices with a private Family Sync Code. Progress is encrypted
     on the device first; the script stores only the locked copy. */
  accountEndpoint: "https://script.google.com/macros/s/AKfycbx8GBasakjcxFhWnzYCnfu3WK4us_adJecdrOW8IUMFHsXrD1okLhQeWkPb2T4h-BRA7A/exec",
  studioName: "Engage Lifestyle Martial Arts",
  studioSite: "https://engagemartialarts.com"
};
