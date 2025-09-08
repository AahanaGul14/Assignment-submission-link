// v. Array with built-in methods
function processArray(arr) {
  let evenNumbers = arr.filter(num => num % 2 === 0);
  let doubled = evenNumbers.map(num => num * 2);
  let sum = doubled.reduce((acc, val) => acc + val, 0);

  console.log("Original: " + arr);
  console.log("Even numbers: " + evenNumbers);
  console.log("Doubled: " + doubled);
  console.log("Sum: " + sum);
}

processArray([1, 2, 3, 4, 5, 6]);