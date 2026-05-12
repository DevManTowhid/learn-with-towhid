import { VizItem, VizState } from "./types";

function* bubbleSortGenerator(arr: VizItem[]): Generator<VizState, VizState, unknown> {
  let tempArr = [...arr];
  let n = tempArr.length;
  let sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...tempArr], active: [j, j + 1], sorted: sortedIndices, message: `Comparing ${tempArr[j].value} and ${tempArr[j+1].value}` };

      if (tempArr[j].value > tempArr[j + 1].value) {
        let temp = tempArr[j];
        tempArr[j] = tempArr[j + 1];
        tempArr[j + 1] = temp;
        swapped = true;
        yield { array: [...tempArr], active: [j, j + 1], sorted: sortedIndices, message: `Swapping ${tempArr[j+1].value} and ${tempArr[j].value}` };
      }
    }
    sortedIndices.push(n - i - 1);
    if (!swapped) {
      for(let k = 0; k < n - i - 1; k++) sortedIndices.push(k);
      break;
    }
  }
  sortedIndices.push(0);
  return { array: [...tempArr], active: [], sorted: sortedIndices, message: `Array is fully sorted!` };
}

function* selectionSortGenerator(arr: VizItem[]): Generator<VizState, VizState, unknown> {
  let tempArr = [...arr];
  let n = tempArr.length;
  let sortedIndices: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      yield { array: [...tempArr], active: [minIdx, j], sorted: sortedIndices, message: `Comparing ${tempArr[j].value} with min ${tempArr[minIdx].value}` };
      if (tempArr[j].value < tempArr[minIdx].value) {
        minIdx = j;
        yield { array: [...tempArr], active: [minIdx], sorted: sortedIndices, message: `New minimum found: ${tempArr[minIdx].value}` };
      }
    }
    if (minIdx !== i) {
      yield { array: [...tempArr], active: [i, minIdx], sorted: sortedIndices, message: `Swapping ${tempArr[i].value} with minimum ${tempArr[minIdx].value}` };
      let temp = tempArr[minIdx];
      tempArr[minIdx] = tempArr[i];
      tempArr[i] = temp;
    }
    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);
  return { array: [...tempArr], active: [], sorted: sortedIndices, message: `Array is fully sorted!` };
}

function* insertionSortGenerator(arr: VizItem[]): Generator<VizState, VizState, unknown> {
  let tempArr = [...arr];
  let n = tempArr.length;
  let sortedIndices: number[] = [0];

  for (let i = 1; i < n; i++) {
    let j = i;
    yield { array: [...tempArr], active: [i], sorted: sortedIndices, message: `Evaluating ${tempArr[i].value}` };

    while (j > 0 && tempArr[j - 1].value > tempArr[j].value) {
      yield { array: [...tempArr], active: [j, j - 1], sorted: sortedIndices, message: `Moving ${tempArr[j].value} backwards` };
      let temp = tempArr[j];
      tempArr[j] = tempArr[j - 1];
      tempArr[j - 1] = temp;
      j--;
    }
    sortedIndices.push(i);
    yield { array: [...tempArr], active: [j], sorted: sortedIndices, message: `Placed in sorted sequence` };
  }
  return { array: [...tempArr], active: [], sorted: sortedIndices, message: `Array is fully sorted!` };
}

