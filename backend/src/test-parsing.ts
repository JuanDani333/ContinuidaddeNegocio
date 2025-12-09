const data = {
  totalTime: 43,
  attempts: [
    { unitTime: 8 }
  ]
};

const attempt = data.attempts[0];

const unitTime = attempt.unitTime ? parseInt(String(attempt.unitTime).replace('s', '')) : 0;
const totalTime = data.totalTime ? parseInt(String(data.totalTime).replace('s', '')) : 0;

console.log('Unit Time:', unitTime);
console.log('Total Time:', totalTime);
