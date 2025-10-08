//DetailView.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchArtwork, imageUrlFor } from "../api/aic";
import type { Artwork, CachedList } from "../types";
import styles from "../styles/DetailView.module.css";

export default function DetailView() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [item, setItem] = useState<Artwork | null>(null);

	useEffect(() => {
		let alive = true;
		(async () => {
		try {
			const data = await fetchArtwork(id!);
			if (!alive) return;
			setItem(data);
		} catch {
			const mock = await import("../mock/aicSample.json");
			const found = (mock.default as Artwork[]).find(x => x.id === Number(id));
			if (found) setItem(found);
		}
		})();
		return () => { alive = false; };
	}, [id]);

	const { prevId, nextId } = useMemo(() => {
		const raw = localStorage.getItem("lastIds");
		if (!raw) return { prevId: null as number | null, nextId: null as number | null };
		let parsed: CachedList | null = null;
		try { parsed = JSON.parse(raw); } catch {}
		const ids = parsed?.ids || [];
		const idx = ids.indexOf(Number(id));
		return {
		prevId: idx > 0 ? ids[idx - 1] : null,
		nextId: idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null,
		};
	}, [id]);

	if (!item) return <section className={styles.wrap}><p>Loading…</p></section>;

	const hero = imageUrlFor(item as any, 843);

	return (
		<section className={styles.wrap}>
		<div className={styles.topRow}>
			{/* <Link to={-1 as any} className={styles.back}>← Back</Link> */}
			{/* <div className={styles.spacer} /> */}
			<div className={styles.pager}>
				<button disabled={!prevId} onClick={() => prevId && navigate(`/art/${prevId}`)}>⟵ Prev</button>
				{/* <button disabled={!nextId} onClick={() => nextId && navigate(`/art/${nextId}`)}>Next ⟶</button> */}
			</div>
			<div className={styles.spacer} />
			<div className={styles.pager}>
				{/* <button disabled={!prevId} onClick={() => prevId && navigate(`/art/${prevId}`)}>⟵ Prev</button> */}
				<button disabled={!nextId} onClick={() => nextId && navigate(`/art/${nextId}`)}>Next ⟶</button>
			</div>

		</div>

		<article className={styles.card}>
			{hero && (
			<img className={styles.hero} src={hero} alt={item.title} />
			)}
			<div className={styles.meta}>
			<h1>{item.title}</h1>
			<dl>
				<dt>Artist</dt><dd>{item.artist_title || "Unknown"}</dd>
				<dt>Date</dt><dd>{item.date_display || "n.d."}</dd>
				<dt>Department</dt><dd>{(item as any).department_title || "—"}</dd>
				<dt>Classification</dt><dd>{(item as any).classification_title || "—"}</dd>
				<dt>ID</dt><dd>{item.id}</dd>
			</dl>
			</div>
		</article>
		</section>
	);
}
