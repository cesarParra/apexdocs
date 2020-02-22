function strPrevWord(str, iSearch) {
    if (str == null)
        return null;
    if (iSearch >= str.length)
        return null;

    let iStart;
    let iEnd;
    for (iStart = iSearch - 1, iEnd = 0; iStart >= 0; iStart--) {
        if (iEnd == 0) {
            if (str.charAt(iStart) == ' ')
                continue;
            iEnd = iStart + 1;
        } else if (str.charAt(iStart) == ' ') {
            iStart++;
            break;
        }
    }

    if (iStart == -1)
        return null;
    else
        return str.substring(iStart, iEnd);
}

function peek(array) {
    if (array.length === 0) {
      return null;
    }
    return array[array.length - 1];
  }

export { strPrevWord, peek };