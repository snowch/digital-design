# S-brief: the sceptic of one review

A reviewer has read one lesson of the course as a learner and listed findings. Reviewers
over-call. Your job is to attack each finding independently before anyone acts on it.

Read the review (the file named in your task), the lesson as text (named in your task; the
earlier lessons are in the same folder), and whatever repository files you need to check a claim
(`/home/user/digital-design`, read only; `docs/style.md`, `docs/isa.md`, the lesson's `.ts`,
`.prose.ts` and `.labels.ts` files under `content/lessons/`, the model in `packages/dd-model/src/`,
the figures in `packages/dd-views/src/`).

For every numbered finding, give one verdict:

- **Stands**: the problem is real and would hurt a learner; say the smallest change that fixes it.
- **Partly**: part is real; say which part, and the smallest change.
- **Falls**: the finding is wrong, already answered on the page, or a matter of taste that the
  style checklist does not require; say why, quoting the page or the code.

Check every factual claim in the finding against the files before you rule. Do not rewrite the
lesson's text; say a direction. Never give a challenge's answer. Keep it under 900 words. Return
the verdicts as text in your final message; do not write or change any file.
