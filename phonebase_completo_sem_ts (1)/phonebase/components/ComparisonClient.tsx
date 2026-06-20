"use client";

import { useMemo, useState } from "react";
import type { Phone } from "@/lib/types";
import { finalScore, formatCurrency, formatNumber } from "@/lib/scoring";
import { PhoneSizeCompare } from "./PhoneSizeCompare";

type Metric = {
  label: string;
  getValue: (phone: Phone) => string | number;
  getScore?: (phone: Phone) => number;
};

const metrics: Metric[] = [
  { label: "Nota final", getValue: finalScore, getScore: finalScore },
  { label: "Desempenho", getValue: (phone) => phone.scorePerformance, getScore: (phone) => phone.scorePerformance },
  { label: "Camera", getValue: (phone) => phone.scoreCamera, getScore: (phone) => phone.scoreCamera },
  { label: "Bateria", getValue: (phone) => phone.scoreBattery, getScore: (phone) => phone.scoreBattery },
  { label: "Tela", getValue: (phone) => phone.scoreDisplay, getScore: (phone) => phone.scoreDisplay },
  { label: "Custo-beneficio", getValue: (phone) => phone.scoreValue, getScore: (phone) => phone.scoreValue },
  { label: "AnTuTu", getValue: (phone) => `${formatNumber(phone.antutuScore)} (${phone.antutuVersion})`, getScore: (phone) => phone.antutuScore },
  { label: "Preco", getValue: (phone) => formatCurrency(phone.bestPrice), getScore: (phone) => -phone.bestPrice },
  { label: "Processador", getValue: (phone) => phone.chipset },
  { label: "RAM", getValue: (phone) => `${phone.ramGb} GB` },
  { label: "Armazenamento", getValue: (phone) => `${phone.storageGb} GB` },
  { label: "Dimensoes", getValue: (phone) => `${phone.heightMm} x ${phone.widthMm} x ${phone.thicknessMm} mm` }
];

export function ComparisonClient({ phones }: { phones: Phone[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(phones.slice(0, 2).map((phone) => phone.id));

  const selectedPhones = useMemo(
    () => selectedIds.map((id) => phones.find((phone) => phone.id === id)).filter(Boolean) as Phone[],
    [phones, selectedIds]
  );

  function togglePhone(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  return (
    <div className="compare-grid">
      <div className="compare-picker">
        {phones.map((phone) => (
          <button
            className={`compare-chip ${selectedIds.includes(phone.id) ? "active" : ""}`}
            key={phone.id}
            type="button"
            onClick={() => togglePhone(phone.id)}
          >
            + {phone.name}
          </button>
        ))}
      </div>

      <div className="table-card">
        <table className="data-table comparison-table">
          <thead>
            <tr>
              <th>Categoria</th>
              {selectedPhones.map((phone) => (
                <th key={phone.id}>{phone.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const bestScore = metric.getScore ? Math.max(...selectedPhones.map(metric.getScore)) : null;
              return (
                <tr key={metric.label}>
                  <th>{metric.label}</th>
                  {selectedPhones.map((phone) => {
                    const score = metric.getScore?.(phone);
                    const isWinner = bestScore !== null && score === bestScore;
                    return (
                      <td className={isWinner ? "winner" : ""} key={phone.id}>
                        {metric.getValue(phone)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PhoneSizeCompare phones={selectedPhones} />
    </div>
  );
}
