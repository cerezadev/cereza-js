export const expBackoff = (maxBackoff = 64000) => {
	let n = 0;

	return () => {
		const timeSecs = Math.pow(2, n++) + Math.random();
		const timeMillis = Math.ceil(timeSecs * 1000);

		return Math.min(timeMillis, maxBackoff);
	};
};
