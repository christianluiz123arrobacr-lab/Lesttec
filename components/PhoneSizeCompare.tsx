import type { Phone } from "@/lib/types";

export function PhoneSizeCompare({ phones }: { phones: Phone[] }) {
  const scale = 1.05;

  return (
    <div className="size-stage">
      {phones.map((phone) => {
        const frontWidth = Math.max(48, phone.widthMm * scale);
        const frontHeight = Math.max(96, phone.heightMm * scale);
        const sideWidth = Math.max(8, phone.thicknessMm * scale * 1.7);

        return (
          <div className="size-phone" key={phone.id}>
            <div className="size-phone-drawing">
              <div
                className="phone-outline"
                style={{
                  width: `${frontWidth}px`,
                  height: `${frontHeight}px`
                }}
              >
                <strong>{phone.name}</strong>
              </div>
              <div
                className="phone-side-outline"
                style={{
                  width: `${sideWidth}px`,
                  height: `${frontHeight}px`
                }}
                title={`Espessura: ${phone.thicknessMm} mm`}
              />
            </div>
            <p>
              <strong>{phone.name}</strong>
              <br />
              <span className="muted">
                {phone.heightMm} x {phone.widthMm} x {phone.thicknessMm} mm / {phone.weightG} g
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
