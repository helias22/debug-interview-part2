# Part 2: Production Investigation

## Scenario

You are on-call for **TaskFlow**, a task management SaaS platform. The following PagerDuty alert fired this morning:

---

**ALERT: Notification delivery failures spiking**
- Severity: P2
- Service: notification-router
- Impact: Multiple users across at least one organization are not receiving all expected notifications when tasks are assigned to them
- Started: ~2025-03-24
- Note: Email and Slack channels appear healthy. Not all orgs are affected.

---

## Your Task

Investigate the root cause of the notification failures. You have access to:

- `code/` — the notification system source code
- `logs/app.log` — recent application logs
- `db/` — current database snapshots (markdown tables)
- `git/` — recent git history and relevant diffs

**Deliverable:** Identify the root cause, explain why it only affects certain users, and propose a fix.
