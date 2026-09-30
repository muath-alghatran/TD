"use client";

import { displayTrim, vehicleLabel, type GaragedVehicle } from "@/lib/garage";
import { KsaPlate } from "@/components/garage/KsaPlate";

export const OTHER_VEHICLE = "other";

/** اختيار السيارة من «كراجي»، أو كتابة سيارة أخرى */
export function VehiclePicker({
  vehicles,
  value,
  onChange,
  otherText,
  onOtherText,
}: {
  vehicles: GaragedVehicle[];
  value: string;
  onChange: (value: string) => void;
  otherText: string;
  onOtherText: (text: string) => void;
}) {
  return (
    <div>
      {vehicles.map((v) => (
        <button
          key={v.id}
          type="button"
          className="choice"
          aria-pressed={value === v.id}
          onClick={() => onChange(v.id)}
        >
          <span className="dot" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="car-name" style={{ display: "block", fontSize: 15.5 }}>
              {vehicleLabel(v)}
            </span>
            <span className="car-sub" style={{ display: "block" }}>
              {displayTrim(v.trim)}
            </span>
          </span>
          <KsaPlate plate={v.plate} />
        </button>
      ))}
      {vehicles.length > 0 && (
        <button
          type="button"
          className="choice"
          aria-pressed={value === OTHER_VEHICLE}
          onClick={() => onChange(OTHER_VEHICLE)}
        >
          <span className="dot" />
          <span className="car-name" style={{ fontSize: 15.5 }}>
            سيارة أخرى
          </span>
        </button>
      )}
      {(value === OTHER_VEHICLE || vehicles.length === 0) && (
        <input
          className="input"
          style={{ marginTop: vehicles.length > 0 ? 8 : 0 }}
          value={otherText}
          onChange={(e) => onOtherText(e.target.value)}
          placeholder="الماركة والموديل والسنة — مثل: تويوتا كامري ٢٠٢٢"
          aria-label="السيارة"
          autoComplete="off"
        />
      )}
    </div>
  );
}

export function resolveVehicleText(vehicles: GaragedVehicle[], value: string, otherText: string): string {
  const found = vehicles.find((v) => v.id === value);
  if (found) return `${vehicleLabel(found)}${found.plate && found.plate !== "—" ? ` · لوحة ${found.plate}` : ""}`;
  return otherText.trim();
}
