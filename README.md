# LRU_CACHE

An efficient implementation of the **LRU (Least Recently Used) Cache** using:

* HashMap
* Doubly Linked List

The cache supports fast insertion, deletion, and access operations in **O(1)** time complexity.

---

## 🚀 Features

* Fast key-value access
* Automatically removes least recently used data
* Optimized using HashMap + Doubly Linked List
* Constant time operations

---

## 📌 How It Works

The cache maintains the order of usage:

* Most recently used items stay at the front
* Least recently used items stay at the end

Whenever:

* an item is accessed → it moves to the front
* a new item is inserted and cache is full → the least recently used item is removed

---

## 🛠 Data Structures Used

### HashMap

Used for:

* storing key → node mapping
* quick access in O(1)

### Doubly Linked List

Used for:

* maintaining usage order
* quick insertion and deletion

---

## ⚡ Operations

### Get

* Returns value if key exists
* Moves item to most recently used position

### Put

* Inserts new key-value pair
* Updates existing key if present
* Removes least recently used item if capacity exceeds

---

## 📊 Time Complexity

| Operation | Complexity |
| --------- | ---------- |
| Get       | O(1)       |
| Put       | O(1)       |
| Insert    | O(1)       |
| Remove    | O(1)       |

---

## 📚 Concepts Covered

* HashMap
* Doubly Linked List
* Cache Design
* Pointer Manipulation
* O(1) Data Structure Optimization

---

## 🎯 Applications

* Browser caching
* Database caching
* Operating systems
* API response caching
* Memory management

---

## 👨‍💻 Author

Built for practicing Data Structures in Java.
