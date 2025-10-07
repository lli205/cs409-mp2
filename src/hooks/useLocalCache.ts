//useLocalCache.ts
import { useEffect, useRef } from "react";

export function useLocalCache<T>(key: string, value: T) {
	const first = useRef(true);
	useEffect(() => {
		if (first.current) { first.current = false; return; }
		try {
		localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}, [key, value]);
}