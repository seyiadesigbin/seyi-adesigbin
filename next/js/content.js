/*
 * Single source of truth for everything written on the site.
 * Both views (Desk and Report) read from this object, so a change here
 * shows up in both. Copied from the existing site; edit freely.
 *
 * Loaded as a plain script (not an ES module) so the site also works
 * when index.html is opened straight from disk.
 */
window.SITE = {
  name: "Seyi Adesigbin",
  shortName: "Seyi",
  tagline: "Data analyst and designer.",
  intro:
    "I take messy numbers from health systems and turn them into pages people actually read.",
  // Text on the round sticker on the Desk. Set to null to remove the sticker.
  sticker: "Open to work",

  // One-time pop-up with the avatar. "desk" / "report" text is chosen by the view the visitor is in; the button
  // offers the other view. Set popup to null to remove it.
  popup: {
    greeting: "Hi, I'm Seyi.",
    desk: "You're looking at my desk. Prefer a plain report?",
    report: "This is the report view. Want to see the desk instead?",
    toReport: "Show the report",
    toDesk: "Show the desk",
    close: "Close"
  },

  // Report view copy. The headline's middle line is shown in the accent colour.
  reportHeadline: ["Seyi", "turns data", "into sense."],
  heroTags: ["Analyst", "Designer"],

  threeWords: ["Excellence", "Integrity", "Creativity"],

  contact: {
    email: "oluwaseyiadesigbin@gmail.com",
    // "e164" is the dialling form used in tel: links (digits after +, no spaces); "display" is what visitors read.
    // The UK number was given as +44 07344 060334; the trunk "0" is dropped in international format.
    // Only the UK number is used. The Nigerian numbers were dropped (owner's decision). "showNumber: false" shows only
    // the call and WhatsApp icons; the number stays inside the links (and in their hover text).
    phones: [
      { label: "Call or WhatsApp", display: "+44 7344 060334", e164: "+447344060334", call: true, whatsapp: true, showNumber: false }
    ],
    // Not linked on the old site either (href was empty). Add a path like "assets/resume.pdf" when ready.
    resume: null,
    // Web3Forms access key (web3forms.com). It is meant to be public. While it is null, the contact form is
    // simply not shown and only the links appear.
    formKey: "2576dc25-7eeb-429a-af25-423123084e76",
    formSubject: "New message from your website",

    linkedin: "https://www.linkedin.com/in/seyiadesigbin/",
    instagram: "https://www.instagram.com/seyiadesigbin/"
  },

  expertise: [
    {
      title: "Data Analysis",
      text: "Over four years of quantitative data analysis, turning complex data into actionable insights that drive informed decisions."
    },
    {
      title: "Graphics Design",
      text: "Turning data into visually compelling content: presentations, infographics, brochures and concept notes."
    },
    {
      title: "IT Tech Support",
      text: "Troubleshooting and resolving software issues on Windows and Ubuntu."
    },
    {
      title: "Video Editing",
      text: "A few months of editing engaging video content, including adverts and event highlights."
    },
    {
      title: "Church Media",
      text: "Live streaming and screen projection production for a seamless worship experience."
    }
  ],

  // Years are used by the Report timeline. "country" picks the flag (NG or GB), "place" is the text shown with it.
  // "kind" is optional: "Study" marks study rather than a job.
  // Months are not recorded yet; they will come from the career-hub details. "start"/"end" are calendar years.
  experience: [
    {
      org: "Heriot-Watt University",
      role: "MSc Data Science",
      country: "GB",
      place: "Scotland, UK",
      kind: "Study",
      start: 2026,
      end: 2027,
      text: "January 2026 to May 2027 (expected)."
    },
    {
      org: "UNICEF Nigeria",
      role: "Infographics Design Analyst",
      country: "NG",
      place: "Nigeria",
      start: 2024,
      end: 2025,
      text: "Design high-quality infographics, reports and brochures that communicate critical insights and updates on initiatives for child protection and well-being in Nigeria."
    },
    {
      org: "ACE Strategy and Consults",
      role: "Data Analyst",
      country: "NG",
      place: "Nigeria",
      start: 2023,
      end: 2024,
      text: "Extracted, cleaned and analysed data from 3,400 health facilities across Kaduna and Kano states, and built a model projecting the impact of scaling up the EMOTIVE trial across primary and secondary health care facilities."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "Digital Health Specialist",
      country: "NG",
      place: "Nigeria",
      start: 2023,
      end: 2023,
      text: "Conducted 21 key informant interviews and assessed 25 telehealth platforms in Lagos, uncovering trends, challenges and opportunities, and delivering insights for strategic decisions and programme implementation."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "Healthcare Data Analyst",
      country: "NG",
      place: "Nigeria",
      start: 2019,
      end: 2022,
      text: "Analysed data for 10,000+ ART patients, achieving 95% retention, and supported data assistants with software and hardware issues."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "IT Support Intern",
      country: "NG",
      place: "Nigeria",
      start: 2019,
      end: 2019,
      text: "Delivered technical support and troubleshooting to staff, resolving software-related issues."
    }
  ],

  // Headline numbers, all taken from the experience text above.
  stats: [
    { value: 3400, label: "health facilities analysed across Kaduna and Kano" },
    { value: 10000, plus: true, label: "ART patients' data analysed" },
    { value: 95, suffix: "%", label: "patient retention achieved" },
    { value: 25, label: "telehealth platforms assessed in Lagos" },
    { value: 21, label: "key informant interviews conducted" }
  ],

  // "weight" (1-3) is a placeholder for how prominent a tool looks in the Report. You decide the real values.
  tools: [
    { name: "Excel", weight: 3 },
    { name: "Tableau", weight: 2 },
    { name: "Python", weight: 1 },
    { name: "SQL", weight: 1 },
    { name: "Illustrator", weight: 3 },
    { name: "InDesign", weight: 2 },
    { name: "PowerPoint", weight: 2 },
    { name: "Canva", weight: 1 },
    { name: "DaVinci Resolve", weight: 1 },
    { name: "CapCut", weight: 1 },
    { name: "Filmora", weight: 1 },
    { name: "OBS Studio", weight: 1 },
    { name: "vMix", weight: 1 },
    { name: "ProPresenter", weight: 1 },
    { name: "EasyWorship", weight: 1 }
  ]
};
