
/**
 * This file re-exports all table helpers from their new modular locations
 * for backward compatibility with existing imports
 */

import { 
  insertStatut, 
  updateStatut 
} from './supabase/statusHelpers';

import { 
  insertEmploye,
  updateEmploye
} from './supabase/employeeHelpers';

import { 
  insertSchedule,
  updateSchedule
} from './supabase/scheduleHelpers';

import { 
  insertTache, 
  updateTache 
} from './supabase/taskHelpers';

// Re-export all helpers for backward compatibility
export {
  insertStatut,
  updateStatut,
  insertEmploye,
  updateEmploye,
  insertSchedule,
  updateSchedule,
  insertTache,
  updateTache
};
