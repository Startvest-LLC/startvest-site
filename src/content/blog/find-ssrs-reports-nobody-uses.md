---
title: "How to find the SSRS reports nobody uses, without retiring the ones people still need"
description: "The obvious query for unused SSRS reports is wrong in four ways, and each one retires a report someone still depends on. A read-only script that sorts every report into a status, and refuses to answer when the log can't support one."
publishedAt: 2026-10-15
category: "Operational AI"
tags: []
draft: false
---

To find SSRS reports nobody uses, don't just look for reports with no rows in the execution log. Check that the log covers the whole window first, protect subreports and linked reports (SSRS never logs them directly), and count subscription deliveries as use. Anything left with no runs and no active subscription is a candidate to retire, not a report to delete.

This is the cleanup you do before a migration, and before you point any AI at your reporting estate. A model that answers questions from 200 reports, 40 of them dead copies, is a model that cites the wrong one.

## Why is the obvious query wrong?

"No rows in `ExecutionLog3`" sounds like the definition of unused. It gets four things wrong, and every one of them ends with retiring something that's still in use.

**The log is shorter than you think.** SSRS keeps execution history for `ExecutionLogDaysKept` days, 60 by default, then deletes it. Ask "unused for 90 days" and every quarterly report looks dead.

**Subreports never show up.** When a parent report runs, its subreports render inside that execution. The log records the parent. The subreport looks like nobody has touched it in years.

**Linked reports aren't logged directly** either.

**Nobody opening it isn't nobody getting it.** A report emailed to the regional managers every Monday has an audience, even if no one has clicked it on the portal since 2019.

I've lived the other side of this. Before one migration, we had close to 100 reports to evaluate, and we reviewed the list with operations more than once. Plenty of them pointed at databases nobody recognized anymore. But the dead weight wasn't the problem. The problem was the reports nobody named as key to migrate, which turned out to be needed and became last-minute work during the cutover.

Asking people which reports matter finds the ones they think about. It misses the ones they don't think about until they're gone. That's why the evidence should come from the log, and why the tool should err toward keeping a report, not retiring it.

## What does the script do instead?

It reads the catalog, the subscriptions, the log, and the report definitions (only to find which reports are used as subreports), and sorts every report into one status:

- **retire candidate:** no runs in the window, no active subscription, not a subreport, not a linked report, and older than the window
- **review:** no runs, but an active subscription is still scheduled. Something is sending it, or failing to
- **not logged:** a subreport or linked report. No log rows proves nothing
- **too new to judge,** or **active**

And it refuses. If the log doesn't reach back to the start of the window you asked about, it stops with an error that tells you why. It won't give you an answer the data can't support.

There's no model in this one, on purpose. Deciding whether a report is dead is a deterministic job with a right answer. Putting a model in that decision only adds a way to be confidently wrong.

## How do you know it works?

I tested it against a synthetic estate: a fictional distributor with 63 reports, a 60-day log, planted copies, a subreport, a linked report, and a subscription that hasn't delivered. The test loads it into a throwaway database, runs the script, and checks every status against an answer key.

```text
Guardrail: 90-day window over a 60-day log was refused
Statuses: active 56, not logged (linked) 1, not logged (subreport) 1, retire candidate 4, review 1
PASS: 63 of 63 reports match the answer key
```

It hasn't been run on a production server yet. It's read-only and needs nothing more than `db_datareader`, so it's a safe first run on yours.

## Get it

- **The recipe:** [ops-ai-recipes, recipe 01](https://github.com/tjpinder/ops-ai-recipes/tree/main/recipes/01-dead-ssrs-reports). One T-SQL file, the test, and the guardrails.
- **The full picture:** [sql-xray](https://github.com/tjpinder/sql-xray) does the whole estate. Duplicates, reports that compute the same number differently, what breaks if something goes, and a keep, consolidate, retire, or review list.

I built both by directing coding agents (Claude Code). I own the rules about what counts as dead, the guardrails, and the tests that prove them.
