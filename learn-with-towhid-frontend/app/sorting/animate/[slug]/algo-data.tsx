// --- Mock Database for Algorithms ---
const ALGO_DATA = {
  "bubble-sort": {
    name: "Bubble Sort",
    color: "from-pink-500 to-rose-500",
    code: {
      Python: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`,
      JavaScript: `function bubbleSort(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    for(let j = 0; j < arr.length - i - 1; j++) {\n      if(arr[j] > arr[j+1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
    }
  },
  "selection-sort": {
    name: "Selection Sort",
    color: "from-orange-500 to-amber-500",
    code: {
      Python: `def selection_sort(arr):\n    for i in range(len(arr)):\n        min_idx = i\n        for j in range(i+1, len(arr)):\n            if arr[min_idx] > arr[j]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr`,
      JavaScript: `function selectionSort(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    let min = i;\n    for(let j = i+1; j < arr.length; j++) {\n      if(arr[j] < arr[min]) min = j;\n    }\n    if(min !== i) [arr[i], arr[min]] = [arr[min], arr[i]];\n  }\n  return arr;\n}`,
    }
  },
  "insertion-sort": {
    name: "Insertion Sort",
    color: "from-emerald-400 to-cyan-400",
    code: {
      Python: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i-1\n        while j >= 0 and key < arr[j]:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key\n    return arr`,
      JavaScript: `function insertionSort(arr) {\n  for(let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while(j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}`,
    }
  },
  "merge-sort": {
    name: "Merge Sort",
    color: "from-blue-500 to-indigo-500",
    code: {
      Python: `# Merge Sort Implementation...`,
      JavaScript: `// Merge Sort Implementation...`,
    }
  },
  "quick-sort": {
    name: "Quick Sort",
    color: "from-violet-500 to-purple-500",
    code: {
      Python: `# Quick Sort Implementation...`,
      JavaScript: `// Quick Sort Implementation...`,
    }
  }
};

export default ALGO_DATA;