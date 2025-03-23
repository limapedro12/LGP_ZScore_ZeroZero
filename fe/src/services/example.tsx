import { User } from '../types/types';
export default function fetchData(): Promise<User> {
    return fetch('http://localhost:8080/examples/example') // Adjust the endpoint as needed
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}
