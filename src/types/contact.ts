export interface ContactMessageInput {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Honeypot: real users leave it empty. */
  website?: string;
}
