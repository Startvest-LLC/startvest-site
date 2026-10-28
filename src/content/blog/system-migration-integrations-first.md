---
title: "How to plan a system migration so the integrations don't break at go-live"
description: "Most operations-system migrations don't break in the new system. They break in the integrations around it. Start the integration work first, test whole transactions across every downstream system, cut over with golden transactions, and plan the manual lane before you need it."
publishedAt: 2026-10-27
category: "Operational AI"
tags: []
draft: false
---

To keep a system migration from breaking at go-live, treat the integrations as the project and the new system as one part of it. Start the integration work as early as the configuration work, test whole transactions across every system they touch, cut over with a handful of golden transactions before you open the floor, and decide ahead of time who fixes problem orders by hand if something slips through.

I learned this on an on-prem to SaaS warehouse management system (WMS) migration: about three months of prep before the project officially started, then about eight months of configuration, development, interfaces, testing, deployment, and support. The new WMS was never the hard part. The integrations were. AI helped most in the unglamorous places: interface code, documentation, and the endless stream of tickets.

## Why do system migrations break in the integrations?

Because the new system is the part everyone tests, and the integrations are the part that carries the risk. A WMS can pick, pack, and ship an order perfectly and still leave a mess behind it: the order doesn't close in the ERP, the inventory doesn't update for the stores, the tracking never reaches the system that tells the customer where the package is.

On our project, the integrations weren't moved over as they were. They were rebuilt. The old ones were custom C# services, and they were redone on a cloud middle tier. Getting orders out the door in the new WMS took less effort than proving that every order still landed correctly in the ERP and in the delivery tracking downstream.

That's not unusual. In MuleSoft's 2025 Connectivity Benchmark Report (1,050 IT leaders, with Vanson Bourne and Deloitte Digital), the average enterprise runs 897 applications and only 29% of them are integrated. IT teams spend 39% of their time building custom integrations. Every one of those custom connections is something a migration has to rebuild or prove.

And migrations in this class often fall short. Gartner's Dixie John told its 2025 Symposium that 70% of ERP initiatives fail to fully meet their original business case goals, and 25% fail catastrophically ([The Register, Nov 2025](https://www.theregister.com/2025/11/13/erp_disaster_gartner/)). A WMS cutover runs on the same kind of plumbing.

## What should you do before the project is approved?

Inventory and document what you already run. I had about a three-month head start on our project, and I spent it on two things:

- **Cleaning out the reports.** I went through every report and stored procedure, documented what each one did, checked who actually used it, and met with the business to confirm what they still needed. The goal was to port as little as possible. Every report you carry over is scope, and this was already a big project. (I wrote up [how to find the reports nobody uses](/blog/find-ssrs-reports-nobody-uses), including what we missed.)
- **Translating configuration and stored procedures into business logic.** The old system's behavior lived in settings and SQL. The new team needed it as rules a person could read: "this order type does this, because the business needs that."

That documentation took a long time to get through. When the project got the green light, it was already well underway. If I'd started it on day one, it would have pushed everything behind it to the right, and the integration work was already starting late.

## How do you keep the scope small enough to finish?

We had three rules:

1. **Essentials first.** What the operation needs to run on day one goes in. Everything else waits.
2. **Customizations at the bare minimum.** The ones we kept were the ones the business couldn't run without, such as the custom interfaces that kept the retail stores' inventory accurate.
3. **Quick wins only from base functionality, and only if they don't touch the timeline.** If the new system could do something useful out of the box with no schedule risk, we took it. If not, we tagged it as post-go-live project work instead of debating it.

The tag mattered as much as the rule. It turned "no" into "not yet, and here is where it lives," which is a much easier conversation with the people asking.

## What does integration testing need to cover?

Every exception scenario, end to end, with a check in every system the transaction touches. Test cases were the biggest single part of the project.

Fulfillment has an enormous number of exception paths: short picks, splits, deleted cartons, and plenty more. Kit items multiply them, because one ordered item becomes several picked ones, and every downstream system has to agree on what shipped. A test that only checks "the WMS shipped it" misses the failures that actually hurt.

So a test case isn't done when the order ships. It's done when:

- the order closed correctly in the ERP, with the right quantities and status
- the inventory moved where it should, including for the stores
- the tracking reached the downstream delivery system
- the exception (if there was one) shows up the same way in each place

## How do you cut over without betting the whole weekend?

We cut over over a weekend, and we didn't open the floor until the golden transactions passed. A golden transaction is an order you walk through the whole chain by hand, right after cutover, checking it at every hop. We ran a small set of them, built to cover the main paths. For each one:

1. I created the order and ran it through the WMS.
2. I checked the XML file the WMS produced, which is the interface out of the WMS.
3. I confirmed the file landed in the folder where the middle tier picks it up.
4. The integrations team checked it on their end to confirm the pipeline was good.
5. We checked that it arrived correctly in the ERP, the CRM, and delivery tracking.

Slow, on purpose. Each hop is a place the rebuilt integrations could fail, and checking them one at a time tells you exactly which hop broke.

