import Groq from "groq-sdk";
import config from "./env";

export const groq = new Groq({
    apiKey : config.groqApi
})
