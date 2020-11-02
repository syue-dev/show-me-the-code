# Event Delegation

## 介绍

事件委托基于冒泡，当需要在大量子元素上绑定某一事件时，可以将事件绑定在子元素的父元素，通过冒泡机制在 `event.target` 上找到对应匹配的子元素。

在子元素上大量的绑定和删除事件监听非常不好维护，尤其是在删除事件监听被遗忘时，有可能引起性能问题。

## 参考

- [How JavaScript Event Delegation Works](https://davidwalsh.name/event-delegate)
