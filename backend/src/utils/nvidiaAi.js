/**
 * NVIDIA AI Utility
 * Interacts with NVIDIA API to parse voice transactions
 */

const axios = require('axios');
const logger = require('./logger');
const { toDateKey, getStartOfWeek, getStartOfMonth } = require('./dateUtils');

const chatWithNvidia = async (conversationMessages, dbContext = {}) => {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    const today = new Date();
    const todayStr = toDateKey(today);
    const startOfWeekStr = toDateKey(getStartOfWeek(today));
    const startOfMonthStr = toDateKey(getStartOfMonth(today));

    const systemPrompt = `You are Spendly AI.
Your ONLY responsibility is helping users ADD income and expense transactions.
Current reference date context:
- Today's date is: ${todayStr}
- Start of this week: ${startOfWeekStr}
- Start of this month: ${startOfMonthStr}
Use these dates when resolving user's analytical questions asking for "today", "this week", "this month", "yesterday", or specific date ranges. Always format filter dates as YYYY-MM-DD.

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
description (Be specific! Always capture the specific food or item name as described by the user, e.g. "Biryani" or "Pizza" instead of generic "Food" or "Lunch" or "Expense", so the UI can choose the specific matching icon.)
emoji (Determine a suitable single emoji representing the food or item name, e.g. 🍕 for pizza, 🍔 for burger, ☕ for tea/coffee, 🚗 for taxi/uber, 🍿 for movie, 💸 for general expense, 💰 as default.)
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
          "emoji":"🍔",
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
Return valid JSON only.

Additionally, you can answer questions about the user's spending data.
When the user asks analytical questions like:
- "How much did I spend today/this week/this month?"
- "Show food/travel expenses"
- "Compare this month with last month"
- "Show expenses above ₹1000"
- "What category costs the most?"
- "Show UPI/card/cash payments"
- "Show tagged transactions"
- "What was my biggest expense?"
- "Show expenses between two dates"

Respond with a JSON object:
{
  "confirmationRequired": false,
  "queryType": "analytics",
  "reply": "Here's what I found...",
  "filters": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "category": "Food",
    "type": "solo",
    "paymentMethod": "upi",
    "minAmount": 1000,
    "sortBy": "amount",
    "limit": 10
  }
}

Only include the "filters" key in the JSON object if the user explicitly asks to "show cards", "render cards", "filter list", or "show transaction list" in their query. Otherwise, you MUST completely omit the "filters" key from the JSON response and only output "confirmationRequired", "queryType", and "reply".
Never fabricate data.`;

    let finalSystemPrompt = systemPrompt;
    if (dbContext && dbContext.expenses) {
      finalSystemPrompt += `\n\nHere are the user's actual database records to answer any analytical or query questions accurately:`;
      if (dbContext.expenses && dbContext.expenses.length > 0) {
        finalSystemPrompt += `\n\nExpenses records:\n${JSON.stringify(dbContext.expenses, null, 2)}`;
      } else {
        finalSystemPrompt += `\n\nNo transaction records were found in the database.`;
      }

      if (dbContext.totals) {
        finalSystemPrompt += `\n\nDatabase Analytics Summary (ALWAYS USE THESE PRE-CALCULATED SUMS FOR TOTALS):
- Total spent today (${todayStr}): ₹${dbContext.totals.todaySum}
- Total spent this week (since ${startOfWeekStr}): ₹${dbContext.totals.weekSum}
- Total spent this month (since ${startOfMonthStr}): ₹${dbContext.totals.monthSum}
- Total overall spent: ₹${dbContext.totals.totalSum}
- Total income today (${todayStr}): ₹${dbContext.totals.todayIncomeSum}
- Total income this week (since ${startOfWeekStr}): ₹${dbContext.totals.weekIncomeSum}
- Total income this month (since ${startOfMonthStr}): ₹${dbContext.totals.monthIncomeSum}
- Total overall income: ₹${dbContext.totals.totalIncomeSum}
- Net savings/balance today (${todayStr}): ₹${dbContext.totals.netToday}
- Net savings/balance this week: ₹${dbContext.totals.netWeek}
- Net savings/balance this month: ₹${dbContext.totals.netMonth}
- Net savings/balance overall: ₹${dbContext.totals.netTotal}
- Expense Category Breakdown: ${JSON.stringify(dbContext.categoryBreakdown, null, 2)}
- Income Category Breakdown: ${JSON.stringify(dbContext.incomeCategoryBreakdown, null, 2)}`;
      }

      finalSystemPrompt += `

Instructions for using database records:
1. If the user asks general questions like "how much did I spend", "what is my spending", "what is my income", "how much did I earn", "what is my net savings", "what is my balance", or "tell me my total":
- Look at the "Database Analytics Summary" above. State the exact pre-calculated sum for that period.
- For example, if they ask for this month's expense, look at the "Total spent this month" line and output it (e.g., "Your total expense for this month is ₹${dbContext.totals ? dbContext.totals.monthSum : 0}.").
- For income queries, look at the appropriate "Total income" line. For net savings or balance queries, look at the appropriate "Net savings/balance" line.
- NEVER use placeholders like 12345 or fabricate random numbers. Use the exact summary numbers provided.

2. If the user asks "what are all the transactions/expenses", "show my expenses/income", "list my transactions", or similar queries to show or list details:
- Calculate correct sums and list EVERY individual record's details (e.g., descriptions, dates, amounts, categories) directly in the "reply" text message.
- For listing records, use a clean list format (e.g., "Here are your transactions:\n- Salary: +₹50000 (1 Jul)\n- Tea: -₹10 (20 Jul)\n- Lunch: -₹250 (20 Jul)\nTotal Expense: ₹260 | Total Income: ₹50000 | Net: +₹49740").

General rules:
- By default, do NOT output the "filters" object in the JSON payload (leave it undefined or omit it). Only use the text "reply" message.
- Do NOT show transaction cards/inline results unless the user explicitly requests them (e.g., using keywords like "show cards", "show inline cards", "filter cards"). Otherwise, always answer using ONLY the "reply" text message.
- Ensure all sums, item descriptions, and calculations are 100% correct based on the provided records.`;
    } else {
      finalSystemPrompt += `\n\nNo records were found in the database. When the user asks analytical queries, state that they have no data registered yet.`;
    }

    let response;
    let retries = 2;
    while (retries >= 0) {
      try {
        response = await axios.post(
          'https://integrate.api.nvidia.com/v1/chat/completions',
          {
            model: 'meta/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: finalSystemPrompt },
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
            timeout: 15000
          }
        );
        break; // Success!
      } catch (err) {
        if (retries === 0) throw err;
        retries--;
        logger.warn(`NVIDIA AI request failed, retrying... (${2 - retries} retry). Error: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

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