Once those came through clean, we scaled up (no pun intended) from there. Volume came in stages, so a problem showed up on a few orders instead of a full wave.

## What happens when something breaks after go-live?

Something will. We had some edge-case integration issues after go-live. They were limited, but they were real.

Rolling back would have done more harm than good. By then the floor was running on the new system, and going back would have meant a second cutover under worse conditions. So we partnered with our support team. They kept the integrations clean and manually fulfilled the handful of problem orders, while the integration developers fixed the underlying issues.

That worked because the support team could do it. Plan for it before go-live, not after:

- Who watches for problem orders, and how do they find them?
- Who's allowed to fulfill or correct an order by hand, and in which system?
- How does a manual fix get recorded, so the integration doesn't fight it later?

## How did AI help on this migration?

We used Copilot and Claude heavily, and the pattern was the same everywhere: we gave it rough notes, existing documentation, and existing tickets, and it drafted something more refined.

- **Documentation.** Business requirements documents (BRDs), interface documentation, and test cases. A migration runs on documents like these, and most of them start as meeting notes and old specs that nobody has time to clean up.
- **Interface development.** The integrations were the long pole, and AI helped write the rebuilt interfaces.
- **Jira tickets.** This was the lifesaver. We front-loaded the tickets and made them extremely granular: hundreds, probably thousands, organized into epics and tags several layers deep so the work stayed findable. The bar was high: someone should be able to open any one of those tickets three years from now and understand it as a complete, fleshed-out ticket. That's hard to do at that scale. Writing them all by hand would have taken weeks, if not more. With AI drafting from our notes, it actually got done.

Claude did a good job overall. It also made mistakes, and I caught some of them too late.

**The tickets.** A few times, a ticket I'd generated had a strange assumption baked in, something the notes never said. I was moving fast and didn't read every one closely before it went into the backlog. I found out the honest way: reading a ticket aloud on a sprint call, getting halfway through, and saying "uhhh... let me fix that real quick." It's funny in hindsight. It's also the cheapest place to catch it. A wrong assumption in a ticket becomes a wrong build if nobody says it out loud.

**The interfaces.** I think leaning on AI that heavily for the interface code was part of why we had edge cases to work through after go-live. The generated code handled the cases we described to it. Edge cases, almost by definition, are the ones nobody described.

## What would I change?

Two things.

**Start the integration work earlier.** Nothing big slipped through that I wish we'd caught sooner. The problem was the late start. The integrations were the long pole of the whole project, and they started after the configuration work was already moving. With more time, we'd have found more of the edge cases in testing instead of in production.

Martin Fowler's line about software integration applies here: "if it hurts, do it more often." The integrations hurt, so they're the ones to start on day one and run through test cases from the first week, not the last month.

**Let the exception list drive the AI-written code, not the other way around.** If AI is writing the interfaces, the test cases have to come first and come from the exception list, so the code gets measured against the cases nobody would think to describe. And every AI-drafted ticket gets read once, by the person who generated it, before it goes in the backlog. Reading it on the sprint call works, but it's late.

One place I'd add AI next time: explaining golden-transaction mismatches. Comparing an order's state across the WMS file, the middle tier, the ERP, the CRM, and tracking is a deterministic check, so it should be a query, not a model. Where AI helps is reading the mismatch and drafting the explanation for whoever has to fix it.

## Same problem, other industries

This is how I'd apply the same approach outside a warehouse:

- **Finance ERP cutovers.** The new general ledger is rarely the problem. The bank feeds, the AP invoice intake, and the payroll export are. Golden transactions here are a payment run and a month-end close on a small set of real entries.
- **Healthcare system migrations.** The lab, pharmacy, and billing interfaces carry the risk. Test patients go end to end, and every system has to agree on the order and the result.
- **Manufacturing.** The link between the shop-floor system and the ERP decides whether a finished job turns into inventory and a shipment. Kits there are bills of materials, with the same multiplying exceptions.

## A checklist you can use

- [ ] Inventory and document reports, stored procedures, and configuration before the project is approved
- [ ] Translate system behavior into business rules a person can read and confirm
- [ ] Keep customizations to what the operation can't run without; tag the rest as post-go-live work
- [ ] Start the integration rebuild alongside the first configuration work
- [ ] Write test cases from the exception list, with a check in every downstream system, before any AI-written interface code
- [ ] Read every AI-drafted ticket once before it goes in the backlog
- [ ] Pick golden transactions that cover the main paths, and check them at every hop
- [ ] Ramp volume in stages after cutover
- [ ] Name the manual lane: who finds problem orders, who fixes them, and how fixes are recorded

## Tools

The report-inventory step is what [sql-xray](https://github.com/tjpinder/sql-xray) does across an SSRS and SQL Server estate: it finds duplicates, contradictions, dependencies, and risks, and produces a keep, consolidate, retire, or review list. It's read-only, so you can run it before anyone approves anything.

I built it by directing coding agents (Claude Code). I own the rules about what counts as dead or duplicate, the guardrails, and the tests that prove them.
