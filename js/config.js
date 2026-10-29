/* =====================================================================
   WEDDING CONTENT — edit this file to personalise the whole website.
   Everything on the page (names, dates, events, venue, photos, RSVP,
   WhatsApp number, music) is read from this one object.
   See README.md → "Personalising your invitation" for a full guide.
   ===================================================================== */

window.WEDDING = {
  /* ---------- The couple ---------- */
  couple: {
    bride: "Meera",
    groom: "Arjun",
    // Shown on the envelope seal and footer monogram (keep it short)
    initials: "A & M",
    hashtag: "#ArjunWedsMeera",
    tagline: "Together with their families, joyfully invite you to celebrate their wedding",
  },

  /* ---------- Families ---------- */
  families: {
    groom: {
      title: "The Groom",
      name: "Arjun Malhotra",
      relation: "Son of",
      parents: "Mr. Rajesh Malhotra & Mrs. Sunita Malhotra",
      grandparents: "Grandson of Late Shri Om Prakash Malhotra & Smt. Kamla Malhotra",
      home: "New Delhi",
      photo: "img/groom.png",
    },
    bride: {
      title: "The Bride",
      name: "Meera Iyer",
      relation: "Daughter of",
      parents: "Mr. Venkatesh Iyer & Mrs. Lakshmi Iyer",
      grandparents: "Granddaughter of Shri R. Subramaniam & Smt. Janaki Subramaniam",
      home: "Chennai",
      photo: "img/bride.png",
    },
  },

  /* ---------- Main wedding moment (used by the countdown) ----------
     Use ISO format with the time zone offset. India is +05:30. */
  weddingDateTime: "2027-02-13T19:30:00+05:30",
  displayDate: "Saturday, 13 February 2027",
  city: "Udaipur, Rajasthan",

  /* ---------- Hero / couple image ---------- */
  heroPhoto: "img/couple.png",

  /* ---------- Our Story carousel ----------
     Add, remove or reorder slides freely. Photos live in /img. */
  story: [
    {
      photo: "img/story-1.png",
      date: "June 2021",
      title: "The First Hello",
      caption: "A rainy afternoon, one shared table at a crowded Bandra café, and a conversation over masala chai that neither of us wanted to end.",
    },
    {
      photo: "img/story-2.png",
      date: "December 2022",
      title: "Sunsets on Marine Drive",
      caption: "Long walks by the sea became our favourite ritual — the city lights, the salty breeze, and plans for a lifetime whispered along the way.",
    },
    {
      photo: "img/story-3.png",
      date: "March 2025",
      title: "The Proposal",
      caption: "Under fairy lights and marigold garlands in Meera's grandmother's garden, Arjun asked the question. She said yes before he finished.",
    },
    {
      photo: "img/story-4.png",
      date: "February 2027",
      title: "Forever Begins",
      caption: "Now, with the blessings of our families, we begin our forever — and we would love for you to be there with us.",
    },
  ],

  /* ---------- Events ----------
     start / end use ISO format with the time zone offset.
     "venueKey" points at an entry in `venues` below.
     "theme" controls the card colour accent: mehendi | haldi | wedding | reception */
  events: [
    {
      id: "mehendi",
      name: "Mehendi",
      theme: "mehendi",
      start: "2027-02-12T16:00:00+05:30",
      end: "2027-02-12T21:00:00+05:30",
      venueKey: "lawns",
      dressCode: "Shades of green & florals",
      description: "An evening of henna, music and dholki as we paint the bride's hands with stories and love.",
    },
    {
      id: "haldi",
      name: "Haldi",
      theme: "haldi",
      start: "2027-02-13T10:00:00+05:30",
      end: "2027-02-13T13:00:00+05:30",
      venueKey: "courtyard",
      dressCode: "Yellow & marigold hues",
      description: "A joyful morning of turmeric, laughter and blessings — come ready to get a little golden!",
    },
    {
      id: "wedding",
      name: "Wedding",
      theme: "wedding",
      start: "2027-02-13T19:30:00+05:30",
      end: "2027-02-13T23:30:00+05:30",
      venueKey: "palace",
      dressCode: "Traditional Indian finery",
      description: "The baraat arrives at dusk, followed by the pheras under the stars as we take our seven vows.",
    },
    {
      id: "reception",
      name: "Reception",
      theme: "reception",
      start: "2027-02-14T19:00:00+05:30",
      end: "2027-02-14T23:59:00+05:30",
      venueKey: "ballroom",
      dressCode: "Black tie / Indo-western glam",
      description: "An elegant evening of dinner, dancing and toasts to celebrate the newlyweds.",
    },
  ],

  /* ---------- Venues ----------
     "mapQuery" is what Google Maps searches for — a full address or a
     place name works best. "address" is what guests see. */
  venues: {
    palace: {
      name: "The Leela Palace Udaipur",
      address: "Lake Pichola, Udaipur, Rajasthan 313001",
      mapQuery: "The Leela Palace Udaipur, Lake Pichola, Udaipur",
    },
    lawns: {
      name: "Lakeside Lawns, The Leela Palace",
      address: "Lake Pichola, Udaipur, Rajasthan 313001",
      mapQuery: "The Leela Palace Udaipur, Lake Pichola, Udaipur",
    },
    courtyard: {
      name: "Marigold Courtyard, The Leela Palace",
      address: "Lake Pichola, Udaipur, Rajasthan 313001",
      mapQuery: "The Leela Palace Udaipur, Lake Pichola, Udaipur",
    },
    ballroom: {
      name: "Grand Ballroom, The Leela Palace",
      address: "Lake Pichola, Udaipur, Rajasthan 313001",
      mapQuery: "The Leela Palace Udaipur, Lake Pichola, Udaipur",
    },
  },

  // The venue shown with the large map in the "Venue" section
  mainVenueKey: "palace",
  travelNotes: [
    { label: "Nearest airport", value: "Maharana Pratap Airport (UDR) — 35 min drive" },
    { label: "Stay", value: "Rooms are reserved for guests at the venue. Mention the wedding when booking." },
    { label: "Transfers", value: "Shuttles run from the airport on 12 & 13 February." },
  ],

  /* ---------- RSVP ----------
     WhatsApp number in international format, digits only:
     country code + number, no "+", spaces or dashes. e.g. India 98765 43210 → "919876543210" */
  rsvp: {
    whatsappNumber: "919876543210",
    contactName: "Arjun & Meera",
    deadline: "Please respond by 15 January 2027",
    maxGuests: 10,
  },

  /* ---------- Background music ----------
     Put an MP3 in /music and set its path here. If the file is missing,
     a soft built-in instrumental melody plays instead, so the button
     always works. Set enabled:false to hide the music button entirely. */
  music: {
    enabled: true,
    src: "music/wedding-theme.mp3",
    title: "Background music",
    playOnOpen: true, // false = wait for the guest to press the music button
  },
};
