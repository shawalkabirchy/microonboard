# Portfolio package

## Case-study summary

**MicroOnboard: a better first five minutes.** A self-initiated ConsoleLog Studio project for SaaS owners who need a small, accessible welcome flow. A browser-based editor produces portable JSON; an independent runtime guides visitors on an owner-controlled page. The working Acme Studio example demonstrates project creation, tasks, team controls, and settings.

The central constraints are zero additional hosting cost, no accounts or tracking, and an embed that does not require the host to adopt React. Tradeoffs are explicit: local browser storage, one page per tour, stable first-party targets, and completion per browser profile. No customer activation or conversion outcome has been measured or claimed.

The live `/case-study/` page explains the workflow and engineering decisions. Screenshots in `docs/screenshots/` use synthetic data only.

## 45–60 second walkthrough script

1. **0–8 seconds:** Open the landing page. “A new product should feel like a place you can find your way around.”
2. **8–20 seconds:** Open the demo, advance through the four tour steps, and finish. “A few well-placed hints introduce the important moments. Visitors can leave and replay whenever they like.”
3. **20–35 seconds:** Open the builder, pick the New project target, edit the title, and save. “The tour belongs to the product owner: choose a stable target, add context, and check the result.”
4. **35–48 seconds:** Export JSON and show the standalone installation snippet. “The result is a small independent runtime and a portable configuration. The host doesn't need React.”
5. **48–60 seconds:** Show the plain HTML host and repository. “Built by ConsoleLog Studio as a self-initiated project. No tracking, no account, and a clear path when a target is missing.”

## LinkedIn draft 1 — the problem

The first five minutes of a SaaS product can carry a lot of uncertainty.

Where do I start? Where will my work live? Is this button the next step?

I built MicroOnboard as a ConsoleLog Studio portfolio project to explore a smaller welcome: a few helpful steps attached to the moments that matter.

The editor runs in the browser. The result is a guided tour you can embed on a page you control, without adding tracking or an account system.

Which part of your product do new users most often ask you to explain?

## LinkedIn draft 2 — a build decision

A product tour is easy to demonstrate when every element is exactly where you expect it.

The interesting case is the missing button.

MicroOnboard waits briefly for a target to appear. If it never becomes available, the visitor can skip the step or end the tour. Skipping doesn't quietly count as completing onboarding.

I also kept the controls non-modal, so keyboard users can still move through the host page.

These details don't make a dramatic dashboard screenshot. They make the actual introduction less frustrating.

Code and working demo: https://github.com/shawalkabirchy/microonboard

## LinkedIn draft 3 — the demo

MicroOnboard is a working ConsoleLog Studio portfolio project: a tour builder, an independent embed runtime, and a small project workspace to try it on.

Pick a stable target. Write a useful hint. Preview the steps. Export the configuration and install it on your page.

The first release stays deliberately focused: one page per tour, local drafts, no accounts, no analytics, and completion remembered in one browser profile.

Try it: https://microonboard.pages.dev

If your team has a workflow like this, I'd be interested in how you introduce it to new users.

These are drafts for the owner; none are published automatically.
