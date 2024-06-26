/** @format */

import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { hasRolePermission, UserPermission } from "$lib/userPermissions";
import { db } from "$lib/server/postgresClient";
import { __envDir } from "$lib/utils";
import { logger } from "$lib/server/logger";

export const actions = {
	/**
	 * Create a new committee for the committee page
	 * @param {string} request.category the category of the committee (like "2022-2023")
	 * @param {string} request.title title of committee
	 * @param {string} request.name name of committee
	 * @param {string?} request.description description of committee
	 * @param {Blob?} request.image description of committee
	 */
	addCommittee: async ({ locals, request }) => {
		if (!locals.authenticated) return fail(401, { message: "Not authentified" });
		if (!hasRolePermission(UserPermission.MODIFY_COMMITTEE_PAGE, locals.user?.role))
			return fail(403, { message: "User doesn't have the permission to do that" });

		const body = await request.formData();
		console.log(body);

		const category = body.get("category")?.toString();
		if (!category) return fail(400, { message: "No category found" });
		const image = body.get("image")?.valueOf() as Blob | undefined;
		console.log(image);

		const barray = image ? Buffer.from(await image.arrayBuffer()) : null;
		console.log(barray);

		return db
			.any("SELECT item_order FROM committee_info WHERE category = $1", [category])
			.then((res) => {
				res.push({ item_order: -1 }); //If the array is empty, set the max to -1 so that the new order will be 0
				const maxOrder = Math.max(...res.map((v) => v.item_order));

				return db
					.none(
						`INSERT INTO committee_info
					(category,title,item_order,name,description,image)
					VALUES ($1,$2,$3,$4,$5,$6)`,
						[
							body.get("category")?.toString(),
							body.get("title")?.toString(),
							maxOrder + 1,
							body.get("name")?.toString(),
							body.get("description")?.toString(),
							barray,
						],
					)
					.then(() => {
						return { success: true };
					});
			})
			.catch((err) => {
				logger.error(err);
				return fail(500, err.message);
			});
	},
} satisfies Actions;
