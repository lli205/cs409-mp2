//client.ts
import axios from "axios";
  
const client = axios.create({
	baseURL: "https://api.artic.edu/api/v1",
	timeout: 10000,
});

export default client;