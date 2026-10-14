---
title: "How to turn a vague automation request into a build-ready spec"
description: "Most automation projects fail before anyone writes code, in the gap between the ask and the build. A repeatable way to close it: structured questions, conflicts surfaced instead of guessed, every business term defined by its owner, and a Go or Don't Build decision per item."
publishedAt: 2026-10-14
category: "AI Enablement Methods"
tags: []
draft: true
---

You turn a vague automation request into a build-ready spec by refusing to fill the gaps yourself. Ask structured questions, quote every answer in the requester's own words, put conflicting answers back in front of them instead of picking one, make the owner define every business term, and give each item a Go, Gather more, or Don't Build decision before anyone writes code. The spec is done when nothing in it rests on a guess.

The rest of this post is the method, a worked example, and the two decisions I got wrong on the way to the tool I now use for it.

## Why do automation projects fail before the build starts?

Because the request was never a spec, and somebody quietly turned it into one.

A request arrives like this: *"Can we get a daily short-pick report per picker so the shift leads can target retraining?"* It sounds specific. It isn't. Who reads it, and what do they do differently? Ready by when? What counts as a short pick? Is there already a screen that almost does this? Is anyone building it by hand today?

The engineer who gets that request has two options. Go back with questions, which feels slow and a little rude. Or fill the gaps with reasonable assumptions and start building, which feels like progress. Most people take the second option, and that's where the project starts to fail.

