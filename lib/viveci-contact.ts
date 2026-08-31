const DEFAULT_VIVECI_WHATSAPP_NUMBER = "5511961654397";

export function getViveciWhatsAppNumber() {
  const configuredNumber = process.env.VIVECI_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return configuredNumber && /^55\d{10,11}$/.test(configuredNumber)
    ? configuredNumber
    : DEFAULT_VIVECI_WHATSAPP_NUMBER;
}
