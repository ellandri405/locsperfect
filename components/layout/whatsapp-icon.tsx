import { MessageCircle } from "lucide-react";

/** Pictogramme générique (bulle de message) pour les accès WhatsApp. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return <MessageCircle aria-hidden className={className} />;
}
