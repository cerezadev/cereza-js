import MessengerQueue from "../utils/queue/MessengerQueue";
import WebSocketExtern from "./WebSocketExtern";
import { SubscriberFn } from "../utils/subscriber/SubscriberFn";

export default class WebSocketClient extends MessengerQueue<string> {
	private readonly socket: WebSocketExtern;

	constructor(address: string) {
		super();

		this.socket = new WebSocketExtern(address);

		this.pauseProcessing();

		this.socket.subscribe("open", () => {
			this.resumeProcessing();
		});

		this.socket.subscribe("error", () => {
			this.pauseProcessing();
		});
	}

	public addEventListener(event: string, fn: SubscriberFn<any>) {
		this.socket.subscribe(event, fn);
	}

	public forceSendData(data: string) {
		this.socket.send(data);
	}
}
