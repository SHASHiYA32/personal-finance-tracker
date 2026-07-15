export const financeTools = {
  addExpense: {
    description: "Record a new expense item when the user mentions spending money.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The item or reason for the expenditure (e.g., 'bun')" },
        amount: { type: "number", description: "The cost/amount spent" },
        category: { type: "string", description: "The category classification (e.g., 'Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other')" },
        date: { type: "string", description: "ISO date string or YYYY-MM-DD. Defaults to today's date if not specified." },
        note: { type: "string", description: "Any additional details mentioned." }
      },
      required: ["title", "amount", "category", "date"]
    }
  },
  addIncome: {
    description: "Record incoming funds when the user mentions earning or receiving money.",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string", description: "Where the money came from (e.g., 'Salary', 'Freelance')" },
        amount: { type: "number", description: "The amount earned" },
        date: { type: "string", description: "ISO date string or YYYY-MM-DD." }
      },
      required: ["source", "amount", "date"]
    }
  },
  requestDelete: {
    description: "Call this whenever the user wants to remove or delete an item (expense, income, or budget).",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "The ID of the item to delete, if known or deducible." },
        itemType: { type: "string", enum: ["expense", "income", "budget"], description: "The type of record being targeted." },
        descriptionText: { type: "string", description: "A summary of what is being deleted to show in the UI modal." }
      },
      required: ["itemType", "descriptionText"]
    }
  }
};