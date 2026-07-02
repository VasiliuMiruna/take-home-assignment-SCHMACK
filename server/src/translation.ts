import * as deepl from 'deepl-node'
import dotenv from 'dotenv'
dotenv.config()

const authKey = process.env.DEEPL_AUTH_KEY ?? ''

console.log("translate.ts loaded")
console.log("API KEY:", authKey ? "found" : "MISSING")

const deeplClient = new deepl.DeepLClient(authKey)



export async function translateText(text: string, target_lang: deepl.TargetLanguageCode) {
  const result = await deeplClient.translateText(
    text, null, target_lang
  )
  return result.text
}