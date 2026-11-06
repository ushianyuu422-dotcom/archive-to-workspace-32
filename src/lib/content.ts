/** Shared static content for the barangay pages. The barangay can edit these lists any time. */

export type Service = {
  name: string;
  desc: string;
  requirements: string[];
};

export const SERVICES: Service[] = [
  {
    name: "Barangay Clearance",
    desc: "Proof of good standing and residency — commonly needed for jobs, school, and permits.",
    requirements: ["Valid ID", "Community Tax Certificate (cedula)"],
  },
  {
    name: "Barangay Indigency Certificate",
    desc: "Certifies financial hardship for medical, scholarship, or legal aid applications.",
    requirements: ["Valid ID", "Proof of residence"],
  },
  {
    name: "Barangay Business Clearance",
    desc: "Required before applying for a business permit with Taguig City.",
    requirements: ["Valid ID", "Proof of business address", "Cedula"],
  },
  {
    name: "Community Tax Certificate (Cedula)",
    desc: "Issued for individuals and businesses, required for many city transactions.",
    requirements: ["Valid ID"],
  },
  {
    name: "Barangay ID",
    desc: "Photo ID for residents of Wawa, accepted for local transactions.",
    requirements: ["Valid ID", "Proof of residency", "1x1 photo"],
  },
  {
    name: "First-Time Jobseeker Voucher",
    desc: "Free barangay clearance and cedula for first-time job seekers under RA 11261.",
    requirements: ["Valid ID", "Barangay residency"],
  },
  {
    name: "Complaint / Incident Report",
    desc: "File a blotter or report a concern for the barangay to act on.",
    requirements: ["Valid ID", "Details of the incident"],
  },
];

export type Official = { role: string; name: string | null; committee?: string };

/** Names marked "to be confirmed" until the barangay finalizes the roster. */
export const OFFICIALS: Official[] = [
  { role: "Punong Barangay", name: null },
  { role: "Barangay Kagawad", name: null, committee: "Peace and Order" },
  { role: "Barangay Kagawad", name: null, committee: "Health and Sanitation" },
  { role: "Barangay Kagawad", name: null, committee: "Education and Youth" },
  { role: "Barangay Kagawad", name: null, committee: "Infrastructure" },
  { role: "Barangay Kagawad", name: null, committee: "Environment" },
  { role: "Barangay Kagawad", name: null, committee: "Livelihood and Cooperatives" },
  { role: "Barangay Kagawad", name: null, committee: "Sports and Culture" },
  { role: "SK Chairperson", name: null },
  { role: "Barangay Secretary", name: null },
  { role: "Barangay Treasurer", name: null },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What are the barangay hall's office hours?",
    a: "Monday to Friday, 8:00 AM – 5:00 PM. Emergency concerns are handled through the hotlines any time.",
  },
  {
    q: "What do I need for a barangay clearance?",
    a: "A valid ID and your community tax certificate (cedula). Processing is usually same-day during office hours.",
  },
  {
    q: "How do I book the multi-purpose court?",
    a: "Bookings are made in two-hour slots. Once online booking opens, you can pick a slot on this site and pay at the barangay hall.",
  },
  {
    q: "How do I get a PWD ID?",
    a: "Bring your medical abstract or doctor's certificate, a valid ID, and a 1x1 photo to the barangay hall. See the PWD portal for the full step-by-step guide.",
  },
  {
    q: "How do I report a concern in my area?",
    a: "Call the barangay hall hotline or visit the hall to file a report. You can also use the contact page to reach the right office.",
  },
];

export const PWD_GUIDES = [
  {
    title: "Getting a PWD ID",
    steps: [
      "Secure a medical abstract or doctor's certificate stating your disability.",
      "Prepare a valid ID and one 1x1 photo.",
      "Bring these to the barangay hall to be issued a barangay PWD registration.",
      "Proceed to the Taguig City Persons with Disability Affairs Office (PDAO) for the city PWD ID and booklet.",
    ],
  },
  {
    title: "Availing the 20% discount",
    steps: [
      "Present your PWD ID and purchase booklet at the pharmacy or establishment.",
      "Discounts cover medicine, food for special medical needs, and transportation.",
      "You are also VAT-exempt on qualifying purchases — ask the establishment for the computation.",
    ],
  },
  {
    title: "Requesting assistance",
    steps: [
      "Contact the barangay hall and ask for the PWD focal person.",
      "Assistance available includes wheelchair or crutch lending, referrals, and clinic visits.",
    ],
  },
];

export const PWD_BENEFITS = [
  { title: "20% discount + VAT exemption", desc: "On medicines, special medical food, domestic transport, and more, with your PWD ID." },
  { title: "Free medical and dental services", desc: "In government facilities, including consultations and diagnostics where available." },
  { title: "Educational assistance", desc: "For qualified students with disabilities, through the city and DSWD programs." },
  { title: "Wheelchair and mobility aid lending", desc: "Borrowed free of charge from the barangay, subject to availability." },
  { title: "Barangay health check-ups", desc: "Priority scheduling at the barangay health station for PWDs and seniors." },
  { title: "Priority lanes", desc: "Priority service at government offices, banks, and public transport." },
];
