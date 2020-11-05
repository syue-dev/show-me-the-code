# this

## 默认绑定

```javascript
var a = 10
function foo() {
  console.log(this.a) // this => window 10
}
foo()
```

```javascript
// 严格模式下， 函数内部 this 不指向任何
'use strict'
var a = 10
function foo() {
  console.log('this1', this) // undefined
  console.log(window.a) // 10
  console.log(this.a) // TypeError
}
console.log(window.foo) // f foo () {}
console.log('this2', this) // window
foo()
```

```javascript
// let const 不会被绑定在 window
let a = 10
const b = 20

function foo() {
  console.log(this.a) // undefined
  console.log(this.b) // undefined
}
foo()
console.log(window.a) // undefined
```

```javascript
var a = 1
function foo() {
  var a = 2
  console.log(this) // window
  console.log(this.a) // 1 => window.a
  console.log(a) // 2 => var a = 2
}
foo()
```

```javascript
var a = 1
function foo() {
  var a = 2
  function inner() {
    console.log(this.a) // 1 this => window
  }
  inner()
}
foo()
```

## 隐式绑定

```javascript
function foo() {
  console.log(this.a)
}
var obj = { a: 1, foo }
var a = 2
obj.foo() // 1 this => obj
```

## 隐式绑定隐式丢失

### 使用另一个变量来给函数取别名

```javascript
function foo() {
  console.log(this.a)
}
var obj = { a: 1, foo }
var a = 2
var foo2 = obj.foo

obj.foo() // 1
foo2() // 2 this => window window.foo2()
```

```javascript
function foo() {
  console.log(this.a)
}
var obj = { a: 1, foo }
var a = 2
var foo2 = obj.foo
var obj2 = { a: 3, foo2: obj.foo }

obj.foo() // 1
foo2() // 2
obj2.foo2() // 3
```

### 将函数作为参数传递

```javascript
function foo() {
  console.log(this.a)
}
function doFoo(fn) {
  console.log(this) // window
  fn() // 2 this => window
}
var obj = { a: 1, foo }
var a = 2
doFoo(obj.foo)
```

```javascript
function foo() {
  console.log(this.a)
}
function doFoo(fn) {
  console.log(this) // obj2
  fn() // 2 this => window
}
var obj = { a: 1, foo }
var a = 2
var obj2 = { a: 3, doFoo }

obj2.doFoo(obj.foo)
```

```javascript
'use strict'
function foo() {
  console.log(this.a)
}
function doFoo(fn) {
  console.log(this) // obj2
  fn() // TypeError this => undefined
}
var obj = { a: 1, foo }
var a = 2
var obj2 = { a: 3, doFoo }

obj2.doFoo(obj.foo)
```

## 显式绑定

```javascript
function foo() {
  console.log(this.a)
}
var obj = { a: 1 }
var a = 2

foo() // 2
foo.call(obj) // 1
foo.apply(obj) // 1
foo.bind(obj)
```

```javascript
function foo() {
  console.log(this.a)
}
var a = 2
foo.call() // 2
foo.call(null) // 2
foo.call(undefined) // 2
```

```javascript
var obj1 = {
  a: 1
}
var obj2 = {
  a: 2,
  foo1: function () {
    console.log(this.a)
  },
  foo2: function () {
    setTimeout(function () {
      console.log(this)
      console.log(this.a)
    }, 0)
  }
}
var a = 3

obj2.foo1() // 2
obj2.foo2() // window & 3
```

```javascript
var obj1 = {
  a: 1
}
var obj2 = {
  a: 2,
  foo1: function () {
    console.log(this.a)
  },
  foo2: function () {
    setTimeout(
      function () {
        console.log(this)
        console.log(this.a)
      }.call(obj1),
      0
    )
  }
}
var a = 3
obj2.foo1() // 2
obj2.foo2() // obj1 & 1
```

