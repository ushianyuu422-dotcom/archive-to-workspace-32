export const SITE = {
  name: "Barangay Wawa United",
  shortName: "Barangay Wawa",
  city: "Taguig City",
  address: "Barangay Hall, Wawa, Taguig City",
  officeHours: "Monday to Friday, 8:00 AM – 5:00 PM",
  email: "wawa.barangay@taguig.example.ph", // placeholder — replace with the real inbox
  facebook: "https://facebook.com/BarangayWawaUnited", // placeholder page URL
};

/** Placeholder hotlines the barangay will fill in. Marked clearly so they are easy to swap. */
export const HOTLINES = {
  national: [
    { label: "National Emergency Hotline", number: "911" },
    { label: "Red Cross", number: "(02) 8790-2300" },
  ],
  taguig: [
    { label: "Taguig City Command Center", number: "(02) 8XXX-XXXX" },
    { label: "Barangay Wawa Hall", number: "(02) 8XXX-XXXX" },
    { label: "Fire Station (BFP Taguig)", number: "(02) 8XXX-XXXX" },
    { label: "Police Station (PNP Taguig)", number: "(02) 8XXX-XXXX" },
    { label: "Taguig Health Center", number: "(02) 8XXX-XXXX" },
  ],
};

export const BOOKING_SLOTS = [
  { start: "06:00", end: "08:00", label: "6:00 – 8:00 AM" },
  { start: "08:00", end: "10:00", label: "8:00 – 10:00 AM" },
  { start: "10:00", end: "12:00", label: "10:00 AM – 12:00 NN" },
  { start: "13:00", end: "15:00", label: "1:00 – 3:00 PM" },
  { start: "15:00", end: "17:00", label: "3:00 – 5:00 PM" },
  { start: "18:00", end: "20:00", label: "6:00 – 8:00 PM" },
] as const;

export const SERVICE_CATEGORIES = ["Events", "Health", "Notices", "Sports"] as const;

export const TRACK_STATUS_HELP: Record<string, string> = {
  submitted: "We received your request. It is in line for review.",
  processing: "Staff are working on it. Check back soon.",
  ready: "It is ready at the barangay hall. Bring a valid ID.",
  released: "Completed and released. Thank you!",
  rejected: "It could not be approved. Please contact the barangay hall for details.",
  received: "We received your report. It is in line for review.",
  under_review: "An official is looking into it.",
  action_taken: "Action has been taken on your concern.",
  closed: "This concern is closed.",
  pending: "Waiting for the barangay to approve this booking.",
  approved: "Your booking is confirmed. Please arrive 10 minutes early.",
  cancelled: "This booking was cancelled.",
  blocked: "This slot is closed for a barangay activity.",
};
