"use client";

import { Download, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { needsLocality } from "@/lib/configurator";
import { PHOTO_TYPES, preparePhoto, validatePhoto, type PreparedPhoto } from "@/lib/photo";
import type { Estimate } from "@/lib/pricing";
import { buildProjectSendMessage, type ContactDetails } from "@/lib/project-message";
import type { ProjectDraft } from "@/lib/project-store";
import { todayIso, validateComment, validateFutureDate, validateName, validatePhone } from "@/lib/validation";
import { whatsappUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";
import { LocalityField } from "./step-summary";

type Values = { name: string; phone: string; date: string; comment: string };
type Errors = Partial<Record<keyof Values | "locality" | "photo", string>>;

interface Props {
  draft: ProjectDraft;
  estimate: Estimate;
  onChange: (patch: Partial<ProjectDraft>) => void;
  onEditChoices: () => void;
  onRestart: () => void;
}

/**
 * Étape 7 — Envoi. Les coordonnées restent dans cette page : elles ne sont ni
 * enregistrées sur l'appareil ni transmises par le site.
 */
export function StepSend({ draft, estimate, onChange, onEditChoices, onRestart }: Props) {
  const { notify } = useToast();
  const [values, setValues] = useState<Values>({ name: "", phone: "", date: "", comment: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const field = (key: keyof Values) => ({
    name: key,
    value: values[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    },
  });

  /** Valide le formulaire ; renvoie les coordonnées si tout est correct. */
  const validate = (): ContactDetails | null => {
    const found: Errors = {};
    const add = (key: keyof Errors, message: string | null) => {
      if (message) found[key] = message;
    };
    add("name", validateName(values.name));
    add("phone", validatePhone(values.phone));
    if (needsLocality(draft)) add("locality", draft.locality ? null : "Choisis ta localité.");
    add("date", validateFutureDate(values.date, todayIso()));
    add("comment", validateComment(values.comment));
    setErrors((e) => ({ ...found, photo: e.photo }));
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return null;
    }
    return { ...values, hasPhoto: Boolean(photo) };
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setErrors((e) => ({ ...e, photo: problem }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      setPhoto(await preparePhoto(file));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: "Impossible de lire cette image. Essaie avec une autre photo." }));
    }
  };

  const downloadPdf = async () => {
    const contact = validate();
    if (!contact) return;
    setPdfLoading(true);
    try {
      const { generateProjectPdf, pdfFileName } = await import("@/lib/pdf");
      const blob = await generateProjectPdf({ draft, estimate, contact });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      notify("Ton récapitulatif PDF est téléchargé.", "success");
    } catch {
      notify("Le PDF n'a pas pu être généré. Réessaie, ou envoie ton projet sur WhatsApp.", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const contact = validate();
    if (!contact) return;
    window.open(whatsappUrl(buildProjectSendMessage(draft, estimate, contact)), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <form ref={formRef} onSubmit={send} noValidate className="mt-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom" autoComplete="name" {...field("name")} />
        <TextField label="Numéro WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="07 00 00 00 00" {...field("phone")} />
        {needsLocality(draft) && (
          <LocalityField
            value={draft.locality}
            error={errors.locality}
            onChange={(locality) => {
              onChange({ locality });
              setErrors((e) => ({ ...e, locality: undefined }));
            }}
          />
        )}
        <TextField label="Date souhaitée" type="date" optional {...field("date")} />
        <TextAreaField label="Commentaire" optional className="sm:col-span-2" maxLength={600} placeholder="Autre couleur, précisions, questions…" {...field("comment")} />

        <div className="sm:col-span-2">
          <p className="text-sm font-semibold">
            Photo d&apos;inspiration <span className="font-normal text-charcoal">(facultatif)</span>
          </p>
          <input
            ref={fileRef}
            id="photo-inspiration"
            type="file"
            accept={PHOTO_TYPES.join(",")}
            className="sr-only"
            aria-describedby="photo-aide"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
          {photo ? (
            <div className="mt-2 flex items-center gap-4 rounded-2xl border border-line p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier choisi par la cliente */}
              <img src={photo.dataUrl} alt="Aperçu de ta photo d'inspiration" className="size-20 rounded-xl object-cover" />
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">{photo.name}</p>
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                aria-label="Retirer la photo"
                className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-mist"
              >
                <Trash2 aria-hidden className="size-4.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo-inspiration"
              className="mt-2 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-silver px-4 py-3 text-sm font-semibold transition-colors hover:border-forest hover:bg-mist"
            >
              <ImagePlus aria-hidden className="size-5 text-forest" />
              Ajouter une photo
            </label>
          )}
          {errors.photo && (
            <p role="alert" className="mt-2 text-sm font-medium text-error">
              {errors.photo}
            </p>
          )}
          <p id="photo-aide" className="mt-2 text-sm text-charcoal">
            JPEG, PNG ou WebP, 5 Mo maximum. Ta photo reste sur ton appareil : elle n&apos;est ni envoyée par ce site ni
            ajoutée au PDF. Pense à la joindre toi-même à ton message WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button type="submit" size="lg" variant="whatsapp" icon={<WhatsAppIcon className="size-5" />}>
          Envoyer mon projet sur WhatsApp
        </Button>
        <Button size="lg" variant="secondary" loading={pdfLoading} onClick={downloadPdf} icon={<Download aria-hidden className="size-4.5" />}>
          Télécharger mon récapitulatif PDF
        </Button>
      </div>

      {sent && (
        <p role="status" className="mt-5 rounded-2xl bg-mist p-4 text-sm leading-relaxed font-medium text-forest">
          WhatsApp s&apos;est ouvert avec ton projet : il te reste à appuyer sur « Envoyer ». Ta demande n&apos;est pas une
          réservation — LP LOCKS te répond pour confirmer la disponibilité et le rendez-vous.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-x-2 gap-y-1 border-t border-line pt-5">
        <Button variant="ghost" size="sm" onClick={onEditChoices}>
          Modifier mes choix
        </Button>
        <Button variant="ghost" size="sm" onClick={onRestart}>
          Recommencer
        </Button>
      </div>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-charcoal">
        Ton nom et ton numéro servent uniquement à préparer ton message et ton PDF. Ils ne sont ni enregistrés ni
        transmis par ce site. Une demande envoyée ne constitue pas une réservation confirmée.
      </p>
    </form>
  );
}
