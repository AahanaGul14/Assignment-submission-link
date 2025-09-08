// i. Take two numbers and display sum, difference, product, quotient

const prompt = require("prompt-sync")(); 

let num1 = parseFloat(prompt("Enter first number: "));
let num2 = parseFloat(prompt("Enter second number: "));

console.log("Sum: " + (num1 + num2));
console.log("Difference: " + (num1 - num2));
console.log("Product: " + (num1 * num2));
console.log("Quotient: " + (num1 / num2));
