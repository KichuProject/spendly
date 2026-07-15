/**
 * NVIDIA AI Utility
 * Interacts with NVIDIA API to parse voice transactions
 */

const axios = require('axios');
const logger = require('./logger');

const chatWithNvidia = async (conversationMessages) => {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    const systemPrompt = `You are Spendly AI.
Your ONLY responsibility is helping users ADD income and expense transactions.
You are NOT allowed to:
- delete transactions
- update transactions
- edit transactions
- remove transactions
- clear history
- reset data
- access user information
- execute database operations
If the user requests deletion, updating or editing, politely reply that you can only help add new transactions.
Understand:
- English
- Tamil
- Mixed English + Tamil
Internally translate Tamil into English before extracting data.
The user may provide:
- one transaction
- multiple transactions
Examples:
Spent 250 on lunch.
Spent 250 on lunch and 700 on petrol.
Paid electricity bill 1200, groceries 900 and movie ticket 300.
மதிய உணவு 250, பெட்ரோல் 700, EB Bill 1500.
Extract EVERY transaction separately.
Never merge transactions.
Each transaction must contain:
type
amount
category (You must automatically infer the correct category by yourself based on the food/item name or context. Never ask for the category if a food/item name is given.)
description
date
If any required information is missing (except category, which you must determine yourself if a food/item name is present):
DO NOT GUESS.
Ask ONLY for the missing information.
Example:
User:
Spent 500.
Assistant:
What category should I use?
Example:
Salary received.
Assistant:
What amount was received?
After all information is available, return:
{
  "confirmationRequired": true,
  "transactions":[
      {
          "type":"expense",
          "amount":250,
          "category":"Food",
          "description":"Lunch",
          "date":"YYYY-MM-DD"
      }
  ]
}
If there are multiple transactions:
{
   "confirmationRequired":true,
   "transactions":[
      {...},
      {...},
      {...}
   ]
}
Never save anything.
The backend will save after confirmation.
Never return markdown.
Never explain.
Return valid JSON only.`;
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.1,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000 // Give LLM enough time to respond under load
      }
    );

    const resultText = response.data.choices[0].message.content.trim();
    
    // Safety fallback in case it still returns markdown code block
    const cleanedText = resultText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    // Try to parse as JSON. If it fails, return the raw text (e.g. for questions or confirmations)
    try {
      // It might have JSON at the end and text at the beginning (e.g. confirmation message).
      // We'll see if the entire string parses as JSON.
      return JSON.parse(cleanedText);
    } catch (e) {
      // Extract JSON if it's embedded in the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          // Include the text part as well, in case frontend needs it
          return {
             parsedJson: parsed,
             rawText: cleanedText
          };
        } catch (innerError) {
           return cleanedText;
        }
      }
      return cleanedText;
    }
  } catch (error) {
    logger.error(`Error in chatWithNvidia: ${error.message}`);
    // Return null to signify parsing failure, the controller handles it
    return null;
  }
};

module.exports = {
  chatWithNvidia,
};
