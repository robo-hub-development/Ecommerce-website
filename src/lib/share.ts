// Third-party share endpoints live here, not in components.
const WHATSAPP_SHARE_URL = "https://wa.me/";

export const whatsappShareUrl = (text: string, url: string) =>
  `${WHATSAPP_SHARE_URL}?text=${encodeURIComponent(`${text} ${url}`)}`;
