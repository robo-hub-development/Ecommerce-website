/** Single source of truth for business details. Import from here; never retype these values elsewhere. */
export const site = {
  name: "STEM ROBO HUB INDIA",
  shortName: "Robo Hub",
  address: "Ward 11, Magarlod, Main Road, Dhamtari, Chhattisgarh, 493662, India",
  addressParts: {
    street: "Ward 11, Magarlod, Main Road",
    city: "Dhamtari",
    region: "Chhattisgarh",
    postalCode: "493662",
    country: "IN",
  },
  phone: "+91 9407611779",
  phoneHref: "tel:+919407611779",
  email: "stemrobohub@gmail.com",
  emailHref: "mailto:stemrobohub@gmail.com",
  mapsLink:
    "https://www.google.com/maps?cid=17532843070299450930&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF",
  mapsEmbed: "https://maps.google.com/maps?cid=17532843070299450930&output=embed",
} as const;
