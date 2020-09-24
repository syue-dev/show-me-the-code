const PENDING = Symbol('PENDING')
const FULFILLED = Symbol('FULFILLED')
const REJECTED = Symbol('REJECTED')

class PromiseA {
  constructor(executor) {
    // 1.3 “value” is any legal JavaScript value (including undefined, a thenable, or a promise).
    this.value = null
    // 1.4 “exception” is a value that is thrown using the throw statement.
    this.exception = null
    // 1.5 “reason” is a value that indicates why a promise was rejected.
    this.reason = null
    // 2.1 A promise must be in one of three states: pending, fulfilled, or rejected.
    this.state = PENDING

    this.promiseOnResolve = []
    this.promiseOnReject = []

    try {
      /**
       * new Promise((resolve, reject) => {
       *    setTimeout(() => resolve('Hello'))
       * })
       */
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.exception = e
      this.reject(e)
    }
  }

  resolve(value) {
    if (this.state === PENDING) {
      setTimeout(() => {
        // 2.1.1.1 may transition to either the fulfilled or rejected state.
        this.state = FULFILLED
        // 2.1.2 When fulfilled, a promise:
        // 2.1.2.2 must have a value, which must not change.
        this.value = value
        // 2.2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
        this.promiseOnResolve.forEach((cb) => cb(this.value))
      })
    }
  }

  reject(reason) {
    if (this.state === PENDING) {
      setTimeout(() => {
        // 2.1.1.1 may transition to either the fulfilled or rejected state.
        this.state = REJECTED
        // 2.1.3 When rejected, a promise:
        // 2.1.3.2 must have a reason, which must not change.
        this.reason = reason
        // 2.2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
        this.promiseOnReject.forEach((cb) => cb(this.reason))
      })
    }
  }

  // 1.1 “promise” is an object or function with a then method whose behavior conforms to this specification.
  then(onFulfilled, onRejected) {
    // 2.2.1 Both onFulfilled and onRejected are optional arguments:
    onFulfilled =
      Object.prototype.toString.call(onFulfilled) !== '[object Function]'
        ? PromiseIdResolveHandler
        : onFulfilled
    onRejected =
      Object.prototype.toString.call(onRejected) !== '[object Function]'
        ? PromiseIdRejectHandler
        : onRejected

    // 2.2.7 then must return a promise
    let promise2 //  promise2 = promise1.then(onFulfilled, onRejected);
    if (this.state === PENDING) {
      return (promise2 = new PromiseA((resolve, reject) => {
        // this.promiseOnResolve.forEach((cb) => cb(this.value))
        this.promiseOnResolve.push((value) => {
          try {
            // 2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            const x = onFulfilled(value) // p.then((value) => {...}, ...)
            promiseResolutionProcedure(promise2, x, resolve, reject)
          } catch (e) {
            this.exception = e
            reject(e)
          }
        })

        // this.promiseOnReject.forEach((cb) => cb(this.reason))
        this.promiseOnReject.push((reason) => {
          try {
            // 2.2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
            const x = onRejected(reason) // p.then(..., (err) => {...})
            promiseResolutionProcedure(promise2, x, resolve, reject)
          } catch (e) {
            this.exception = e
            reject(e)
          }
        })
      }))
    }

    if (this.state === FULFILLED) {
      return (promise2 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            promiseResolutionProcedure(promise2, x, resolve, reject)
          } catch (e) {
            this.exception = e
            reject(e)
          }
        })
      }))
    }

    if (this.state === REJECTED) {
      return (promise2 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            promiseResolutionProcedure(promise2, x, resolve, reject)
          } catch (e) {
            this.exception = e
            reject(e)
          }
        })
      }))
    }
  }
}

// 2.3 The Promise Resolution Procedure
const promiseResolutionProcedure = (promise2, x, resolve, reject) => {
  let called = false // make sure the only one fo resole and reject executed
  // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (promise2 === x) {
    promise2.exception = new TypeError(`promise and x refer to the same object`)
    return reject(promise2.exception)
  }

  if (x instanceof PromiseA) {
    // 2.3.2 If x is a promise, adopt its state
    if (x.state === PENDING) {
      // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
      x.then(
        (y) => promiseResolutionProcedure(promise2, y, resolve, reject),
        (reason) => reject(reason)
      )
    } else {
      // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
      // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
      x.then(resolve, reject)
    }
  } else if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    // 2.3.3 Otherwise, if x is an object or function,
    // 2.3.3.1 Let then be x.then
    // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
    try {
      const then = x.then
      if (typeof then === 'function') {
        // 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
            promiseResolutionProcedure(promise2, y, resolve, reject)
          },
          (r) => {
            // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // 2.3.3.4 If then is not a function, fulfill promise with x.
        resolve(x)
      }
    } catch (e) {
      // 2.3.3.3.4 If calling then throws an exception e,
      // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
      if (called) return
      called = true
      // 2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
      reject(e)
    }
  } else {
    // 2.3.4 If x is not an object or function, fulfill promise with x.
    resolve(x)
  }
}

function PromiseIdResolveHandler(x) {
  return x
}

function PromiseIdRejectHandler(r) {
  throw r
}

// promises-aplus-tests hook
PromiseA.deferred = function () {
  const defer = {}
  defer.promise = new PromiseA((resolve, reject) => {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

PromiseA.resolve = (value) => new PromiseA((resolve, reject) => resolve(value))
PromiseA.reject = (reason) => new PromiseA((resolve, reject) => reject(reason))

module.exports = PromiseA
