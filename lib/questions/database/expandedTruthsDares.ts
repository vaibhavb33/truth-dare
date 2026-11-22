import { Question } from '@/types';
import { EXPANDED_TRUTHS } from './expandedTruths';
import { EXPANDED_DARES } from './expandedDares';

export const EXPANDED_TRUTHS_DARES: Question[] = [
  ...EXPANDED_TRUTHS,
  ...EXPANDED_DARES,
];
export { EXPANDED_TRUTHS, EXPANDED_DARES };
