import { useEffect, useState } from "react";
import { LANGUAGES } from "./languages";
import { parseJson, parseCsv, parseEmailContent } from './parsers';

// the default email content shown in the textarea on load
const EMAIL_TEMPLATE_TEXT = `Hi {{first_name}},

If your CRM is scaling across markets, duplicating work is a waste of everyone's time. SCHMACK helps brands build journeys once, localise properly, and move faster without the usual quality drop.

Book a discovery call before {{expiry_date}} and quote SCHMACK25 for a complimentary CRM audit.

Primary CTA  
Book a Discovery Call

Feature 1 headline  
Build once. Launch properly everywhere.

Feature 1 copy  
From strategy and creative through to implementation and optimisation, SCHMACK helps ambitious brands run CRM programmes that scale internationally without turning the customer experience into a compromise.

Feature 2 headline  
Smarter CRM, less busywork.

Feature 2 copy  
Automate the repetitive stuff, improve campaign quality, and spend more time on work that actually moves the business. We combine modern engineering with CRM expertise to help brands move with more intent and less waste.

Footer  
© 2026 SCHMACK. All rights reserved.

Questions? Visit https://schmack.co.uk or contact hello@schmack.com.

Unsubscribe`;

const API_BASE = "http://localhost:3000";

// we need to escape html characters before injecting content into the template
// otherwise things like & or < could break the html structure
const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// newlines in the source text need to become <br/> tags in html
const toHtmlWithLineBreaks = (value: string): string =>
  escapeHtml(value).replaceAll("\n", "<br/>");

// takes the translated content dictionary and injects each field into the right
// place in the html template using the data-block-id attributes as selectors
const injectIntoTemplate = (
  template: string,
  content: Record<string, string>
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, "text/html");

  const setParagraph = (blockId: string, text: string) => {
    const node = doc.querySelector(`[data-block-id="${blockId}"] p`);
    if (node) node.innerHTML = toHtmlWithLineBreaks(text ?? "");
  };

  setParagraph("intro-copy", content.introCopy);
  setParagraph("feature-1-headline", content.feature1Headline);
  setParagraph("feature-1-copy", content.feature1Copy);
  setParagraph("feature-2-headline", content.feature2Headline);
  setParagraph("feature-2-copy", content.feature2Copy);
  setParagraph("footer-legal", content.footerLegal);

  // cta is a link not a paragraph so we handle it separately
  const cta = doc.querySelector('[data-block-id="primary-cta"] a');
  if (cta) cta.textContent = content.primaryCta ?? "";

  return doc.documentElement.outerHTML;
};

