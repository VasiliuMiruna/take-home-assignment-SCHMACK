import express from 'express'
import cors from 'cors'
import { translateText } from "./translation";

console.log("THIS FILE IS RUNNING");

const app = express()
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});
// const upload = multer({ storage: multer.memoryStorage() });



app.get('/', (req, res) => {
  res.json({ message: 'Server running' })
})

// app.post("/translate", async (req, res) => {
//   // console.log("BODY:", req.body)  
//   try {
//     const { content, targetLang } = req.body;

    

//     // const translated = await translateText(content, target_lang);
//     const translated = {
//       introCopy: await translateText(content.introCopy, targetLang),
//       primaryCta: await translateText(content.primaryCta, targetLang),
//       feature1Headline: await translateText(content.feature1Headline, targetLang),
//       feature1Copy: await translateText(content.feature1Copy, targetLang),
//       feature2Headline: await translateText(content.feature2Headline, targetLang),
//       feature2Copy: await translateText(content.feature2Copy, targetLang),
//       footerSocialIcons: await translateText(content.footerSocialIcons, targetLang),
//       footerLegal: await translateText(content.footerLegal, targetLang),
//       footerUnsubscribe: await translateText(content.footerUnsubscribe, targetLang),
//     };

//     res.json({
//       translated,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Translation failed" });
//   }
// });

app.post("/translate", async (req, res) => {
  // console.log("BODY:", req.body)
  try {
    const { content, targetLang } = req.body

    const translated: Record<string, string> = {}

    for (const [key, value] of Object.entries(content as Record<string, string>)) {
      if (value && value.trim()) {
        translated[key] = await translateText(value, targetLang)
      } else {
        translated[key] = value ?? ''
      }
    }

    res.json({ translated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Translation failed" })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

process.stdin.resume()
console.log("Process kept alive")