```javascript
var obj1 = {
  a: 1
}
var obj2 = {
  a: 2,
  foo1: function () {
    console.log(this.a)
  },
  foo2: function () {
    function inner() {
      console.log(this)
      console.log(this.a)
    }
    inner()
  }
}
var a = 3
obj2.foo1() // 2
obj2.foo2() // window & 3
```

```javascript
function foo() {
  console.log(this.a)
}
var obj = { a: 1 }
var a = 2

foo() // 2
foo.call(obj) // 1
foo().call(obj) // 2 & TypeError (undefined.call(obj))
```

```javascript
function foo() {
  console.log(this.a)
  return function () {
    console.log(this.a)
  }
}
var obj = { a: 1 }
var a = 2

foo() // 2
foo.call(obj) // 1
foo().call(obj) // 2 & 1
```

```javascript
function foo() {
  console.log(this.a)
  return function () {
    console.log(this.a)
  }
}
var obj = { a: 1 }
var a = 2

foo() // 2
foo.bind(obj) // -
foo().bind(obj) // 2 & -
```

```javascript
function foo() {
  console.log(this.a) // 1
  return function () {
    console.log(this.a) // 2
  }
}
var obj = { a: 1 }
var a = 2

foo.call(obj)()
```

```javascript
var obj = {
  a: 'obj',
  foo: function () {
    console.log('foo:', this.a)
    return function () {
      console.log('inner:', this.a)
    }
  }
}
var a = 'window'
var obj2 = { a: 'obj2' }

obj.foo()() // obj & window
obj.foo.call(obj2)() // obj2 & window
obj.foo().call(obj2) // obj & obj2
```

```javascript
var obj = {
  a: 1,
  foo: function (b) {
    b = b || this.a
    return function (c) {
      console.log(this.a + b + c)
    }
  }
}
var a = 2
var obj2 = { a: 3 }

obj.foo(a).call(obj2, 1) // 6
obj.foo.call(obj2)(1) // 6
```

## 显式绑定的其它用法

```javascript
function foo1() {
  console.log(this.a)
}
var a = 1
var obj = {
  a: 2
}

var foo2 = function () {
  foo1.call(obj)
}

foo2() // 2
foo2.call(window) // 2
```

```javascript
function foo1(b) {
  console.log(`${this.a} + ${b}`)
  return this.a + b
}
var a = 1
var obj = {
  a: 2
}

var foo2 = function () {
  return foo1.call(obj, ...arguments)
}

var num = foo2(3)
console.log(num) // 5
```

```javascript
function foo(item) {
  console.log(item, this.a)
}
var obj = {
  a: 'obj'
}
var a = 'window'
var arr = [1, 2, 3]

// arr.forEach(foo, obj)
// arr.map(foo, obj)
arr.filter(function (i) {
  console.log(i, this.a)
  return i > 2
}, obj)
// 1 "obj"
// 2 "obj"
// 3 "obj"
```

## new 绑定

```javascript
function Person(name) {
  this.name = name
}
var name = 'window'
var person1 = new Person('LinDaiDai')
console.log(person1.name) // LinDaiDai
```

```javascript
function Person(name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
  }
  this.foo2 = function () {
    return function () {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
person1.foo1() // person1
person1.foo2()() // -
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.foo = function () {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}
var person2 = {
  name: 'person2',
  foo: function () {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}

var person1 = new Person('person1')
person1.foo()() // person1 & window
person2.foo()() // person2 & window
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.foo = function () {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

person1.foo.call(person2)() // person2 & window
person1.foo().call(person2) // person1 & person2
```

## 箭头函数绑定

```javascript
var obj = {
  name: 'obj',
  foo1: () => {
    console.log(this.name)
  },
  foo2: function () {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  }
}
var name = 'window'
obj.foo1() // window
obj.foo2()() // obj & obj
```

```javascript
var name = 'window'
var obj1 = {
  name: 'obj1',
  foo: function () {
    console.log(this.name)
  }
}

var obj2 = {
  name: 'obj2',
  foo: () => {
    console.log(this.name)
  }
}

obj1.foo() // obj1
obj2.foo() // window
```

