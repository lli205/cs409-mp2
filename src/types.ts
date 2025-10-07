//types.ts
export type Artwork = {
	id: number;
	title: string;
	artist_title: string | null;
	date_display: string | null;
	image_id: string | null;
	alt_image_ids?: string[] | null;
	department_title: string | null;
	classification_title: string | null;
	fallback?: string;
};
  
	export type AICResponse = {
		data: Artwork[];
		pagination: {
		total: number;
		limit: number;
		current_page: number;
		total_pages: number;
		};
	};
  
  	export type CachedList = { ids: number[]; when: number };
  