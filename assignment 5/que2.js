// ii. Array operations
let numbers = [34, 1, 78, -5, 23, 112];

let largest = Math.max(...numbers);
let smallest = Math.min(...numbers);

console.log("Numbers: ", numbers);
console.log("Largest: " + largest);
console.log("Smallest: " + smallest);

console.log("Ascending: " + [...numbers].sort((a, b) => a - b));
console.log("Descending: " + [...numbers].sort((a, b) => b - a));
