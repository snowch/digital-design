// Copyright © 2026 Christopher Snow

// Open one level down, and find the way back: the trail every nested view shares. A path such as
// `ram/word2/ff1` names the level shown; the trail names every level above it, and pressing one
// goes back to it. What a level is and what opening one draws stay with the view.

export interface DrillLevel {
  readonly path: string;
  readonly label: string;
}

/**
 * The levels of a path, from the top: the top's own label, then one level per name in the path,
 * labelled by `labelOf` (given the level's path and its last name). Two levels in a row with one
 * label collapse into the deeper one, so a trail never names a level twice.
 */
export function drillLevels(
  path: string,
  topLabel: string,
  labelOf: (path: string, name: string) => string,
): DrillLevel[] {
  const names = path ? path.split("/") : [];
  const levels: DrillLevel[] = [{ path: "", label: topLabel }];
  for (let i = 0; i < names.length; i++) {
    const at = names.slice(0, i + 1).join("/");
    const label = labelOf(at, names[i] ?? "");
    const last = levels[levels.length - 1];
    if (last && last.label === label) levels[levels.length - 1] = { path: at, label };
    else levels.push({ path: at, label });
  }
  return levels;
}

export interface DrillDownProps {
  readonly levels: readonly DrillLevel[];
  /** The path of the level shown, whose name in the trail cannot be pressed. */
  readonly current: string;
  readonly onGo: (path: string) => void;
  /** The trail's name, for a screen reader. */
  readonly label: string;
  readonly className?: string;
}

export function DrillDown({
  levels,
  current,
  onGo,
  label,
  className = "drill-trail",
}: DrillDownProps) {
  return (
    <nav className={className} aria-label={label}>
      {levels.map((level, i) => (
        <span key={level.path}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          <button
            type="button"
            className="crumb"
            onClick={() => onGo(level.path)}
            disabled={level.path === current}
          >
            {level.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
