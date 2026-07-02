# Jr. Engineer Take Home Assignment 2026

## Scenario

One of SCHMACK's clients sends CRM campaigns across multiple international markets. Every campaign starts in English before being localised into several languages. Today, that process is almost entirely manual. The process is repetitive, time consuming, and introduces opportunities for human error. SCHMACK has identified this as an opportunity to build a tool that makes localisation significantly faster while maintaining quality.

## The Task

Design and build a lightweight tool that streamlines the email localisation process.

Your solution should allow a user to:

- Upload or paste source email content
- Select a target language
- Generate localised content
- Preview the translated copy inside a HTML email template

Please spend no more than four hours completing the task.

## Localisation

You may use any localisation approach you feel is appropriate.

Some free options include:

- [DeepL](https://www.deepl.com/en/pro#api) - up to 1,000,000 characters per month
- [Google Cloud Translation](https://cloud.google.com/translate) - free monthly usage with GCP's free tier
- [LibreTranslate](https://libretranslate.com/) - open source translation API

Alternatively, if you wish not to rely on an external service, you may mock the localisation process using a deterministic function if you speak multiple languages.

Note: We will not assess translation quality.

## Input Formats

Your solution should support uploading one or more of the following file types:

- `.docx`
- `.txt`
- `.json`
- `.csv`
- Pasted text

## Edge Cases to Consider

Consider how your solution handles scenarios such as:

- Merge tags/variables, for example `{{first_name}}`, remaining unchanged
- Links and URLs being preserved
- CTA length

You do not need to solve every possible edge case, but you should be able to demonstrate that you've thought about some of them.

## Deliverables

Please provide:

- The source code. Invite `jackdolbs` and `harryfremantle` to the GitHub repo.
- A README explaining how to run the project, any assumptions you made, technologies and libraries used, any AI tools used during development, and what you would've improved with more time

## Possible Approaches

There is no single correct approach. Choose the architecture, technologies, and user experience you believe best solve the problem as a POC.

## What We're Looking For

There is intentionally no "perfect" solution. We're interested in seeing how you think, the trade-offs you make, and how you communicate those decisions.

On the presentation call, we'll talk about:

- How you break down the problem
- Code maintainability
- User experience and interface design
- Technical decision making
- Handling of edge cases
- Overall pragmatism completing the task

## Supporting Materials

This repo includes:

- HTML template: `supporting-materials/email-template.html`
- Source copy: `supporting-materials/source-copy.txt`, `supporting-materials/source-copy.json`, and `supporting-materials/source-copy.csv`
