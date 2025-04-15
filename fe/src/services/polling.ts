export let latestPollingData = 0;
let isPolling = true;

export async function startPolling(
    url: string,
    interval: number,
): Promise<void> {
    console.log('alala');
    while (isPolling) {
        const fullUrl = `${url}?number=${latestPollingData}`;
        const response = await fetch(fullUrl);
        if (response.ok) {
            const data = await response.json();
            latestPollingData = data.result;
        }
        console.log('Polling:', latestPollingData);
        await sleep(interval);
    }
}

async function sleep(miliseconds: number) {
    await new Promise((resolve) => setTimeout(resolve, miliseconds));
}

export function stopPolling(): void {
    isPolling = false;
}
