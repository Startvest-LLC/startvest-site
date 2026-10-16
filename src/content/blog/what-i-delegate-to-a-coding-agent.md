---
title: "Building with Claude Code as an operator, not a programmer: what I delegate and what I never delegate"
description: "I direct a coding agent to write most of my code. I never delegate what the thing is for, what counts as done, what counts as true, or the moment someone looks at it. The split, with the evidence from two real builds."
publishedAt: 2026-10-16
category: "AI Enablement Methods"
tags: []
draft: true
---

I delegate implementation to a coding agent: the code, the tests it writes against my spec, the config, the first draft of most docs. I never delegate four things: what the thing is for, what counts as done, what counts as true, and the moment a person actually looks at it. The agent is fast and usually right. Those four are where "usually" isn't good enough.

That split is the whole method, and it's the skill I think operations teams will need most as AI makes building cheap. Here's what it looks like on two real builds, including what the agent missed and what I got wrong.

## What does "directing a coding agent" actually mean?

It means I write very little code and a lot of spec.

intake-kit, the requirements tool from my [first post](/blog/vague-request-to-build-ready-spec), has 88 commits since October 10. Claude Code co-authored 87 of them. The repo's main design document is literally titled *Claude Code Handoff Spec*. I write what the tool must do, what it must never do, and how we'll know it works. The agent builds against that.

This website is the second example. Claude Code built it: the framework, the layout, the redirects off the old site, the deploy config, the first draft of this copy. I made the decisions and caught what it missed.

