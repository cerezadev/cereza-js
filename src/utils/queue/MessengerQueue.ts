import Queue from "./Queue";

export default abstract class MessengerQueue<T> {
	private readonly queue = new Queue<T>();
	private paused = false;

	public sendData(data: T) {
		this.queue.enqueue(data);
		this.processQueue();
	}

	protected pauseProcessing() {
		this.paused = true;
	}

	protected resumeProcessing() {
		this.paused = false;

		this.processQueue();
	}

	private processQueue() {
		if (this.paused) return;

		let element = this.queue.dequeue();

		while (element !== undefined) {
			this.forceSendData(element);

			element = this.queue.dequeue();
		}
	}

	public abstract forceSendData(data: T): void;
}
