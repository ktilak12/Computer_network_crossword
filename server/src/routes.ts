import { Router, Request, Response } from 'express';
import { gameEngine } from './gameEngine.js';
import { buildGridCells, getPublicClues, GRID_ROWS, GRID_COLS } from '../../shared/crosswordData.js';

export const apiRouter = Router();

// Create game room
apiRouter.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { settings, hostUrl } = req.body;
    const result = await gameEngine.createRoom(settings || {}, hostUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

// Get room details & public crossword layout
apiRouter.get('/rooms/:code', (req: Request, res: Response) => {
  const room = gameEngine.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const qrCode = gameEngine.getQRCode(room.code);
  const gridCells = buildGridCells();
  const publicClues = getPublicClues();

  res.json({
    room,
    qrCode,
    grid: {
      rows: GRID_ROWS,
      cols: GRID_COLS,
      cells: gridCells,
      clues: publicClues,
    },
  });
});

// Join room
apiRouter.post('/rooms/:code/join', async (req: Request, res: Response) => {
  try {
    const { name, avatar, playerId } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const result = await gameEngine.joinPlayer(req.params.code, name, avatar, playerId);
    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit answer
apiRouter.post('/rooms/:code/submit', async (req: Request, res: Response) => {
  try {
    const { playerId, clueId, answer } = req.body;
    if (!playerId || !clueId || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Missing submission parameters' });
    }

    const result = await gameEngine.submitAnswer(req.params.code, playerId, Number(clueId), answer);
    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Actions
apiRouter.post('/rooms/:code/start', async (req: Request, res: Response) => {
  const success = await gameEngine.startGame(req.params.code);
  if (!success) {
    return res.status(400).json({ error: 'Could not start game (invalid status or room)' });
  }
  res.json({ success: true, message: 'Game started' });
});

apiRouter.post('/rooms/:code/pause', (req: Request, res: Response) => {
  const success = gameEngine.pauseGame(req.params.code);
  res.json({ success });
});

apiRouter.post('/rooms/:code/resume', (req: Request, res: Response) => {
  const success = gameEngine.resumeGame(req.params.code);
  res.json({ success });
});

apiRouter.post('/rooms/:code/end', async (req: Request, res: Response) => {
  const report = await gameEngine.endGame(req.params.code);
  res.json({ success: true, report });
});

apiRouter.post('/rooms/:code/kick', async (req: Request, res: Response) => {
  const { playerId } = req.body;
  const success = await gameEngine.kickPlayer(req.params.code, playerId);
  res.json({ success });
});

// Analytics
apiRouter.get('/rooms/:code/analytics', (req: Request, res: Response) => {
  const report = gameEngine.generateAnalyticsReport(req.params.code);
  res.json(report);
});

// Export CSV
apiRouter.get('/rooms/:code/export-csv', (req: Request, res: Response) => {
  const csv = gameEngine.generateCSVReport(req.params.code);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="netcrossword_${req.params.code}.csv"`);
  res.send(csv);
});

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
