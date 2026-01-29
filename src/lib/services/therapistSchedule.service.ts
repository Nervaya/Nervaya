/**
 * Orchestrator: re-exports from sub-services for backward compatibility.
 * Query: getScheduleByDate, getSchedulesByDateRange
 * Slot: bookSlot, releaseSlot, updateSlot, createCustomSlot, deleteSlot
 * Generate: generateSlotsFromConsultingHours
 */
export { getScheduleByDate, getSchedulesByDateRange } from './therapistSchedule-query.service';
export { bookSlot, releaseSlot, updateSlot, createCustomSlot, deleteSlot } from './therapistSchedule-slot.service';
export { generateSlotsFromConsultingHours } from './therapistSchedule-generate.service';
