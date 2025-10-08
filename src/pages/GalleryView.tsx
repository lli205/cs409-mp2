//GalleryView.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArtworksPages, firstImageId, imageUrlFor } from "../api/aic";
import type { Artwork } from "../types";
import styles from "../styles/GalleryView.module.css";
import { useLocalCache } from "../hooks/useLocalCache";
import type { CachedList } from "../types";

export default function GalleryView() {
	const [items, setItems] = useState<Artwork[]>([]);
	const [filterDept, setFilterDept] = useState<string>("All");
	const [onlyHasImage, setOnlyHasImage] = useState(true);

	useEffect(() => {
		let alive = true;
		(async () => {
		try {
			const data = await fetchArtworksPages([1, 2], 50);
			if (!alive) return;
			setItems(data as Artwork[]);
		} catch {
			const mock = await import("../mock/aicSample.json");
			setItems(mock.default as Artwork[]);
		}
		})();
		return () => { alive = false; };
	}, []);

	const departments = useMemo(() => {
		const set = new Set(items.map(i => (i as any).department_title).filter(Boolean) as string[]);
		return ["All", ...Array.from(set).sort()];
	}, [items]);

	const visible = useMemo(() => {
		return items.filter(i => {
			const hasAnyImage = !!firstImageId(i as any) || !!(i as any).fallback; // ← count fallback
			if (onlyHasImage && !hasAnyImage) return false;
			if (filterDept !== "All" && (i as any).department_title !== filterDept) return false;
			return true;
		});
	}, [items, onlyHasImage, filterDept]);

	const cached: CachedList = { ids: visible.map(i => i.id), when: Date.now() };
	useLocalCache("lastIds", cached);

	return (
		<section className={styles.wrap}>
		<h1>Gallery</h1>

		<div className={styles.filters}>
			<label>
			Department:
			<select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
				{departments.map(d => (
				<option key={d} value={d}>{d}</option>
				))}
			</select>
			</label>
			<label className={styles.checkbox}>
			<input
				type="checkbox"
				checked={onlyHasImage}
				onChange={e => setOnlyHasImage(e.target.checked)}
			/>
			Only items with images (incl. alt)
			</label>
		</div>

		<div className={styles.grid}>
		{visible.map(item => {
			const src = imageUrlFor(item as any, 400); // ← one line gets real or fallback image
			return (
			<Link key={item.id} to={`/art/${item.id}`} className={styles.card}>
				{src ? (
				<img src={src} alt={item.title} loading="lazy" />
				) : (
				<div className={styles.placeholder}>No image</div>
				)}
				<div className={styles.caption}>
				<strong>{item.title}</strong>
				<span>{(item as any).artist_title || "Unknown"}</span>
				</div>
			</Link>
			);
		})}
		</div>
		</section>
	);
}
