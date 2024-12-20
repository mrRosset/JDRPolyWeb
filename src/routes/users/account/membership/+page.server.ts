/** @format */

import type { RequestEvent, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { db } from "$lib/server/postgresClient";
import { updateMemberPeriod } from "$lib/server/memberPeriod";
import { Period } from "$lib/publicMemberPeriod";
import { Role, Roles } from "$lib/userPermissions";
import type { Id } from "$gtypes";
import { logger } from "$lib/server/logger";

type UserDb = {
	id: Id;
	member_start: string;
	member_stop: string;
	role: Role;
	email: string;
};
/**
 * For a user, validate a code and add the correspoding member time.
 * @param {number} request.validation_token the number of periods to add
 * @returns list of mails that are not found and who can't get emails
 */
export const actions = {
	default: async ({ request, locals }: RequestEvent) => {
		if (!locals.authenticated) throw error(401);
		const form = await request.formData();

		return await db
			.one("SELECT validation_token, periods FROM members_code WHERE validation_token=$1", [
				form.get("validation_token"),
			]) //Get matching token
			.then((res) => {
				return db
					.one("SELECT id, member_start, member_stop, role, email FROM users WHERE id=$1;", [
						locals.user?.id,
					]) //get user data
					.then((dbResult) => {
						dbResult.role = Roles[dbResult.role];
						const user: UserDb = dbResult;

						db.none("DELETE FROM members_code WHERE validation_token=$1", [res.validation_token]); //Delete now invalid token

						//Calculate new member period
						let period = new Period(user.member_start, user.member_stop);
						period.addSemesters(res.periods);
						updateMemberPeriod(user, period);

						return {
							periodNumber: res.periods,
							period: {
								start: period.start,
								stop: period.stop,
							},
						};
					});
			})
			.catch((err) => {
				logger.error(err);
				return fail(500, { error_message: err.message, message: "Ce code n'est pas valide." });
			});
	},
} satisfies Actions;
