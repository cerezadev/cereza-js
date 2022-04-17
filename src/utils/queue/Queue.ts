export default class Queue<T> {
	private readonly elements: Record<number, T> = {};
	private head = 0;
	private tail = 0;

	public enqueue(element: T) {
		this.elements[this.tail++] = element;
	}

	public dequeue(): T {
		const element = this.elements[this.head];

		delete this.elements[this.head++];

		return element;
	}

	public dequeueAll(): T[] {
		const elements = [];

		let element = this.dequeue();

		while (element !== undefined) {
			elements.push(element);

			element = this.dequeue();
		}

		return elements;
	}

	public peek() {
		return this.elements[this.head];
	}

	get length() {
		return this.tail - this.head;
	}

	get isEmpty() {
		return this.length === 0;
	}
}
