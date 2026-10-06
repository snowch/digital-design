// Copyright © 2026 Christopher Snow

// One moment, many readings: what every figure shows as text beside a drawing, so the picture is
// never the only carrier. A table whose rows are named things and whose cells are what each reads
// at the moment the figure has chosen (now, the cursor's time, a state). Which things, and what
// they read, are the figure's.

export interface Reading {
  readonly text: string;
  readonly className?: string;
}

export interface InspectorRow {
  readonly key: string;
  readonly name: string;
  readonly cells: readonly Reading[];
}

export interface StateInspectorProps {
  readonly caption: string;
  /** Column headings, the first over the rows' names. */
  readonly headings: readonly string[];
  readonly rows: readonly InspectorRow[];
  readonly className?: string;
}

export function StateInspector({ caption, headings, rows, className }: StateInspectorProps) {
  return (
    <table className={className}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {headings.map((h, i) => (
            <th scope="col" key={i}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <th scope="row">{r.name}</th>
            {r.cells.map((c, i) => (
              <td key={i} {...(c.className !== undefined ? { className: c.className } : {})}>
                {c.text}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
