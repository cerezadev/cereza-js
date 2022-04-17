import IsoWebSocket from "isomorphic-ws";
import { SubscriberFn } from "../utils/subscriber/SubscriberFn";
import SubscriberManager from "../utils/subscriber/SubscriberManager";
import { setTimeout } from "timers/promises";
import { expBackoff } from "../utils/backoff/ExponentialBackoff";

export default class WebSocketExtern {
	private readonly subscribers = new SubscriberManager();
	private readonly address: string;
	private socket: undefined | IsoWebSocket;
	private expWaitTime: () => number;

	constructor(address: string) {
		this.address = address;
		this.expWaitTime = expBackoff();

		this.connect();
	}

	public async connect(delay = 0) {
		await setTimeout(delay);

		this.socket = new IsoWebSocket(this.address);

		this.setupListeners();
	}

	private setupListeners() {
		this.socket?.addEventListener("open", () => {
			this.expWaitTime = expBackoff();

			this.subscribers.invokeSubscribers("beforeopen", undefined);
			this.subscribers.invokeSubscribers("open", undefined);
		});

		this.socket?.addEventListener("error", (evt) => {
			this.connect(this.expWaitTime());

			this.subscribers.invokeSubscribers("error", evt.error);
		});

		this.socket?.addEventListener("message", (evt) => {
			this.subscribers.invokeSubscribers("message", evt.data);
		});

		this.socket?.addEventListener("close", (evt) => {
			this.subscribers.invokeSubscribers("close", evt.reason);
		});
	}

	public subscribe(id: string, fn: SubscriberFn<any>) {
		return this.subscribers.subscribe(id, fn);
	}

	public send(data: string) {
		this.socket?.send(data);
	}
}
