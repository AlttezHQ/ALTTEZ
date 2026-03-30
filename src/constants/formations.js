/**
 * @module formations
 * @description Formaciones tacticas para Elevate Sports.
 *
 * Formaciones verticales con posiciones como strings con "%" para GestionPlantilla.
 * TacticalBoardV9 define sus propias formaciones landscape inline (HORIZ_FORMATIONS).
 *
 * @version 1.0
 * @author Elevate Sports
 */

// ─────────────────────────────────────────────
// FORMACIONES VERTICALES (campo vertical, posiciones en %)
// Usadas en GestionPlantilla > TacticalBoardView
// ─────────────────────────────────────────────
export const FORMATIONS_VERTICAL = {
  "4-3-3": [
    { posCode:"GK", left:"50%", top:"88%" },
    { posCode:"LB", left:"14%", top:"72%" },
    { posCode:"CB", left:"34%", top:"74%" },
    { posCode:"CB", left:"66%", top:"74%" },
    { posCode:"RB", left:"86%", top:"72%" },
    { posCode:"CM", left:"25%", top:"52%" },
    { posCode:"CM", left:"50%", top:"48%" },
    { posCode:"CM", left:"75%", top:"52%" },
    { posCode:"LW", left:"18%", top:"22%" },
    { posCode:"ST", left:"50%", top:"15%" },
    { posCode:"RW", left:"82%", top:"22%" },
  ],
  "4-4-2": [
    { posCode:"GK", left:"50%", top:"88%" },
    { posCode:"LB", left:"14%", top:"74%" },
    { posCode:"CB", left:"34%", top:"76%" },
    { posCode:"CB", left:"66%", top:"76%" },
    { posCode:"RB", left:"86%", top:"74%" },
    { posCode:"LM", left:"14%", top:"52%" },
    { posCode:"CM", left:"36%", top:"54%" },
    { posCode:"CM", left:"64%", top:"54%" },
    { posCode:"RM", left:"86%", top:"52%" },
    { posCode:"ST", left:"36%", top:"18%" },
    { posCode:"ST", left:"64%", top:"18%" },
  ],
  "3-5-2": [
    { posCode:"GK", left:"50%", top:"88%" },
    { posCode:"CB", left:"25%", top:"74%" },
    { posCode:"CB", left:"50%", top:"76%" },
    { posCode:"CB", left:"75%", top:"74%" },
    { posCode:"LM", left:"10%", top:"52%" },
    { posCode:"CM", left:"30%", top:"54%" },
    { posCode:"CM", left:"50%", top:"49%" },
    { posCode:"CM", left:"70%", top:"54%" },
    { posCode:"RM", left:"90%", top:"52%" },
    { posCode:"ST", left:"36%", top:"18%" },
    { posCode:"ST", left:"64%", top:"18%" },
  ],
  "4-2-3-1": [
    { posCode:"GK", left:"50%", top:"88%" },
    { posCode:"LB", left:"14%", top:"74%" },
    { posCode:"CB", left:"34%", top:"76%" },
    { posCode:"CB", left:"66%", top:"76%" },
    { posCode:"RB", left:"86%", top:"74%" },
    { posCode:"DM", left:"38%", top:"60%" },
    { posCode:"DM", left:"62%", top:"60%" },
    { posCode:"LW", left:"18%", top:"38%" },
    { posCode:"CAM",left:"50%", top:"35%" },
    { posCode:"RW", left:"82%", top:"38%" },
    { posCode:"ST", left:"50%", top:"15%" },
  ],
  "5-3-2": [
    { posCode:"GK", left:"50%", top:"88%" },
    { posCode:"LWB",left:"10%", top:"70%" },
    { posCode:"CB", left:"28%", top:"76%" },
    { posCode:"CB", left:"50%", top:"78%" },
    { posCode:"CB", left:"72%", top:"76%" },
    { posCode:"RWB",left:"90%", top:"70%" },
    { posCode:"CM", left:"30%", top:"50%" },
    { posCode:"CM", left:"50%", top:"47%" },
    { posCode:"CM", left:"70%", top:"50%" },
    { posCode:"ST", left:"36%", top:"18%" },
    { posCode:"ST", left:"64%", top:"18%" },
  ],
};
