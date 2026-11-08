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
  threeWords: ["Excellence", "Integrity", "Creativity"],

  contact: {
    email: "oluwaseyiadesigbin@gmail.com",
    // "e164" is the dialling form used in tel:/wa.me links (digits after +, no spaces); "display" is what visitors read.
    // The UK number was given as +44 07344 060334; the trunk "0" is dropped in international format.
    phones: [
      { label: "Call and WhatsApp", display: "+44 7344 060334", e164: "+447344060334", call: true, whatsapp: true },
      { label: "WhatsApp only", display: "+234 908 710 9453", e164: "+2349087109453", call: false, whatsapp: true }
    ],
    // Not linked on the old site either (href was empty). Add a path like "assets/resume.pdf" when ready.
    resume: null,
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

  // Years are used by the Report timeline. "start"/"end" are calendar years.
  experience: [
    {
      org: "UNICEF Nigeria",
      role: "Infographics Design Analyst",
      start: 2024,
      end: 2025,
      text: "Design high-quality infographics, reports and brochures that communicate critical insights and updates on initiatives for child protection and well-being in Nigeria."
    },
    {
      org: "ACE Strategy and Consults",
      role: "Data Analyst",
      start: 2023,
      end: 2024,
      text: "Extracted, cleaned and analysed data from 3,400 health facilities across Kaduna and Kano states, and built a model projecting the impact of scaling up the EMOTIVE trial across primary and secondary health care facilities."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "Digital Health Specialist",
      start: 2023,
      end: 2023,
      text: "Conducted 21 key informant interviews and assessed 25 telehealth platforms in Lagos, uncovering trends, challenges and opportunities, and delivering insights for strategic decisions and programme implementation."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "Healthcare Data Analyst",
      start: 2019,
      end: 2022,
      text: "Analysed data for 10,000+ ART patients, achieving 95% retention, and supported data assistants with software and hardware issues."
    },
    {
      org: "Solina Centre for International Development and Research",
      role: "IT Support Intern",
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
