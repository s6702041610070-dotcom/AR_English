import { VocabItem } from '../types';

export const VOCABULARY_A: string[] = [
  'cat', 'dog', 'book', 'pen', 'teacher',
  'banana', 'car', 'cup', 'table', 'chair',
  'house', 'bird', 'tiger', 'computer', 'doctor',
  'ball', 'robot', 'bicycle', 'guitar', 'phone',
  'zebra', 'lion', 'monkey', 'panda', 'star',
  'flower', 'tree', 'ship', 'rocket', 'clock'
];

export const VOCABULARY_AN: string[] = [
  'apple', 'egg', 'elephant', 'orange', 'ice cream',
  'umbrella', 'ant', 'owl', 'onion', 'iguana',
  'octopus', 'airplane', 'astronaut', 'avocado', 'insect',
  'igloo', 'eagle', 'anchor', 'alligator', 'artist',
  'engineer', 'architect', 'empire', 'apron', 'almond',
  'arrow', 'engine', 'elevator', 'envelope', 'instrument'
];

export function createShuffledVocabList(): VocabItem[] {
  const allWords: VocabItem[] = [
    ...VOCABULARY_A.map((word, idx) => ({ id: `a_${idx}_${word}`, word, type: 'a' as const })),
    ...VOCABULARY_AN.map((word, idx) => ({ id: `an_${idx}_${word}`, word, type: 'an' as const }))
  ];

  // Fisher-Yates shuffle
  for (let i = allWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
  }

  return allWords;
}
