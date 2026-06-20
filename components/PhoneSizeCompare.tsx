import type { Phone } from "@/lib/types";

export function PhoneSizeCompare({ phones }: { phones: Phone[] }) {
  const scale = 1.35;

  return (
    <div className="size-stage">
      {phones.map((phone) => (
        <div key={phone.id}>
          <div
            className="phone-outline"
            style={{
              width: `${phone.widthMm * scale}px`,
              height: `${phone.heightMm * scale}px`
            }}
          >
            <strong>{phone.name.split(" ")[0]}</strong>
          </div>
          <p>
            <strong>{phone.name}</strong>
            <br />
            <span className="muted">
              {phone.heightMm} x {phone.widthMm} x {phone.thicknessMm} mm
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
