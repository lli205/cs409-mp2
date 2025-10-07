//ListView.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArtworksPages, searchAllArtworks } from "../api/aic";
import type { Artwork, CachedList } from "../types";
import { useLocalCache } from "../hooks/useLocalCache";
import styles from "../styles/ListView.module.css";

const SORTS = [
	{ key: "title", label: "Title" },
	{ key: "artist_title", label: "Artist" },
] as const;

	type SortKey = typeof SORTS[number]["key"];
	type Order = "asc" | "desc";

	export default function ListView() {
	const [items, setItems] = useState<Artwork[]>([]);
	const [query, setQuery] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("title");
	const [order, setOrder] = useState<Order>("asc");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;

		async function load() {
		try {
			if (query.trim()) {
			const found = await searchAllArtworks(query, {
				limitPerPage: 50,
				maxPages: 50,
				maxResults: 1000,
				onlyWithImage: false,
			});
			if (!alive) return;
			setItems(found as unknown as Artwork[]);
			} else {
			const data = await fetchArtworksPages([1, 2], 50);
			if (!alive) return;
			setItems(data as Artwork[]);
			}
		} catch (e: any) {
			if (!alive) return;
			setError("Network error — using mock data.");
			const mock = await import("../mock/aicSample.json");
			setItems(mock.default as Artwork[]);
		}
	}

		const t = setTimeout(load, 250);
		return () => { alive = false; clearTimeout(t); };
	}, [query]);

	const filtered = useMemo(() => {
		const base = items;
		const sorted = [...base].sort((a, b) => {
		const av = ((a as any)[sortKey] || "").toString().toLowerCase();
		const bv = ((b as any)[sortKey] || "").toString().toLowerCase();
		if (av < bv) return order === "asc" ? -1 : 1;
		if (av > bv) return order === "asc" ? 1 : -1;
		return 0;
		});
		return sorted;
	}, [items, sortKey, order]);

	const cached: CachedList = { ids: filtered.map(i => i.id), when: Date.now() };
	useLocalCache("lastIds", cached);

	return (
		<section className={styles.wrap}>
		<h1>Search</h1>

		<div className={styles.controls}>
			<input
			className={styles.search}
			placeholder="Search by title or artist…"
			value={query}
			onChange={e => setQuery(e.target.value)}
			/>

			<label className={styles.sortRow}>
			<span>Sort by</span>
			<select value={sortKey} onChange={e => setSortKey(e.target.value as any)}>
				{SORTS.map(s => (
				<option key={s.key} value={s.key}>{s.label}</option>
				))}
			</select>
			<button onClick={() => setOrder(o => (o === "asc" ? "desc" : "asc"))}>
				{order === "asc" ? "Asc ⬆" : "Desc ⬇"}
			</button>
			</label>
		</div>

		{error && <div className={styles.error}>{error}</div>}

		<ul className={styles.list}>
			{filtered.map(item => (
			<li key={item.id} className={styles.row}>
				<Link to={`/art/${item.id}`} className={styles.link}>
				<strong>{item.title}</strong>
				<span className={styles.meta}>
					{(item as any).artist_title || "Unknown"} • {(item as any).date_display || "n.d."}
				</span>
				</Link>
			</li>
			))}
		</ul>
		</section>
	);
}
