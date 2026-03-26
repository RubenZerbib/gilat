/**
 * PDF Field Coordinate Mapping
 *
 * Coordinates are in PDF points (1 point = 1/72 inch).
 * Origin is bottom-left corner of each page.
 * Standard A4 page: 595.28 x 841.89 points.
 *
 * These coordinates map form field values to their positions
 * on the original clinic PDF document (3 pages).
 *
 * IMPORTANT: Adjust these coordinates after testing with the actual PDF.
 * Use a PDF coordinate tool to get exact positions.
 */

export interface FieldPosition {
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
}

export interface SignaturePosition extends FieldPosition {
  width: number;
  height: number;
}

export interface PageMapping {
  [key: string]: FieldPosition | SignaturePosition;
}

export const PDF_FIELD_MAPPING = {
  page1: {
    fullName: { x: 140, y: 718, fontSize: 12, maxWidth: 200 } as FieldPosition,
    idNumber: { x: 140, y: 693, fontSize: 12, maxWidth: 150 } as FieldPosition,
    date: { x: 140, y: 668, fontSize: 11, maxWidth: 120 } as FieldPosition,
    signature: { x: 100, y: 580, width: 150, height: 50 } as SignaturePosition,
  },

  page2: {
    question1: { x: 100, y: 720, fontSize: 11 } as FieldPosition,
    question2: { x: 100, y: 700, fontSize: 11 } as FieldPosition,
    question3: { x: 100, y: 680, fontSize: 11 } as FieldPosition,
    question4: { x: 100, y: 660, fontSize: 11 } as FieldPosition,
    question5: { x: 100, y: 640, fontSize: 11 } as FieldPosition,
    question6: { x: 100, y: 620, fontSize: 11 } as FieldPosition,
    question7: { x: 100, y: 600, fontSize: 11 } as FieldPosition,
    question8: { x: 100, y: 580, fontSize: 11 } as FieldPosition,
    question9: { x: 100, y: 560, fontSize: 11 } as FieldPosition,
    question10: { x: 100, y: 540, fontSize: 11 } as FieldPosition,
    medications: { x: 100, y: 480, fontSize: 10, maxWidth: 400 } as FieldPosition,
    allergies: { x: 100, y: 440, fontSize: 10, maxWidth: 400 } as FieldPosition,
    additionalNotes: { x: 100, y: 400, fontSize: 10, maxWidth: 400 } as FieldPosition,
    date: { x: 140, y: 120, fontSize: 11, maxWidth: 120 } as FieldPosition,
    signature: { x: 100, y: 50, width: 150, height: 50 } as SignaturePosition,
  },

  page3: {
    fullName: { x: 140, y: 718, fontSize: 12, maxWidth: 200 } as FieldPosition,
    date: { x: 140, y: 693, fontSize: 11, maxWidth: 120 } as FieldPosition,
    signature: { x: 100, y: 600, width: 150, height: 50 } as SignaturePosition,
  },
} as const;

export const MEDICAL_QUESTIONS = [
  { id: "question1", label: "האם את/ה סובל/ת ממחלות לב או כלי דם?" },
  { id: "question2", label: "האם את/ה סובל/ת מסוכרת?" },
  { id: "question3", label: "האם את/ה סובל/ת ממחלות עור?" },
  { id: "question4", label: "האם את/ה סובל/ת מבעיות קרישת דם?" },
  { id: "question5", label: "האם את/ה נוטל/ת תרופות מדללות דם?" },
  { id: "question6", label: "האם את/ה בהריון או מניקה?" },
  { id: "question7", label: "האם עברת ניתוח פלסטי בעבר?" },
  { id: "question8", label: "האם יש לך אלרגיה לחומרי הרדמה?" },
  { id: "question9", label: "האם את/ה סובל/ת ממחלות אוטואימוניות?" },
  { id: "question10", label: "האם יש לך נטייה ליצירת צלקות קלואידיות?" },
] as const;

export type QuestionId = (typeof MEDICAL_QUESTIONS)[number]["id"];
