# SCHMACK Email Localisation Tool

A lightweight full-stack tool that streamlines the email localisation process for CRM campaigns.

## How to run

**Backend:**
```bash
cd server
npm install
npm run start
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The backend runs on `http://localhost:3000`.

You'll need a `.env` file in the `server/` folder:
```
DEEPL_AUTH_KEY=your_key_here
```

---

## What it does

- Paste source email content or upload a `.txt`, `.json`, `.csv`, or `.docx` file
- Select a target language from the full list of DeepL-supported languages
- Translate the content field by field via the DeepL API
- Preview the translated copy rendered inside the provided HTML email template

---

## How I broke down the problem

The core challenge was: take unstructured or semi-structured email content in multiple formats, translate it, and inject it into a fixed HTML template, without breaking anything that shouldn't be translated.

I approached it in the following layers:

**1. API integration:** first I connected the DeepL API and made sure that pasted text was working. At this point I noticed that DeepL generally handles merge tags and links without translating them.

**2. Parsing the other formats:** for this I considered multiple approaches — for example, sending binary files to the server and handling parsing there, which might have been better for further scaling. However, for the current prototype and use case, I chose to convert all input formats (paste, txt, json, csv, docx) into the same internal dictionary on the frontend before submitting to the backend. This way the translation and injection logic doesn't need to care where the content came from.

**3. Translation:** the backend receives the content dictionary and translates each field separately via DeepL. Translating field by field rather than as one blob keeps the structure intact and makes it easier to inject back into the template.

**4. Injection:** the frontend loads the HTML template and uses `DOMParser` with `data-block-id` selectors to inject each translated field into the right place. This is more reliable than regex on HTML and maps cleanly to the template's existing structure.

---

## Technologies and libraries used

**Frontend:** React, TypeScript, Vite  
**Backend:** Node.js, Express 4, TypeScript, tsx  
**Translation:** DeepL API via `deepl-node`  
**File parsing:** mammoth (docx extraction)  
**AI tools used during development:** Claude (Anthropic) — used for debugging, code suggestions, and architectural discussion throughout

---

## Edge cases considered

**Merge tags:** before sending to DeepL, merge tags like `{{first_name}}` and `{{expiry_date}}` are preserved by translating field by field rather than as raw text. DeepL tends to leave `{{...}}` patterns untouched, but the structured approach adds an extra layer of safety.

**URLs and email addresses:** footer content containing `https://schmack.co.uk` and `hello@schmack.com` passes through translation. DeepL generally preserves URLs, but extracting before translation and restoring them afterwards would be a more robust solution.

**CTA length:** after translation, the tool checks if the translated CTA is more than 30% longer than the original and warns the user. Some languages expand short phrases significantly which can overflow button containers in email templates.

**Windows line endings:** the txt parser normalises `\r\n` to `\n` before splitting, which was a real issue encountered during development.

**Empty fields:** the backend skips empty strings before calling DeepL, which throws an error on empty input.

---

## Assumptions made

- Source content is always in English
- The HTML email template structure (and `data-block-id` attributes) is fixed and known


---

## What I would improve with more time

- **Uploading .docx files ** docx files don't follow the same section structure as .txt. Although I implemented the .docx parsing function, the content landed entirely in the intro field, which was both not very useful, and made everything I previously said about DeepL handling the merge_tags well fail, so I decided against it. Parsing the .docx in structured sections would solve this.
- **Handle the email injection better:** right now if certain fields are missing (e.g., the csv file is missing some lines or tags) the layout looks a little off
- **URL and merge tag protection:** implement placeholder substitution before translation to guarantee URLs and merge tags survive any translation API behaviour
- **Source language detection:** currently assumes English; could auto-detect using DeepL's language detection
- **Export:** let the user download the translated HTML or copy the translated content
- **Express 4 over Express 5:** we don't need to talk about why