function App() {
  const [inputText, setInputText] = useState(EMAIL_TEMPLATE_TEXT);
  // parsedContent holds a structured dictionary when a file is uploaded
  // if null, we fall back to parsing the textarea text in handleTranslate
  const [parsedContent, setParsedContent] = useState<Record<string, string> | null>(null);
  const [targetLang, setTargetLang] = useState("RO");
  // the raw html of the email template, loaded once on mount
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [translated, setTranslated] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ctaWarning, setCtaWarning] = useState("");

  // load the html email template from the public folder when the app starts
  useEffect(() => {
    fetch("/email-template.html")
      .then((res) => res.text())
      .then(setHtmlTemplate);
  }, []);

  // when a file is uploaded, parse it into a content dictionary based on file type
  // json and csv get mapped to our internal dictionary keys
  // txt gets loaded as raw text and parsed later in handleTranslate
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setParsedContent(null);
    setRenderedHtml("");
    setTranslated("");
    setError("");

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "json") {
      const text = await file.text();
      const content = parseJson(text);
      setInputText(JSON.stringify(content, null, 2));
      setParsedContent(content);
    } else if (ext === "csv") {
      const text = await file.text();
      const content = parseCsv(text);
      setInputText(JSON.stringify(content, null, 2));
      setParsedContent(content);
    } else if (ext === "txt") {
      const text = await file.text();
      setInputText(text);
      setParsedContent(null);
    } 
  };

  const handleTranslate = async () => {
    setLoading(true);
    setError("");
    setTranslated("");
    setRenderedHtml("");
    setCtaWarning("");

    try {
      // regardless of input type, we always send a content dictionary to the backend
      // if a structured file was uploaded we use that, otherwise we parse the textarea text
      const content = parsedContent ?? parseEmailContent(inputText);

      const res = await fetch(`${API_BASE}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, targetLang }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Translation failed");
        return;
      }

      // some languages produce much longer CTAs which could overflow the button in the template
      // we warn the user if the translated CTA is more than 30% longer than the original
      const originalCta = content.primaryCta ?? "";
      const translatedCta = data.translated?.primaryCta ?? "";
      if (translatedCta && translatedCta.length > originalCta.length * 1.3) {
        setCtaWarning(
          `⚠️ CTA expanded from ${originalCta.length} to ${translatedCta.length} characters — check button fits template`
        );
      }

      setTranslated(JSON.stringify(data.translated, null, 2));
      setRenderedHtml(injectIntoTemplate(htmlTemplate, data.translated));
    } catch (err) {
      setError("Could not reach server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#ffffff", fontFamily: "Arial, Helvetica, sans-serif" }}>
      
      {/* header */}
      <div style={{ backgroundColor: "#151515", borderBottom: "1px solid #222", padding: "20px 40px", marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          SCHMACK <span style={{ color: "#ff333b" }}>✦</span> Localisation Tool
        </h1>
      </div>

      <div style={{ margin: "0 auto", padding: "0 40px 60px" }}>
        
        {/* two column layout — source content on the left, controls on the right */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
          
          {/* source content textarea — pre-filled with the sample email */}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888" }}>
              Source Content
            </label>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                // if the user edits manually, clear the parsed content so we re-parse from text
                setParsedContent(null);
              }}
              rows={14}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 13,
                boxSizing: "border-box",
                backgroundColor: "#151515",
                color: "#fff",
                border: "1px solid #2a2a2a",
                borderRadius: 4,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* controls column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* file upload — clicking the label triggers the hidden input */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888" }}>
                Upload File
              </label>
              <label style={{
                display: "block",
                padding: "12px 16px",
                backgroundColor: "#151515",
                border: "1px dashed #333",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13,
                color: "#666",
                textAlign: "center",
              }}>
                {selectedFile ? selectedFile.name : "Click to upload .txt, .json, .csv"}
                <input
                  type="file"
                  accept=".txt,.json,.csv"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* language dropdown */}
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888" }}>
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 14,
                  backgroundColor: "#151515",
                  color: "#fff",
                  border: "1px solid #2a2a2a",
                  borderRadius: 4,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* translate button */}
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText}
              style={{
                padding: "14px 24px",
                backgroundColor: loading ? "#333" : "#ff333b",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginTop: "auto",
              }}
            >
              {loading ? "Translating..." : "Translate →"}
            </button>

            {error && (
              <p style={{ color: "#ff333b", fontSize: 13, margin: 0 }}>{error}</p>
            )}
            {ctaWarning && (
              <p style={{ color: "#f5a623", fontSize: 13, margin: 0 }}>{ctaWarning}</p>
            )}
          </div>
        </div>


        {/* the translated email rendered inside the actual html template */}
        {renderedHtml && (
          <div>
            <label style={{ display: "block", marginBottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888" }}>
              Email Preview
            </label>
            <div style={{ border: "1px solid #222", borderRadius: 4, overflow: "hidden" }}>
              <iframe
                srcDoc={renderedHtml}
                style={{ width: "100%", height: 900, border: "none", display: "block" }}
                title="Email Preview"
              />
            </div>
          </div>
        )}
            {/* kept the translated content as raw json for debugging and copy-pasting */}
        {translated && (
          <div style={{ marginBottom: 40 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#888" }}>
              Translated Content
            </label>
            <textarea
              value={translated}
              readOnly
              rows={10}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 13,
                boxSizing: "border-box",
                backgroundColor: "#151515",
                color: "#aaa",
                border: "1px solid #2a2a2a",
                borderRadius: 4,
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;