// Copyright © 2026 Christopher Snow

// Choose a fault, or none: the controls every fault figure shares. Choosing "none" is the
// restore. How a fault is applied to the model, what runs, and how the results read, stay with
// the figure; this says only which fault is chosen.

export interface FaultInjectorProps {
  /** The radio group's name, unique on the page. */
  readonly name: string;
  /** The group's visible name. */
  readonly legend: string;
  /** The choice with no fault, which restores the model as it was. */
  readonly noneLabel: string;
  readonly faults: readonly { readonly label: string }[];
  /** The fault chosen, by its index, or -1 for none. */
  readonly chosen: number;
  readonly onChoose: (index: number) => void;
}

export function FaultInjector({
  name,
  legend,
  noneLabel,
  faults,
  chosen,
  onChoose,
}: FaultInjectorProps) {
  return (
    <fieldset className="fault-choices">
      <legend>{legend}</legend>
      {[-1, ...faults.map((_, i) => i)].map((i) => (
        <label key={i} className="fault-choice">
          <input type="radio" name={name} checked={chosen === i} onChange={() => onChoose(i)} />
          <span>{i < 0 ? noneLabel : faults[i]?.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
