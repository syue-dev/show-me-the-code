const mySetInterval = (fn, a, b) => {
  let current = 0
  let timer

  const helper = () => {
    timer = setTimeout(() => {
      fn()
      current++
      helper()
    }, a + current * b)
  }

  helper()

  return () => clearTimeout(timer)
}

const myClear = mySetInterval(
  () => {
    console.log('this is fn')
  },
  1000,
  2000
)

setTimeout(() => myClear(), 10000)
