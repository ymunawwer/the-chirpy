import express from 'express';
import * as eventsController from '../../modules/events/events.controller';

const router = express.Router();

// RESTful events routes
router.post('/', eventsController.createEvent);
router.get('/', eventsController.listEvents);
router.get('/:eventId', eventsController.getEvent);
router.patch('/:eventId', eventsController.updateEvent);
router.delete('/:eventId', eventsController.deleteEvent);

export default router;
