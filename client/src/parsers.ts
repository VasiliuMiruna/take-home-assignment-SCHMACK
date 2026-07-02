// maps file keys to your internal dictionary keys
const KEY_MAP: Record<string, string> = {
  intro_copy: "introCopy",
  primary_cta: "primaryCta",
  feature_1_headline: "feature1Headline",
  feature_1_copy: "feature1Copy",
  feature_2_headline: "feature2Headline",
  feature_2_copy: "feature2Copy",
  footer: "footerLegal",
}

const mapKeys = (raw: Record<string, string>): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    const mapped = KEY_MAP[key]
    if (mapped) result[mapped] = value
  }
  return result
}

export const parseJson = (text: string): Record<string, string> => {
  const raw = JSON.parse(text)
  return mapKeys(raw)
}
export const parseCsv = (text: string): Record<string, string> => {
  const raw: Record<string, string> = {}
  const regex = /^([^,]+),"?([\s\S]*?)"?(?=\n[^,]+,|\n*$)/gm
  
  let match
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/""/g, '"')
    if (key !== 'section') raw[key] = value
  }
  
  return mapKeys(raw)
}

export const parseDocx = async (file: File): Promise<Record<string, string>> => {
  // docx gets extracted as text then parsed like txt
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return { introCopy: result.value } // docx just goes into intro as raw text
}

export const parseEmailContent = (text: string): Record<string, string> => {
  // normalize Windows line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  
  const content: Record<string, string> = {
    introCopy: '',
    primaryCta: '',
    feature1Headline: '',
    feature1Copy: '',
    feature2Headline: '',
    feature2Copy: '',
    footerLegal: '',
  }

  let i = 0

  // Intro: everything before "Primary CTA"
  const introParts: string[] = []
  while (i < lines.length && !lines[i].trimEnd().startsWith("Primary CTA")) {
    introParts.push(lines[i])
    i++
  }
  content.introCopy = introParts.join("\n").trim()
  i++ // skip "Primary CTA" label

  // next non-empty line is the CTA
  while (i < lines.length && !lines[i].trim()) i++
  content.primaryCta = lines[i]?.trim() ?? ""
  i++

  // skip to "Feature 1 headline" label
  while (i < lines.length && !lines[i].trimEnd().startsWith("Feature 1 headline")) i++
  i++ // skip the label itself

  // next non-empty line is feature 1 headline
  while (i < lines.length && !lines[i].trim()) i++
  const feature1HeadlineParts: string[] = []
  while (i < lines.length && !lines[i].trimEnd().startsWith("Feature 1 copy")) {
    feature1HeadlineParts.push(lines[i])
    i++
  }
  content.feature1Headline = feature1HeadlineParts.join("\n").trim()
  i++ // skip "Feature 1 copy" label

  while (i < lines.length && !lines[i].trim()) i++
  const feature1CopyParts: string[] = []
  while (i < lines.length && !lines[i].trimEnd().startsWith("Feature 2 headline")) {
    feature1CopyParts.push(lines[i])
    i++
  }
  content.feature1Copy = feature1CopyParts.join("\n").trim()
  i++ // skip "Feature 2 headline" label

  while (i < lines.length && !lines[i].trim()) i++
  const feature2HeadlineParts: string[] = []
  while (i < lines.length && !lines[i].trimEnd().startsWith("Feature 2 copy")) {
    feature2HeadlineParts.push(lines[i])
    i++
  }
  content.feature2Headline = feature2HeadlineParts.join("\n").trim()
  i++ // skip "Feature 2 copy" label

  while (i < lines.length && !lines[i].trim()) i++
  const feature2CopyParts: string[] = []
  while (i < lines.length && !lines[i].trimEnd().startsWith("Footer")) {
    feature2CopyParts.push(lines[i])
    i++
  }
  content.feature2Copy = feature2CopyParts.join("\n").trim()
  i++ // skip "Footer" label

  while (i < lines.length && !lines[i].trim()) i++
  const footerParts: string[] = []
  while (i < lines.length) {
    footerParts.push(lines[i])
    i++
  }
  content.footerLegal = footerParts.join("\n").trim()

  return content
}