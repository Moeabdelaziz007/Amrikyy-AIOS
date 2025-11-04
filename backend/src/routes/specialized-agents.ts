import { Router, Request, Response } from 'express';
import { generateContent } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/agents/luna/plan-trip
 * Luna - Travel Planner API
 * 
 * Body:
 * {
 *   "destination": "Paris, France",
 *   "duration": 7,
 *   "budget": 3000,
 *   "preferences": ["museums", "restaurants"]
 * }
 */
router.post('/luna/plan-trip', async (req: Request, res: Response) => {
  try {
    const { destination, duration, budget, preferences } = req.body;

    if (!destination || !duration) {
      return res.status(400).json({
        error: 'Destination and duration are required'
      });
    }

    const prompt = `You are Luna, an expert travel planning AI assistant. Create a detailed ${duration}-day travel itinerary for ${destination}.

Budget: ${budget ? `$${budget}` : 'Flexible'}
Preferences: ${preferences?.join(', ') || 'General sightseeing'}

Provide:
1. Day-by-day itinerary with activities
2. Accommodation recommendations
3. Estimated costs
4. Transportation tips
5. Local cuisine suggestions
6. Important travel tips

Format the response in a clear, structured way.`;

    const itinerary = await generateContent(prompt);

    res.json({
      destination,
      duration,
      budget,
      itinerary: itinerary.trim(),
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Luna travel planning error:', error.message);
    res.status(500).json({
      error: 'Failed to generate travel plan',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/karim/optimize-budget
 * Karim - Budget Optimizer API
 * 
 * Body:
 * {
 *   "expenses": [{"category": "food", "amount": 500}],
 *   "income": 5000,
 *   "goals": ["save for vacation"]
 * }
 */
router.post('/karim/optimize-budget', async (req: Request, res: Response) => {
  try {
    const { expenses, income, goals } = req.body;

    if (!expenses || !income) {
      return res.status(400).json({
        error: 'Expenses and income are required'
      });
    }

    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const expenseBreakdown = expenses.map((exp: any) => `${exp.category}: $${exp.amount}`).join(', ');

    const prompt = `You are Karim, an expert financial planning and budget optimization AI assistant.

Current Financial Situation:
- Monthly Income: $${income}
- Total Expenses: $${totalExpenses}
- Expense Breakdown: ${expenseBreakdown}
- Savings: $${income - totalExpenses}
${goals ? `\nFinancial Goals: ${goals.join(', ')}` : ''}

Provide:
1. Budget optimization recommendations
2. Areas to reduce spending
3. Savings plan to achieve goals
4. Investment suggestions
5. Emergency fund recommendations

Be specific and actionable.`;

    const optimization = await generateContent(prompt);

    res.json({
      income,
      totalExpenses,
      savings: income - totalExpenses,
      optimization: optimization.trim(),
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Karim budget optimization error:', error.message);
    res.status(500).json({
      error: 'Failed to optimize budget',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/scout/find-deals
 * Scout - Deal Finder API
 * 
 * Body:
 * {
 *   "product": "laptop",
 *   "maxPrice": 1000,
 *   "features": ["16GB RAM", "SSD"]
 * }
 */
router.post('/scout/find-deals', async (req: Request, res: Response) => {
  try {
    const { product, maxPrice, features } = req.body;

    if (!product) {
      return res.status(400).json({
        error: 'Product is required'
      });
    }

    const prompt = `You are Scout, an expert deal-finding AI assistant specializing in finding the best prices and deals.

Product Search: ${product}
${maxPrice ? `Max Budget: $${maxPrice}` : ''}
${features ? `Required Features: ${features.join(', ')}` : ''}

Provide:
1. Best value recommendations (specific models/products)
2. Price comparison tips
3. Where to buy (general retailer types)
4. Best time to buy
5. Alternative options that might offer better value
6. Key features to look for

Note: Provide general guidance and recommendations rather than specific real-time prices.`;

    const recommendations = await generateContent(prompt);

    res.json({
      product,
      maxPrice,
      recommendations: recommendations.trim(),
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Scout deal finding error:', error.message);
    res.status(500).json({
      error: 'Failed to find deals',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/maya/support
 * Maya - Customer Support API
 * 
 * Body:
 * {
 *   "issue": "I can't access my account",
 *   "context": "Additional details..."
 * }
 */
router.post('/maya/support', async (req: Request, res: Response) => {
  try {
    const { issue, context } = req.body;

    if (!issue) {
      return res.status(400).json({
        error: 'Issue description is required'
      });
    }

    const prompt = `You are Maya, a professional and empathetic customer support AI assistant.

Customer Issue: ${issue}
${context ? `Additional Context: ${context}` : ''}

Provide:
1. Acknowledgment of the issue
2. Step-by-step troubleshooting or resolution
3. Alternative solutions if applicable
4. Follow-up recommendations
5. Preventive measures

Be empathetic, clear, and solution-focused.`;

    const response = await generateContent(prompt);

    res.json({
      issue,
      response: response.trim(),
      sentiment: 'supportive',
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Maya support error:', error.message);
    res.status(500).json({
      error: 'Failed to generate support response',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/jules/debug
 * Jules - System Debug API
 * 
 * Body:
 * {
 *   "errorMessage": "Cannot connect to database",
 *   "stackTrace": "...",
 *   "systemInfo": {...}
 * }
 */
router.post('/jules/debug', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace, systemInfo } = req.body;

    if (!errorMessage) {
      return res.status(400).json({
        error: 'Error message is required'
      });
    }

    const prompt = `You are Jules, an expert system debugging and self-healing AI assistant.

Error Message: ${errorMessage}
${stackTrace ? `\nStack Trace:\n${stackTrace}` : ''}
${systemInfo ? `\nSystem Info: ${JSON.stringify(systemInfo)}` : ''}

Provide:
1. Root cause analysis
2. Immediate fix recommendations
3. Long-term solutions
4. Prevention strategies
5. Related system checks to perform

Be technical, precise, and actionable.`;

    const analysis = await generateContent(prompt);

    res.json({
      errorMessage,
      analysis: analysis.trim(),
      severity: 'medium',
      status: 'analyzed',
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Jules debug error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze error',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/specialized/health
 * Health check for specialized agents
 */
router.get('/specialized/health', async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'ok',
      agents: ['luna', 'karim', 'scout', 'maya', 'jules'],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
