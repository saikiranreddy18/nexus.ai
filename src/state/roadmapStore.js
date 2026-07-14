// Per-step roadmap completion, keyed by "<milestoneId>:<stepIndex>".
// localStorage until the backend owns progress.
const KEY = 'exus_roadmap_v1'

export function loadRoadmapProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

export function toggleStep(milestoneId, stepIndex) {
  const p = loadRoadmapProgress()
  const key = `${milestoneId}:${stepIndex}`
  if (p[key]) delete p[key]
  else p[key] = true
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* storage blocked */ }
  return p
}

export function isStepDone(progress, milestoneId, stepIndex) {
  return !!progress[`${milestoneId}:${stepIndex}`]
}

export function milestoneComplete(progress, milestone) {
  return milestone.steps.every((_, i) => progress[`${milestone.id}:${i}`])
}
