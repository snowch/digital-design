// Copyright © 2026 Christopher Snow

import { useLessonCompletion } from "./lesson-completion";
import { STRINGS } from "./strings";

export function LessonDoneCheckbox({ lessonId }: { lessonId: string }) {
  const completion = useLessonCompletion();
  const done = completion?.completed.has(lessonId) ?? false;
  return (
    <label className="lesson-done-label" data-done={done}>
      <input
        type="checkbox"
        checked={done}
        disabled={!completion}
        onChange={(event) => completion?.setDone(lessonId, event.target.checked)}
      />
      <span>{STRINGS.lessonDone.mark}</span>
    </label>
  );
}
