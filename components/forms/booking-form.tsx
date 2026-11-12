"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { services } from "@/data/services";
import { findZoneByLocality, travelZones } from "@/data/locations";
import { formatFcfa } from "@/lib/format";
import {
  formatDateFr,
  todayIso,
  validateComment,
  validateFutureDate,
  validateName,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import { buildProjectMessage, whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";

const OTHER_LOCALITY = "Autre localité";
const serviceChoices = [...services.map((s) => s.name), "Reprise ou entretien", "Autre demande"];

type Values = { name: string; phone: string; service: string; locality: string; date: string; comment: string };
type Errors = Partial<Record<keyof Values, string>>;

const initial: Values = { name: "", phone: "", service: "", locality: "", date: "", comment: "" };

function validate(v: Values): Errors {
  const errors: Errors = {};
  const add = (key: keyof Values, message: string | null) => {
    if (message) errors[key] = message;
  };
  add("name", validateName(v.name));
  add("phone", validatePhone(v.phone));
  add("service", validateRequired(v.service, "Choisis une prestation."));
  add("locality", validateRequired(v.locality, "Choisis ta localité."));
  add("date", validateFutureDate(v.date, todayIso()));
  add("comment", validateComment(v.comment));
  return errors;
}

function travelText(locality: string): string | null {
  if (!locality) return null;
  const zone = findZoneByLocality(locality);
  if (!zone) return "Frais de déplacement sur devis.";
  return zone.fee === null
    ? `${zone.name} — frais de déplacement sur devis.`
    : `${zone.name} — frais de déplacement : ${formatFcfa(zone.fee)}${zone.status === "valide" ? "" : " (à confirmer)"}.`;
}

/**
 * Demande de réservation. Rien n'est envoyé à un serveur : le formulaire
 * prépare un message WhatsApp que la cliente envoie elle-même.
 */
export function BookingForm() {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const field = (key: keyof Values) => ({
    name: key,
    value: values[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    },
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    const travel = travelText(values.locality);
    const url = whatsappUrl(
      buildProjectMessage([
        ["Nom", values.name.trim()],
        ["Numéro WhatsApp", values.phone.trim()],
        ["Prestation", values.service],
        ["Localité", values.locality],
        ["Déplacement", travel],
        ["Date souhaitée", values.date ? formatDateFr(values.date) : null],
        ["Commentaire", values.comment.trim()],
      ]),
    );
    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (sentUrl) {
    return (
      <div role="status" className="rounded-card bg-mist p-6 sm:p-8">
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-forest text-white">
          <Check className="size-6" />
        </span>
        <h2 className="type-h3 mt-5">Ta demande est prête dans WhatsApp.</h2>
        <p className="mt-3 leading-relaxed text-charcoal">
          Il te reste à appuyer sur « Envoyer » dans WhatsApp. Ta demande n&apos;est pas une réservation : LP LOCKS
          te répond pour confirmer la disponibilité et le rendez-vous.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href={sentUrl} external variant="whatsapp" icon={<WhatsAppIcon className="size-4.5" />}>
            Rouvrir WhatsApp
          </Button>
          <Button variant="secondary" onClick={() => setSentUrl(null)}>
            Modifier ma demande
          </Button>
        </div>
      </div>
    );
  }

  const travel = travelText(values.locality);

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      <TextField label="Nom" autoComplete="name" {...field("name")} />
      <TextField label="Numéro WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="07 00 00 00 00" {...field("phone")} />
      <SelectField label="Prestation" {...field("service")}>
        <option value="" disabled>
          Choisir une prestation
        </option>
        {serviceChoices.map((choice) => (
          <option key={choice}>{choice}</option>
        ))}
      </SelectField>
      <SelectField label="Localité" hint={travel ?? "Sert à estimer les frais de déplacement."} {...field("locality")}>
        <option value="" disabled>
          Choisir une localité
        </option>
        {travelZones.map((zone) => (
          <optgroup key={zone.id} label={zone.name}>
            {zone.localities.map((locality) => (
              <option key={locality}>{locality}</option>
            ))}
          </optgroup>
        ))}
        <option>{OTHER_LOCALITY}</option>
      </SelectField>
      <TextField label="Date souhaitée" type="date" optional {...field("date")} />
      <TextAreaField
        label="Commentaire"
        optional
        className="sm:col-span-2"
        placeholder="Longueur, couleur, nombre de locks, questions…"
        maxLength={600}
        {...field("comment")}
      />
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" variant="whatsapp" icon={<WhatsAppIcon className="size-5" />}>
          Envoyer ma demande sur WhatsApp
        </Button>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-charcoal">
          Tes informations servent uniquement à préparer ton message WhatsApp. Elles ne sont ni enregistrées ni
          transmises par ce site. La demande ne confirme pas un rendez-vous : c&apos;est LP LOCKS qui le confirme.
        </p>
      </div>
    </form>
  );
}
