type ScoreRowsProps = {
  items: Array<{
    label: string;
    value: number;
  }>;
};

export function ScoreRows({ items }: ScoreRowsProps) {
  return (
    <div className="score-stack">
      {items.map((item) => (
        <div className="score-row" key={item.label}>
          <span>{item.label}</span>
          <span className="score-track">
            <span className="score-fill" style={{ width: `${item.value * 10}%` }} />
          </span>
          <span>{item.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}