This isn't unusual anymore. In the 2025 Stack Overflow Developer Survey, 84% of developers said they use or plan to use AI tools. But 46% said they don't trust the accuracy of the output, more than the 33% who do ([Stack Overflow, 2025](https://survey.stackoverflow.co/2025/ai)). Everyone's using it. Most people don't trust it. The useful question is which parts you trust it with.

## What do I delegate?

Anything where a mistake is cheap to see and cheap to fix.

- **Implementation.** The code itself, against a spec that says what it must do.
- **Tests, written to my bar.** The agent writes the tests. I decide what the tests have to prove.
- **Configuration and plumbing.** Build setup, deploy config, the 101 redirect rules that sent the old site's URLs somewhere sensible.
- **First drafts.** READMEs, docs, and copy. A draft is meant to be rewritten.
- **Research I can verify.** Finding what a system does, then showing me where it found it.

The agent is very good at all of this, and much faster than I would be. Pretending otherwise would be the dishonest part.

## What do I never delegate?

**What the thing is for.** The spec is mine. Not because the agent can't write one, but because the spec is where the operational judgment lives: who uses this, what decision it supports, what happens when it's wrong. intake-kit's spec has a rule for the model inside the tool: *"The LLM never writes `scoring` or `gate`."* Code decides; the model reads and phrases. That's a judgment about where AI belongs, and it's mine to make.

**What counts as done.** I set the bar before any test runs. intake-kit's ship bar was written in advance: zero invented quotes, no loops, the summary always renders, and the gates match ground truth in at least 5 of 6 runs. The fallback was written in advance too: *"if it misses after one fix round: ship the Claude Code plugin as the primary way to use it."* When the second gate came in at 4 of 6, there was nothing to negotiate. We took the fallback. If the agent sets the bar after seeing the results, the bar moves.

**What counts as true.** Anything that makes a claim about me, a number, or the world gets checked against a source. The spec says it plainly: *"Never claim an FDE title he hasn't held."* On this site, the agent pulled a "scope churn dropped" result from a planning doc that I couldn't back up. It's not on the site. A card on the home page claimed intake-kit turns a request into a spec "in 30 minutes." The README had stopped saying that, so the claim came off. Fluent, plausible, and unsupported is exactly what a model produces when nobody checks.

**The moment someone looks at it.** This is the one that surprised me. During the site rebuild, the agent upgraded the framework, ran the build, and checked every page. Every route returned 200. Every redirect worked. I opened the preview and asked one question: *no styling to it?* The new version had quietly stopped emitting CSS. Every automated check passed, because every check tested what the agent thought to test. That bug is now its own check: the build fails if any page links a stylesheet that isn't there. Which is the pattern. The person finds it once, and then the machine checks for it forever.

And I always run a live test myself, after the coded test cases pass. Not instead of them. After them.

## What does judgment look like when the code is fine?

Most of what I caught on this site wasn't a bug. It was a call.

- The headline and the subhead said the same thing twice. The code was fine. The page was weaker.
- A "Built with Claude Code" tag sat alone in the hero. Without what I own next to it, it reads as "this person can't build." That's the opposite of the point.
- The hero said "Manhattan SCALE · SQL Server · SSRS." Accurate, and it fenced me into logistics when the problem I solve is operations-wide. We rewrote the positioning everywhere.
- The site mentioned Claude Code three times on one page. I asked if we were overexplaining. We cut it to once.

None of those are things a test catches. They're things a person who knows the audience catches. That's what operational judgment is, applied to a web page instead of a warehouse floor.

Andrej Karpathy named the opposite approach "vibe coding" in early 2025: give in to the vibes and "forget that the code even exists." For a weekend project, fine. For something an operator will run a shift on, the code can stay mostly out of sight, but the purpose, the bar, the truth, and the final look can't.

## What did I get wrong about delegating?

Testing. I tried to automate my way out of it.

For intake-kit, I built automated evals: simulated requesters with persona cards, played by a model, run through the intake on every important commit, scored against ground truth. They work. They catch the bulk of the issues, and they catch them on every run, which I never could.

So for a while the plan was that the evals were the test. I reversed that.

The second live test of the rebuilt interview is why. I drove it by hand, on the enablement-kit request. The automated gates said it was right, and it was: correct type, correct gate, zero invented quotes, no loops. It still exposed five gaps:

- the gate's reasons didn't list every unmet requirement for a Go
- the discovery brief had no open questions in it
- re-rendering the spec appended duplicate acceptance criteria
- the designated checks didn't run for one kind of request
- a decision card promised a brief that came out empty

None of those would fail a gate. All of them would confuse the person reading the output. Each one is now an automated test.

That's the loop I run now. Automated tests first, because they're tireless. Then I drive it live myself, because I'm the one who notices that something is technically right and still wrong. Whatever the live run finds becomes the next automated test. The automation gets better every round, and I still run the live test every round, because the gaps it finds are the ones nobody thought to write a test for.

## How do you run this split yourself?

1. **Write the spec before the agent writes code.** What it's for, who uses it, what it must never do. Put the "never" rules in writing so the agent applies them.
2. **Set the bar and the fallback before the first test.** Pass criteria, and what you'll do if it misses. Decide while you don't know the answer.
3. **Make every claim cite something.** A number, a result, a statement about a person. No source, no claim.
4. **Look at it yourself, every time.** Open the page. Run the real flow, by hand, after the automated tests pass. A passing test suite tells you the checks passed, not that the thing works.
5. **Turn what you find into a test.** Every gap the live run finds becomes an automated check, so you only have to find it once.
6. **Keep the calls that need your audience.** What a hiring manager, a shift lead, or a buyer will read into something is yours to judge.

The agent changes the cost of building. It doesn't change the cost of deciding what to build, or of knowing whether it's right. That's the job now.

## The receipts

- **intake-kit:** [github.com/tjpinder/intake-kit](https://github.com/tjpinder/intake-kit). The spec, every commit, and [how we tested it](https://github.com/tjpinder/intake-kit/blob/main/docs/evals/how-we-tested-it.md)
- **This site:** [github.com/Startvest-LLC/startvest-site](https://github.com/Startvest-LLC/startvest-site). Built by Claude Code, directed by me, with the commit history to show it
