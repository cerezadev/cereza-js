import { AppOptions } from "./AppOptions";
import Route from "./Route";
import WebSocketClient from "./socket/WebSocketClient";
import { SubscriberFn } from "./utils/subscriber/SubscriberFn";
import SubscriberManager from "./utils/subscriber/SubscriberManager";

export default class CerezaApp {
	private readonly options: AppOptions;
	private readonly socket: WebSocketClient;
	private readonly topicSubscribers = new SubscriberManager();

	constructor(options: AppOptions) {
		this.options = options;
		this.socket = new WebSocketClient(options.server);

		this.setupListeners();
	}

	public route<T>(topic: string) {
		return new Route<T>(
			topic,
			this.send.bind(this),
			this.subscribe.bind(this)
		);
	}

	private subscribe<T>(topic: string, fn: SubscriberFn<T>) {
		this.topicSubscribers.subscribe(topic, fn);
		this.register(topic);

		return () => this.unsubscribe(topic, fn);
	}

	private unsubscribe(topic: string, fn: SubscriberFn<any>) {
		this.topicSubscribers.unsubscribe(topic, fn);

		if (!this.topicSubscribers.hasSubscriberId(topic)) {
			this.unregister(topic);
		}
	}

	private register(topic: string) {
		this.send("SUBSCRIBE", { topic });
	}

	private unregister(topic: string) {
		this.send("UNSUBSCRIBE", { topic });
	}

	private send(type: string, data: any, force = false) {
		const message = { type, data };
		const json = JSON.stringify(message);

		if (force) this.socket.forceSendData(json);
		else this.socket.sendData(json);
	}

	private setupListeners() {
		this.registerMessageListener();

		this.socket.addEventListener("beforeopen", () => {
			this.registerClient();
		});

		this.socket.addEventListener("open", () => {
			this.registerSubscribers();
		});
	}

	private registerMessageListener() {
		this.socket.addEventListener("message", (messageData) => {
			const message = JSON.parse(messageData);
			const { type, data: dataObj } = message;

			if (type !== "PUBLISH") return;

			const { topic, data } = dataObj;

			this.topicSubscribers.invokeSubscribers(topic, data);
		});
	}

	private registerClient() {
		this.send(
			"REGISTER_CLIENT",
			{ projectId: this.options.projectId },
			true
		);
	}

	private registerSubscribers() {
		for (const topic of this.topicSubscribers.getSubscribersIds()) {
			this.register(topic);
		}
	}
}
