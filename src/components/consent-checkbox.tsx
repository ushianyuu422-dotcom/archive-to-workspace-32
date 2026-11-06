import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

/** Required on every form that collects personal data (Data Privacy Act, RA 10173). */
export function ConsentCheckbox({
  checked,
  onCheckedChange,
  error,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  error?: string;
}) {
  const { t } = useLang();
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          className="mt-0.5"
          required
        />
        <Label htmlFor="consent" className="text-sm leading-snug font-normal cursor-pointer">
          {t("common.consent")}{" "}
          <Link to="/privacy" className="underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </Link>
        </Label>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