function* mergeSortGenerator(arr: VizItem[]): Generator<VizState, VizState, unknown> {
  let tempArr = arr.map((item, idx) => ({ ...item, pos: idx, level: 0 }));
  let sortedIndices: number[] = [];

  function* inPlaceMerge(start: number, mid: number, end: number, currentLevel: number): Generator<VizState, void, unknown> {
    let start2 = mid + 1;

    if (tempArr[mid].value <= tempArr[start2].value) {
      for(let i = start; i <= end; i++) tempArr[i] = { ...tempArr[i], level: currentLevel - 1 };
      yield { array: [...tempArr], active: [], sorted: sortedIndices, message: `Segment sorted, moving up` };
      return;
    }

    while (start <= mid && start2 <= end) {
      yield { array: [...tempArr], active: [start, start2], sorted: sortedIndices, message: `Comparing ${tempArr[start].value} and ${tempArr[start2].value}` };

      if (tempArr[start].value <= tempArr[start2].value) {
        tempArr[start] = { ...tempArr[start], level: currentLevel - 1 };
        yield { array: [...tempArr], active: [start], sorted: sortedIndices, message: `Placed ${tempArr[start].value}` };
        start++;
      } else {
        let value = tempArr[start2];
        let index = start2;

        while (index !== start) {
          tempArr[index] = tempArr[index - 1];
          tempArr[index] = { ...tempArr[index], pos: index }; 
          index--;
        }
        
        tempArr[start] = value;
        tempArr[start] = { ...tempArr[start], level: currentLevel - 1, pos: start };

        yield { array: [...tempArr], active: [start], sorted: sortedIndices, message: `Placed ${tempArr[start].value} and shifted others right` };

        start++;
        mid++;
        start2++;
      }
    }

    let anyRemaining = false;
    while (start <= end) {
      if (tempArr[start].level !== currentLevel - 1) {
         tempArr[start] = { ...tempArr[start], level: currentLevel - 1 };
         anyRemaining = true;
      }
      start++;
    }
    if (anyRemaining) {
        yield { array: [...tempArr], active: [], sorted: sortedIndices, message: `Brought remaining elements up` };
    }
  }

  function* mergeSortHelper(start: number, end: number, currentLevel: number): Generator<VizState, void, unknown> {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    for(let i = start; i <= end; i++) tempArr[i] = { ...tempArr[i], level: currentLevel };
    yield { array: [...tempArr], active: [], sorted: sortedIndices, message: `Dividing sequence at level ${currentLevel}` };

    yield* mergeSortHelper(start, mid, currentLevel + 1);
    yield* mergeSortHelper(mid + 1, end, currentLevel + 1);
    yield* inPlaceMerge(start, mid, end, currentLevel + 1);

    if (start === 0 && end === tempArr.length - 1) {
      for (let i = 0; i <= end; i++) sortedIndices.push(i);
    }
  }

  yield* mergeSortHelper(0, tempArr.length - 1, 1); 
  tempArr = tempArr.map((item, idx) => ({ ...item, level: 0, pos: idx }));
  return { array: [...tempArr], active: [], sorted: sortedIndices, message: `Array is fully sorted!` };
}

function* quickSortGenerator(arr: VizItem[]): Generator<VizState, VizState, unknown> {
  let tempArr = [...arr];
  let sortedIndices: number[] = [];

  function* quickSortHelper(low: number, high: number): Generator<VizState, void, unknown> {
    if (low < high) {
      let pivotItem = tempArr[high];
      let i = low - 1;
      yield { array: [...tempArr], active: [high], sorted: sortedIndices, message: `Selected Pivot: ${pivotItem.value}` };

      for (let j = low; j < high; j++) {
        yield { array: [...tempArr], active: [j, high], sorted: sortedIndices, message: `Comparing ${tempArr[j].value} to pivot ${pivotItem.value}` };
        if (tempArr[j].value < pivotItem.value) {
          i++;
          let temp = tempArr[i];
          tempArr[i] = tempArr[j];
          tempArr[j] = temp;
          if (i !== j) {
            yield { array: [...tempArr], active: [i, j], sorted: sortedIndices, message: `Swapped ${tempArr[i].value} and ${tempArr[j].value}` };
          }
        }
      }
      let temp = tempArr[i + 1];
      tempArr[i + 1] = tempArr[high];
      tempArr[high] = temp;
      sortedIndices.push(i + 1);
      yield { array: [...tempArr], active: [i + 1], sorted: sortedIndices, message: `Placed pivot ${pivotItem.value} in correct position` };

      yield* quickSortHelper(low, i);
      yield* quickSortHelper(i + 2, high);
    } else if (low === high) {
      sortedIndices.push(low);
    }
  }

  yield* quickSortHelper(0, tempArr.length - 1);
  for(let k = 0; k < tempArr.length; k++) if(!sortedIndices.includes(k)) sortedIndices.push(k);
  
  return { array: [...tempArr], active: [], sorted: sortedIndices, message: `Array is fully sorted!` };
}

export {
  bubbleSortGenerator,
  selectionSortGenerator,
  insertionSortGenerator,
  mergeSortGenerator,
  quickSortGenerator
};