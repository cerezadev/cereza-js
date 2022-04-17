import { SubscriberFn } from "./utils/subscriber/SubscriberFn";

export default class Route<T> {
	private readonly topic: string;
	private readonly sendFn: (topic: string, data: any) => void;
	private readonly subscribeFn: (topic: string, fn: SubscriberFn<T>) => void;

	constructor(
		topic: string,
		sendFn: (topic: string, data: any) => void,
		subscribeFn: (topic: string, fn: SubscriberFn<T>) => void
	) {
		this.topic = topic;
		this.sendFn = sendFn;
		this.subscribeFn = subscribeFn;
	}

	public publish(data: T) {
		this.sendFn("PUBLISH", { topic: this.topic, data });
	}

	public subscribe(fn: SubscriberFn<T>) {
		this.subscribeFn(this.topic, fn);
	}
}
