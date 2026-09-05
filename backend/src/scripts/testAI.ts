import "dotenv/config"
import { analyzePaymentFailure } from "../ai/diagnosis/diagnosisService"
import { interpretCustomerMessage } from "../ai/responseInterpreter/responseInterpreter"
import { generateRecoveryMessage } from "../ai/messageGenerator/messageGenerator"

const run = async () => {
  console.log("--- Testing diagnosisService ---")
  const diagnosis = await analyzePaymentFailure({
    provider: "razorpay",
    failureReason: "insufficient funds in account",
    amount: 5000,
    currency: "INR",
  })
  console.log(diagnosis)

  console.log("--- Testing responseInterpreter ---")
  const intent = await interpretCustomerMessage("I'll pay tomorrow evening")
  console.log(intent)

  console.log("--- Testing messageGenerator ---")
  const message = await generateRecoveryMessage({
    customerName: "Rahul Sharma",
    amount: 5000,
    currency: "INR",
    reason: "insufficient_balance",
  })
  console.log(message)
}

run().catch((err) => console.error("AI TEST FAILED:", err))