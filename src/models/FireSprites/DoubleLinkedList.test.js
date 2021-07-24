import { DoubleLinkedList } from './DoubleLinkedList.js'

test('1: DoubleLinkedList constructors and accessors', () => {
  const dll = new DoubleLinkedList()
  expect(dll._head._next).toEqual(dll._tail)
  expect(dll._head._prev).toBeNull()
  expect(dll._tail._prev).toEqual(dll._head)
  expect(dll._tail._next).toBeNull()
  expect(dll._size).toEqual(0)
  expect(dll.empty()).toEqual(true)
  expect(dll.first()).toBeNull()
  expect(dll.last()).toBeNull()
  expect(dll.size()).toEqual(0)
})

test('2: insertion - append(), insertAfter(), insertBefore(), insertFirst(), insertLast()', () => {
  const dll = new DoubleLinkedList()
  expect(dll.first()).toBeNull()

  // append()
  const node1 = dll.append('ONE')
  expect(dll.size()).toEqual(1)
  expect(dll.first()).toEqual(node1)
  expect(dll.last()).toEqual(node1)
  let current = dll.first()
  expect(current.data()).toEqual('ONE')
  // console.log('HEAD =>', dll._head)
  // console.log('NODE =>', node1)
  // console.log('TAIL =>', dll._tail)
  expect(dll._head._next).toEqual(node1)
  expect(current).toEqual(node1)
  expect(current.prev()).toEqual(dll._head)
  expect(current.next()).toEqual(dll._tail)

  // append()
  const node9 = dll.append('NINE')
  expect(dll.size()).toEqual(2)
  expect(dll.first()).toEqual(node1)
  expect(dll.last()).toEqual(node9)

  let data = []
  current = dll.first()
  while (current !== dll.tail()) {
    data.push(current.data())
    current = current.next()
  }
  expect(data).toEqual(['ONE', 'NINE'])

  data = []
  current = dll.last()
  while (current !== dll.head()) {
    data.push(current.data())
    current = current.prev()
  }
  expect(data).toEqual(['NINE', 'ONE'])

  // insertBefore()
  const node5 = dll.insertBefore(node9, 'FIVE')
  expect(dll.size()).toEqual(3)
  expect(dll.first()).toEqual(node1)
  expect(dll.last()).toEqual(node9)
  expect(node5.prev()).toEqual(node1)
  expect(node5.next()).toEqual(node9)

  data = []
  current = dll.first()
  while (current !== dll.tail()) {
    data.push(current.data())
    current = current.next()
  }
  expect(data).toEqual(['ONE', 'FIVE', 'NINE'])

  data = []
  current = dll.last()
  while (current !== dll.head()) {
    data.push(current.data())
    current = current.prev()
  }
  expect(data).toEqual(['NINE', 'FIVE', 'ONE'])

  // insertLast()
  const node10 = dll.insertLast('TEN')
  expect(dll.size()).toEqual(4)
  expect(dll.first()).toEqual(node1)
  expect(dll.last()).toEqual(node10)
  expect(node9.prev()).toEqual(node5)
  expect(node9.next()).toEqual(node10)
  expect(dll._tail._prev).toEqual(node10)

  data = []
  current = dll.first()
  while (current !== dll.tail()) {
    data.push(current.data())
    current = current.next()
  }
  expect(data).toEqual(['ONE', 'FIVE', 'NINE', 'TEN'])

  data = []
  current = dll.last()
  while (current !== dll.head()) {
    data.push(current.data())
    current = current.prev()
  }
  expect(data).toEqual(['TEN', 'NINE', 'FIVE', 'ONE'])

  // insertFirst()
  const node0 = dll.insertFirst('ZERO')
  expect(dll.size()).toEqual(5)
  expect(dll.first()).toEqual(node0)
  expect(dll.last()).toEqual(node10)
  expect(node1.prev()).toEqual(node0)
  expect(node1.next()).toEqual(node5)
  expect(dll._head._next).toEqual(node0)

  data = []
  current = dll.first()
  while (current !== dll.tail()) {
    data.push(current.data())
    current = current.next()
  }
  expect(data).toEqual(['ZERO', 'ONE', 'FIVE', 'NINE', 'TEN'])

  data = []
  current = dll.last()
  while (current !== dll.head()) {
    data.push(current.data())
    current = current.prev()
  }
  expect(data).toEqual(['TEN', 'NINE', 'FIVE', 'ONE', 'ZERO'])

  // insertAfter()
  const node3 = dll.insertAfter(node1, 'THREE')
  expect(dll.size()).toEqual(6)
  expect(dll.first()).toEqual(node0)
  expect(dll.last()).toEqual(node10)
  expect(node1.prev()).toEqual(node0)
  expect(node1.next()).toEqual(node3)
  expect(node5.prev()).toEqual(node3)
  expect(node5.next()).toEqual(node9)
  expect(dll._head._next).toEqual(node0)

  data = []
  current = dll.first()
  while (current !== dll.tail()) {
    data.push(current.data())
    current = current.next()
  }
  expect(data).toEqual(['ZERO', 'ONE', 'THREE', 'FIVE', 'NINE', 'TEN'])

  data = []
  current = dll.last()
  while (current !== dll.head()) {
    data.push(current.data())
    current = current.prev()
  }
  expect(data).toEqual(['TEN', 'NINE', 'FIVE', 'THREE', 'ONE', 'ZERO'])
})

