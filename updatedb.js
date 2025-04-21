const data = require("./src/data.json");

function updateObjectDatesAndNumbers(obj) {
  const keys = Object.keys(obj).sort((a, b) => new Date(a) - new Date(b));
  let currentDate = new Date("04/21/2025");
  let currentNumber = 264;
  const updatedObj = {};

  for (let key of keys) {
    const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/` +
                          `${currentDate.getDate().toString().padStart(2, '0')}/` +
                          `${currentDate.getFullYear()}`;
    updatedObj[formattedDate] = {
      ...obj[key],
      number: currentNumber,
    };
    currentDate.setDate(currentDate.getDate() + 1);
    currentNumber++;
  }
  return updatedObj;
}

const updatedObj = updateObjectDatesAndNumbers(data["answers_db"]);
console.log("Updated Object:", JSON.stringify(updatedObj, null, 2));

