/**
 * Implements a doubly-linked list with a client-sizeable free list.
 *
 * Creation:
 * const freeListSize = 10
 * const dll = new DoubleLinkedList(freeListSize)
 *
 * Insertion:
 * const node5 = dll.append('five')
 * const node4 = dll.insertBefore(node5, 'four')
 * const node6 = dll.insertAfter(node5, 'six')
 * const node0 = dll.insertFirst('zero')
 * const node9 = dll.insertlast('nine)
 *
 * Forward Traversal:
 * let current = dll.first()
 * while (current !== dll.tail()) {
 *   console.log(current.data())
 *   current = current.next()
 * }
 *
 * Backward Traversal:
 * let current = dll.last()
 * while (current !== dll.head()) {
 *  current = current.prev()
 * }
 *
 * Removal:
 * dll.remove(node5)
 */
export class DoubleLinkedNode {
  constructor (data = null, prev = null, next = null) {
    this._prev = prev
    this._next = next
    this._data = data
  }

  data () { return this._data }

  next () { return this._next }

  prev () { return this._prev }
}

export class DoubleLinkedList {
  constructor (freeLimit = 0) {
    // We create a head and tail node so we never have to handle their edge cases
    this._head = new DoubleLinkedNode('HEAD')
    this._tail = new DoubleLinkedNode('TAIL')
    this._head._next = this._tail
    this._tail._prev = this._head
    this._size = 0
    this._free = new DoubleLinkedNode('FREE')
    this._freeSize = 0
    this._freeLimit = freeLimit
  }

  empty () { return this._size === 0 }

  first () { return this._head._next === this._tail ? null : this._head._next }

  freeListLimit () { return this._freeLimit }

  freeListSize () { return this._freeSize }

  head () { return this._head }

  last () { return this._tail._prev === this._head ? null : this._tail._prev }

  size () { return this._size }

  tail () { return this._tail }

  // Same as insertlast()
  // Appends a new node with *data* to end of the list and returns the new node
  append (data) { return this.insertBefore(this._tail, data) }

  getNode (data, prev, next) {
    return (this._freeSize)
      ? this.dequeue(data, prev, next)
      : new DoubleLinkedNode(data, prev, next)
  }

  // Inserts a new node with *data* after *leader* node and returns the new node
  insertAfter (leader, data) { return this.insertBefore(leader._next, data) }

  // Inserts a new node with *data* before *trailer* node and returns the new node
  insertBefore (trailer, data) {
    const leader = trailer._prev
    const node = this.getNode(data, leader, trailer)
    leader._next = node
    trailer._prev = node
    this._size++
    return node
  }

  // Inserts a new node with *data* to the front of the list and returns the new node
  insertFirst (data) { return this.insertBefore(this._head._next, data) }

  // Appends a new node with *data* to end of the list and returns the new node
  insertLast (data) { return this.insertBefore(this._tail, data) }

  remove (node) {
    const leader = node._prev
    const trailer = node._next
    leader._next = trailer
    trailer._prev = leader
    this._size--
    // Remove dangling references for potential garbage collection
    node._prev = null
    node._next = null
    node._data = null
    // Should the free'd node be added to free list?
    if (this._freeSize < this._freeLimit) this.enqueue(node)
    return this
  }

  // Repurposes a previously free'd node
  dequeue (data, prev, next) {
    // If nothing to dequeue, return null
    if (!this._free) return null
    // Pop a node off the queue
    const node = this._free
    this._free = node._next
    this._freeSize--
    // Initialize the node values and return it
    node._prev = prev
    node._next = next
    node._data = data
    return node
  }

  // Adds a free'd node the the free node queue
  enqueue (node) {
    if (!this._free) {
      this._free = node
    } else {
      const trailer = this._free // whatever was first in the queue is now a trailer
      this._free = node // the newly free'd node is now the head
      node._next = trailer // link trailer to the new head
    }
    this._freeSize++
  }
}