test('3: remove()', () => {
  const dll = new DoubleLinkedList(5)
  expect(dll.freeListSize()).toEqual(0)
  expect(dll.freeListLimit()).toEqual(5)

  const data = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN']
  const node = []
  data.forEach(d => { node.push(dll.append(d)) })
  expect(dll.size()).toEqual(11)

  dll.remove(node[0])
  expect(dll.size()).toEqual(10)
  expect(dll.freeListSize()).toEqual(1)

  dll.remove(node[5])
  expect(dll.size()).toEqual(9)
  expect(dll.freeListSize()).toEqual(2)

  dll.remove(node[10])
  expect(dll.size()).toEqual(8)
  expect(dll.freeListSize()).toEqual(3)

  dll.remove(node[7])
  expect(dll.size()).toEqual(7)
  expect(dll.freeListSize()).toEqual(4)

  dll.remove(node[9])
  expect(dll.size()).toEqual(6)
  expect(dll.freeListSize()).toEqual(5)

  // We should hit the freeLimit of 5
  dll.remove(node[3])
  expect(dll.size()).toEqual(5)
  expect(dll.freeListSize()).toEqual(5)

  let d = []
  let current = dll.first()
  while (current !== dll.tail()) {
    d.push(current.data())
    current = current.next()
  }
  expect(d).toEqual(['ONE', 'TWO', 'FOUR', 'SIX', 'EIGHT'])

  // Inserting 'three' before 'FOUR' should pop one from the freeList
  dll.insertBefore(node[4], 'three')
  expect(dll.size()).toEqual(6)
  expect(dll.freeListSize()).toEqual(4)

  // Inserting 'five' after 'FOUR' should pop one from the freeList
  dll.insertAfter(node[4], 'five')
  expect(dll.size()).toEqual(7)
  expect(dll.freeListSize()).toEqual(3)

  // Appending 'nine' should pop one from the freeList
  dll.append('nine')
  expect(dll.size()).toEqual(8)
  expect(dll.freeListSize()).toEqual(2)

  // Inserting 'zero' first should pop one from the freeList
  dll.insertFirst('zero')
  expect(dll.size()).toEqual(9)
  expect(dll.freeListSize()).toEqual(1)

  // Inserting 'ten', last should pop one from the freeList
  dll.insertLast('ten')
  expect(dll.size()).toEqual(10)
  expect(dll.freeListSize()).toEqual(0)

  d = []
  current = dll.first()
  while (current !== dll.tail()) {
    d.push(current.data())
    current = current.next()
  }

  // Should be no more freelist nodes to pop
  dll.insertLast('eleven')
  expect(dll.size()).toEqual(11)
  expect(dll.freeListSize()).toEqual(0)
  d = []
  current = dll.first()
  while (current !== dll.tail()) {
    d.push(current.data())
    current = current.next()
  }
  expect(d).toEqual(['zero', 'ONE', 'TWO', 'three', 'FOUR', 'five', 'SIX', 'EIGHT', 'nine', 'ten', 'eleven'])
})