```javascript
var name = 'window'
var obj1 = {
  name: 'obj1',
  foo: function () {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}
var obj2 = {
  name: 'obj2',
  foo: function () {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  }
}
var obj3 = {
  name: 'obj3',
  foo: () => {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}
var obj4 = {
  name: 'obj4',
  foo: () => {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  }
}

obj1.foo()() // obj1 & window
obj2.foo()() // obj2 & obj2
obj3.foo()() // window & window
obj4.foo()() // window & window
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
  }
  this.foo2 = () => {
    console.log(this.name)
  }
}
var person2 = {
  name: 'person2',
  foo2: () => {
    console.log(this.name)
  }
}
var person1 = new Person('person1')
person1.foo1() // person1
person1.foo2() // person1
person2.foo2() // window
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
  this.foo2 = function () {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  }
  this.foo3 = () => {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
  this.foo4 = () => {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
person1.foo1()() // person1 & window
person1.foo2()() // person1 & person1
person1.foo3()() // person1 & window
person1.foo4()() // person1 & person1
```

```javascript
var name = 'window'
var obj1 = {
  name: 'obj1',
  foo1: function () {
    console.log(this.name)
    return () => {
      console.log(this.name)
    }
  },
  foo2: () => {
    console.log(this.name)
    return function () {
      console.log(this.name)
    }
  }
}
var obj2 = {
  name: 'obj2'
}
obj1.foo1.call(obj2)() // obj2 & obj2
obj1.foo1().call(obj2) // obj1 & obj1
obj1.foo2.call(obj2)() // window & window
obj1.foo2().call(obj2) // window & obj2
```

## 综合

```javascript
var name = 'window'
var person1 = {
  name: 'person1',
  foo1: function () {
    console.log(this.name)
  },
  foo2: () => console.log(this.name),
  foo3: function () {
    return function () {
      console.log(this.name)
    }
  },
  foo4: function () {
    return () => {
      console.log(this.name)
    }
  }
}
var person2 = { name: 'person2' }

person1.foo1() // person1
person1.foo1.call(person2) // person2

person1.foo2() // window
person1.foo2.call(person2) // window

person1.foo3()() // window
person1.foo3.call(person2)() // window
person1.foo3().call(person2) // person2

person1.foo4()() // person1
person1.foo4.call(person2)() // person2
person1.foo4().call(person2) // person1
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
  }
  this.foo2 = () => console.log(this.name)
  this.foo3 = function () {
    return function () {
      console.log(this.name)
    }
  }
  this.foo4 = function () {
    return () => {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

person1.foo1() // person1
person1.foo1.call(person2) // person2

person1.foo2() // person1
person1.foo2.call(person2) // person1

person1.foo3()() // window
person1.foo3.call(person2)() // window
person1.foo3().call(person2) // person2

person1.foo4()() // person1
person1.foo4.call(person2)() // person2
person1.foo4().call(person2) // person1
```

```javascript
var name = 'window'
function Person(name) {
  this.name = name
  this.obj = {
    name: 'obj',
    foo1: function () {
      return function () {
        console.log(this.name)
      }
    },
    foo2: function () {
      return () => {
        console.log(this.name)
      }
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

person1.obj.foo1()() // window
person1.obj.foo1.call(person2)() // window
person1.obj.foo1().call(person2) // person2

person1.obj.foo2()() // obj
person1.obj.foo2.call(person2)() // person2
person1.obj.foo2().call(person2) // obj
```

```javascript
function foo() {
  console.log(this.a)
}
var a = 2
;(function () {
  'use strict'
  foo() // 2
})()
```

## 参考

- [再来 40 道 this 面试题酸爽继续](https://juejin.im/post/6844904083707396109#heading-27)
- [JavaScript 的 this 原理](http://www.ruanyifeng.com/blog/2018/06/javascript-this.html)
- [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [You don't kown JS]()
