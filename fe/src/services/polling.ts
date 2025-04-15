/**
 * Polls the backend for updates at a specified interval.
 * @param url The backend endpoint to poll.
 * @param interval The polling interval in milliseconds.
 * @param callback A function to handle the response data.
 */
export function startPolling(
  url: string,
  interval: number,
  callback: (data: any) => void
): () => void {
  let polling = true;

  const poll = async () => {
      while (polling) {
          try {
              const response = await fetch(url);
              if (response.ok) {
                  const data = await response.json();
                  callback(data);
              } else {
                  console.error('Polling failed:', response.statusText);
              }
          } catch (error) {
              console.error('Polling error:', error);
          }
          await new Promise((resolve) => setTimeout(resolve, interval));
      }
  };

  poll();

  // Return a function to stop polling
  return () => {
      polling = false;
  };
}