This isn't a hunch. When RAND interviewed 65 experienced data scientists and engineers about why AI projects fail, the most common root cause wasn't the model or the data. It was that stakeholders misunderstood or miscommunicated what problem needed to be solved ([RAND, 2024](https://www.rand.org/pubs/research_reports/RRA2680-1.html)). PMI found the same pattern across projects in general: 47% of unsuccessful projects miss their goals because of inaccurate requirements management ([PMI, Pulse of the Profession](https://www.pmi.org/learning/thought-leadership/pulse/core-competency-project-program-success)).

Fred Brooks put it plainly almost forty years ago: "The hardest single part of building a software system is deciding precisely what to build." AI didn't change that. It made building cheap, which makes deciding the expensive part.

I've paid for this one myself. At a past job, space in our main DC was tight, so part of the inventory sat in offsite warehouses while the WMS carried it in a virtual location inside the DC. While the ops team worked through consolidations, they asked for a process that would flag which offsite inventory needed to come back to the main building so they could fill orders. It was genuinely complex. We brought in outside consultants to essentially replicate the allocation process inside the WMS, at consultant hourly rates. Then came our own time: testing the logic, adjusting it to ops feedback, retesting, adjusting again. It turned into a mini project of close to six months, and it ended up barely used.

The logic wasn't the problem. The problem was temporary, and we built a permanent, systemic answer to it. Nobody communicated how long the offsite setup was expected to last, so nobody weighed that against six months of build. Had we known, we might not have pursued a systemic solution at all. One question before the first consultant hour would have changed the decision: how long will we need this? Cheap question. Expensive answer.

## Why can't the person asking just write the spec?

They aren't being lazy. They don't know what a spec needs, and they shouldn't have to.

An ops supervisor knows exactly what a short pick is when they see one. Ask them to define it in writing and you get something like this, from the worked example below:

> "A short pick is when the confirmed quantity is less than the task quantity. Cancelled lines don't count. I think wrong-location scans should count too but I'm not totally sure, Priya might know."

That's a good answer. It's also not a definition yet. It has a hedge in it ("I'm not totally sure") and a pointer to someone else ("Priya might know"). If you build from it, you've decided the wrong-location question on your own. If the report then disagrees with what the shift leads expect, nobody trusts it, and an untrusted report is a dead report.

So the constraint is real: the person with the knowledge can't produce a spec, and the person who can produce a spec doesn't have the knowledge. The method has to move knowledge from one to the other without either side guessing.

## What does a build-ready spec actually need?

Less than a requirements document, and more than a ticket. For each item:

- **The decision it supports.** Not "a report." Who reads it and what they do differently because of it.
- **The users, the data, and the systems.** Where the numbers come from and who touches them.
- **Constraints.** Deadlines, time windows, approvals, anyone outside the team who cares.
- **Every business term, defined by its owner.** "Short pick," "on-time," "fill rate." Defined in the owner's words, not interpreted by the builder.
- **What exists today.** A screen that's close, a spreadsheet someone builds by hand, a report nobody reads.
- **Kill criteria.** What would make you stop, and what the manual fallback is.
- **A gate.** Go, Gather more, Don't build, or Fix (not build).

The gate is the part most intakes skip, and it's the most useful one. Missing information means *Gather more*, never *Don't build*. A Don't build needs evidence: the thing already exists, nobody uses the output, or the manual process is cheaper than the automation. And sometimes the right answer is *Fix, not build*: the existing screen has the data and just needs a column.

## What does that look like on a real request?

Here's the short-pick report going through intake-kit, the tool I built for this. The sources are synthetic, but the shape is a familiar one from the floor.

**Round 1: send a question packet.** The packet asks the nine required questions for a data report in plain language. Sam, the ops supervisor, replies by email. The intake reads the reply against every question:

```text
Daily short-pick report: 8 of 9 required answered; still open:
data_report.definition: only partly answered; existing-asset check:
no clear yes or no; "short pick": no confirmed definition.
```

It also finds a second item hiding in the reply: Sam builds this report by hand today, in Excel, from a WMS export. That's not a side note. It's the thing the automation replaces, and it gets its own gate.

**Round 1, second source: a call with the DC manager.** I paste in my notes. Sam wrote that the report must be ready by 7am. The DC manager said 6am. The tool doesn't pick one. It writes a round-2 question:

```text
We have two different answers here: "Report must be ready by 7am Monday."
and "Report must be ready by 6am Monday.". Which is right?
```

(The "Monday" is a known paraphrase bug. The report is daily. The quotes it stores are always exact.)

My notes also define short pick, and include wrong-location scans. But my notes are a paraphrase. An answer that rests only on the interviewer's notes stays "needs confirming" until the stakeholder says it in their own words. So round 2 asks Sam to confirm the definition himself.

**Sign off early, and it refuses.** If I try to sign off at this point, the report is easy to build and still gets this:

```text
Daily short-pick report: Gather more
  - "short pick" has no confirmed definition
```

And the definitions file says, to whoever builds it: *"The owner hasn't defined it yet. Don't interpret it: ask."*

**Round 2: Sam replies.** 6am is settled. Short pick is defined in his words. The report reaches **Go**. The Excel report it replaces is **Don't build**, confirmed on its own at sign-off, so nobody automates the old process alongside the new one.

What comes out is a spec pack a builder (or a coding agent) can work from without calling anyone: the spec, acceptance criteria, guardrails, decisions, definitions, and a draft statement of work, with every requirement tracing back to a quote.

## What did I get wrong on the way?

Two things, and both changed how the tool works.

**First, I let the model run the interview.** The first version was a chat: the model asked questions, decided when it had an answer, and wrote the summary. On October 13 I ran it on a real request and it failed in every way that matters. It heard answers and didn't record them, in up to 75% of turns on the smaller model. It asked about the outcome four or more times. It invented an item from a hypothetical. It said "I've shared the summary" and rendered nothing.

Every one of those failures traced back to a decision the model owned. So I inverted it. Code now decides what to ask, when an answer counts, when two answers conflict, and what each gate is. The model does narrow jobs that code checks: read a document against the questions, phrase the one question code chose, and write up the prose at the end. A quote that isn't in what was pasted gets dropped. An answer with no quote doesn't get recorded.

That was the right call, but it wasn't instantly good enough. The first gate run on the new design matched the expected outcomes in 0 of 6 runs. After one round of fixes, 4 of 6. My bar was 5 of 6, so I took the fallback I'd written into the spec in advance and paused the live web version.

**Second, I built for the wrong conversation.** Even when the live interview worked, it exposed the real problem: the person running an intake usually isn't the person who knows the answers. Relaying a live chat puts them in the middle of every turn. So the primary mode became async: send a packet, paste back whatever comes back (an email, your call notes, a transcript), and let code sort out what's covered, what conflicts, and what's still open. Reading a document and saying which questions it answers is classification, which is the job models do most reliably. Each ingest round costs about three cents.

On the held-out test personas, the live interview matched the expected gates 5 of 5, and the async regression runs matched 2 of 2, with zero invented quotes across every run. Those personas are synthetic, and that's the honest limit of the claim today. I haven't run it on a hundred real requests yet.

## How do you run this without the tool?

You don't need intake-kit to use the method. It's a discipline more than software:

1. **Write the questions before you talk to anyone.** Decision, users, data, systems, constraints, terms, what exists, kill criteria. Send them as a short packet so people can answer in their own time.
2. **Quote, don't summarize.** Record every answer in the requester's words, with where it came from. Your own meeting notes count as a paraphrase until the owner confirms them.
3. **Put conflicts back in front of people.** When two answers disagree, quote both and ask which is right. Never pick the one you prefer.
4. **Make the owner define every business term.** If a term has no confirmed definition, the item isn't ready, however easy it is to build.
5. **Gate every item.** Go, Gather more, Don't build, or Fix. Missing information is Gather more. Don't build needs a reason you can point to.
6. **Ask only what's still open in round 2.** People answer a five-question follow-up. They ignore a twenty-question one.

The tool just makes the discipline hard to skip. The rules live in code, so they hold when I'm tired or the requester is senior and impatient.

## How I built it

I direct coding agents (Claude Code) to write most of intake-kit's implementation. I own the spec, the guardrails, the test bar, and the operational judgment about what counts as a good intake. The spec is in the repo, and so is every test run, with the failures, the fixes, and the commit each number came from.

- **Try it:** [watch a recorded sample intake](https://agreeable-hill-0ede1650f.5.azurestaticapps.net/?sample) (no sign-up, no model calls)
- **Code:** [github.com/tjpinder/intake-kit](https://github.com/tjpinder/intake-kit), installable as a Claude Code plugin
- **Evidence:** [How we tested it](https://github.com/tjpinder/intake-kit/blob/main/docs/evals/how-we-tested-it.md)
