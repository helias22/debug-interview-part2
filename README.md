# Part 2: Production Investigation

You're on-call and this alert just came in. Investigate the issue — figure out **what** is failing, **why** it's failing, and **why now** (it was working before).

You have access to everything below. Take your time, talk through your thinking.

---

## The Alert

> **#eng-alerts** — 2026-03-11 9:14 AM
>
> 🔴 **Alert: SMS notification failures spiking**
>
> We're seeing a spike in failed SMS notifications since yesterday.
> Affected org: Meridian Insurance (org_id: 47).
> All their task assignment notifications are failing — assignees aren't getting SMS alerts.
>
> Other orgs seem fine. Meridian was onboarded yesterday.

---

Start by looking at any of the files in this project:

- `logs/` — server logs from the failing and working requests
- `code/` — the relevant code that sends notifications
- `db/` — snapshots of the relevant database tables
- `git/` — recent git history and PR descriptions
