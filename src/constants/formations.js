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
    { posCode:"PO",  left:"50%", top:"88%" },
    { posCode:"LI",  left:"14%", top:"72%" },
    { posCode:"DC",  left:"34%", top:"74%" },
    { posCode:"DC",  left:"66%", top:"74%" },
    { posCode:"LD",  left:"86%", top:"72%" },
    { posCode:"MC",  left:"25%", top:"52%" },
    { posCode:"MC",  left:"50%", top:"48%" },
    { posCode:"MC",  left:"75%", top:"52%" },
    { posCode:"EI",  left:"18%", top:"22%" },
    { posCode:"DEL", left:"50%", top:"15%" },
    { posCode:"ED",  left:"82%", top:"22%" },
  ],
  "4-4-2": [
    { posCode:"PO",  left:"50%", top:"88%" },
    { posCode:"LI",  left:"14%", top:"74%" },
    { posCode:"DC",  left:"34%", top:"76%" },
    { posCode:"DC",  left:"66%", top:"76%" },
    { posCode:"LD",  left:"86%", top:"74%" },
    { posCode:"MI",  left:"14%", top:"52%" },
    { posCode:"MC",  left:"36%", top:"54%" },
    { posCode:"MC",  left:"64%", top:"54%" },
    { posCode:"MD",  left:"86%", top:"52%" },
    { posCode:"DEL", left:"36%", top:"18%" },
    { posCode:"DEL", left:"64%", top:"18%" },
  ],
  "3-5-2": [
    { posCode:"PO",  left:"50%", top:"88%" },
    { posCode:"DC",  left:"25%", top:"74%" },
    { posCode:"DC",  left:"50%", top:"76%" },
    { posCode:"DC",  left:"75%", top:"74%" },
    { posCode:"MI",  left:"10%", top:"52%" },
    { posCode:"MC",  left:"30%", top:"54%" },
    { posCode:"MC",  left:"50%", top:"49%" },
    { posCode:"MC",  left:"70%", top:"54%" },
    { posCode:"MD",  left:"90%", top:"52%" },
    { posCode:"DEL", left:"36%", top:"18%" },
    { posCode:"DEL", left:"64%", top:"18%" },
  ],
  "4-2-3-1": [
    { posCode:"PO",  left:"50%", top:"88%" },
    { posCode:"LI",  left:"14%", top:"74%" },
    { posCode:"DC",  left:"34%", top:"76%" },
    { posCode:"DC",  left:"66%", top:"76%" },
    { posCode:"LD",  left:"86%", top:"74%" },
    { posCode:"VOL", left:"38%", top:"60%" },
    { posCode:"VOL", left:"62%", top:"60%" },
    { posCode:"EI",  left:"18%", top:"38%" },
    { posCode:"ENG", left:"50%", top:"35%" },
    { posCode:"ED",  left:"82%", top:"38%" },
    { posCode:"DEL", left:"50%", top:"15%" },
  ],
  "5-3-2": [
    { posCode:"PO",  left:"50%", top:"88%" },
    { posCode:"LI",  left:"10%", top:"70%" },
    { posCode:"DC",  left:"28%", top:"76%" },
    { posCode:"DC",  left:"50%", top:"78%" },
    { posCode:"DC",  left:"72%", top:"76%" },
    { posCode:"LD",  left:"90%", top:"70%" },
    { posCode:"MC",  left:"30%", top:"50%" },
    { posCode:"MC",  left:"50%", top:"47%" },
    { posCode:"MC",  left:"70%", top:"50%" },
    { posCode:"DEL", left:"36%", top:"18%" },
    { posCode:"DEL", left:"64%", top:"18%" },
  ],
};
