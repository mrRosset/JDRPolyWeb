import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (({ params, fetch }) => {
	return fetch('/api/users/' + params.id)
		.then((res) => res.json())
		.then((res) => {
			return res
		})
		.catch((err) => {
			throw redirect(307, '/404');
		})
}) satisfies PageLoad;


