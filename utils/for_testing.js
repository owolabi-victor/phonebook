// utils/for_testing.js
const reverse = (string) => {
  return string
    .split('')
    .reverse()
    .join('')
}

const average = (array) => {
  if (array.length === 0) return 0
  // special case
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.reduce(reducer, 0) / array.length
}

export default {
  reverse,
  average,
}