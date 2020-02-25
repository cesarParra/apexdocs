/**
 * Returns the first word found looking backwards at the received string and starting at the received position.
 * @param stringToSearch The string to extract the word from.
 * @param startingPosition Starting postion to search
 */
function findPreviousWord(stringToSearch: string, startingPosition: number): string | null {
  if (startingPosition >= stringToSearch.length) {
    return null;
  }

  let iStart;
  let iEnd;
  for (iStart = startingPosition - 1, iEnd = 0; iStart >= 0; iStart--) {
    if (iEnd === 0) {
      if (stringToSearch.charAt(iStart) === ' ') {
        continue;
      }

      iEnd = iStart + 1;
    } else if (stringToSearch.charAt(iStart) === ' ') {
      iStart++;
      break;
    }
  }

  if (iStart === -1) {
    iStart = 0;
  }

  return stringToSearch.substring(iStart, iEnd);
}

/**
 * Returns the last item in the received array.
 * @param array The array.
 */
function peek(array: any[] | null) {
  if (!array || array.length === 0) {
    return null;
  }
  return array[array.length - 1];
}

export { findPreviousWord, peek };
