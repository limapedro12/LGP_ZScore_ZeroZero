export let latestPollingData = 0;
let isPolling = true;

export async function startPolling(
    url: string,
    interval: number,
): Promise<void> {
    while (isPolling) {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            latestPollingData = data.cards;
        } else {
            console.error('Failed to fetch polling data:', response.status);
        }
        await sleep(interval);
    }
}

async function sleep(miliseconds: number) {
    await new Promise((resolve) => setTimeout(resolve, miliseconds));
}

export function stopPolling(): void {
    isPolling = false;
}
