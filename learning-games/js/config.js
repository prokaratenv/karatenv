/* SETTINGS for the studio — the only file to edit when hosting Brain Dojo.
   leadEndpoints: where Parent Progress Report sign-ups are sent. Paste your
   GoHighLevel inbound webhook URL (and/or a Google Sheet web app URL) in the
   list, in quotes, separated by commas. See README "Parent Progress Report
   sign-up". While the list is empty, the report isn't locked. */
window.BD = window.BD || {};
BD.CONFIG = {
  leadEndpoints: [
    // "https://services.leadconnectorhq.com/hooks/XXXX/webhook-trigger/YYYY",
  ],
  studioName: "Engage Lifestyle Martial Arts",
  studioSite: "https://engagemartialarts.com"
};
