import { Router, Request, Response } from 'express';
import { nousService } from './nous';

const router = Router();

// Chat endpoint for Nous AI
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const response = await nousService.sendChatMessage(message);
    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
