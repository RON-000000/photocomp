import { z } from 'zod';

/**
 * Validation Schemas für PhotoZürich
 * Verwendet Zod für Type-Safe Input Validation
 */

// ==================== COMPETITION SCHEMAS ====================

export const CompetitionCreateSchema = z.object({
	title: z.string()
		.min(3, 'Titel muss mindestens 3 Zeichen lang sein')
		.max(100, 'Titel darf maximal 100 Zeichen lang sein')
		.trim(),

	description: z.string()
		.min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein')
		.max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein')
		.trim(),

	theme: z.string()
		.min(3, 'Thema muss mindestens 3 Zeichen lang sein')
		.max(100, 'Thema darf maximal 100 Zeichen lang sein')
		.trim(),

	// Accept both string and array (frontend sends array)
	rules: z.union([
		z.string().max(5000, 'Regeln dürfen maximal 5000 Zeichen lang sein'),
		z.array(z.string()).transform(arr => arr.join('\n'))
	]).optional().default(''),

	// Accept ISO datetime or date string
	startDate: z.string()
		.refine(
			(val) => !isNaN(Date.parse(val)),
			'Ungültiges Startdatum-Format'
		)
		.transform(val => new Date(val).toISOString()),

	deadline: z.string()
		.refine(
			(val) => !isNaN(Date.parse(val)),
			'Ungültiges Deadline-Format'
		)
		.transform(val => new Date(val).toISOString()),

	votingDeadline: z.string()
		.refine(
			(val) => !isNaN(Date.parse(val)),
			'Ungültiges Voting-Deadline-Format'
		)
		.transform(val => new Date(val).toISOString())
		.optional(),

	// Support both heroImage and imageUrl (different naming in frontend/backend)
	heroImage: z.string()
		.url('Ungültige Hero-Image URL')
		.optional()
		.or(z.literal('')),

	imageUrl: z.string()
		.url('Ungültige Image URL')
		.optional()
		.or(z.literal('')),

	status: z.enum(['draft', 'active', 'voting', 'completed'])
		.optional()
		.default('active'),

	votingWeight: z.object({
		community: z.number().min(0).max(1),
		jury: z.number().min(0).max(1)
	}).refine(
		(data) => Math.abs((data.community + data.jury) - 1.0) < 0.01,
		'Voting-Gewichte müssen zusammen 1.0 ergeben'
	).optional(),

	// Accept both string array (frontend) and object array
	prizes: z.union([
		z.array(z.string().min(1).max(100)).max(10, 'Maximal 10 Preise erlaubt'),
		z.array(z.object({
			position: z.number().int().positive(),
			title: z.string().min(1).max(100),
			description: z.string().max(500).optional()
		})).max(10, 'Maximal 10 Preise erlaubt')
	]).optional(),

	juryMembers: z.array(z.string().min(1).max(50))
		.max(20, 'Maximal 20 Jury-Mitglieder erlaubt')
		.optional()
});

export const CompetitionUpdateSchema = CompetitionCreateSchema.partial();

// ==================== SUBMISSION SCHEMAS ====================

export const SubmissionCreateSchema = z.object({
	competitionId: z.string()
		.min(1, 'Competition ID ist erforderlich'),

	title: z.string()
		.min(3, 'Titel muss mindestens 3 Zeichen lang sein')
		.max(100, 'Titel darf maximal 100 Zeichen lang sein')
		.trim(),

	description: z.string()
		.max(1000, 'Beschreibung darf maximal 1000 Zeichen lang sein')
		.optional()
		.default(''),

	imageUrl: z.string()
		.url('Ungültige Bild-URL'),

	metadata: z.object({
		camera: z.string().max(100).optional(),
		lens: z.string().max(100).optional(),
		settings: z.string().max(200).optional(),
		location: z.string().max(200).optional(),
		takenAt: z.string().datetime().optional()
	}).optional()
});

// ==================== USER SCHEMAS ====================

export const UserSyncSchema = z.object({
	auth0Id: z.string()
		.min(1, 'Auth0 ID ist erforderlich'),

	email: z.string()
		.email('Ungültige Email-Adresse')
		.max(255),

	name: z.string()
		.min(1, 'Name ist erforderlich')
		.max(100)
		.trim(),

	avatar: z.string()
		.url('Ungültige Avatar-URL')
		.optional(),

	username: z.string()
		.min(3, 'Username muss mindestens 3 Zeichen lang sein')
		.max(30, 'Username darf maximal 30 Zeichen lang sein')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Username darf nur Buchstaben, Zahlen, - und _ enthalten')
		.trim()
});

export const UserRoleUpdateSchema = z.object({
	role: z.enum(['user', 'jury', 'admin'], {
		errorMap: () => ({ message: 'Rolle muss user, jury oder admin sein' })
	})
});

export const UserProfileUpdateSchema = z.object({
	name: z.string()
		.min(1, 'Name ist erforderlich')
		.max(100)
		.trim()
		.optional(),

	bio: z.string()
		.max(500, 'Bio darf maximal 500 Zeichen lang sein')
		.optional(),

	location: z.string()
		.max(100, 'Standort darf maximal 100 Zeichen lang sein')
		.optional(),

	website: z.string()
		.url('Ungültige Website-URL')
		.max(200)
		.optional()
		.or(z.literal('')),

	avatar: z.string()
		.url('Ungültige Avatar-URL')
		.optional()
});

// ==================== COMMENT SCHEMAS ====================

export const CommentCreateSchema = z.object({
	text: z.string()
		.min(1, 'Kommentar darf nicht leer sein')
		.max(500, 'Kommentar darf maximal 500 Zeichen lang sein')
		.trim()
});

// ==================== RATING SCHEMAS ====================

export const JuryRatingSchema = z.object({
	submissionId: z.string()
		.min(1, 'Submission ID ist erforderlich'),

	competitionId: z.string()
		.min(1, 'Competition ID ist erforderlich'),

	rating: z.number()
		.min(1, 'Bewertung muss mindestens 1 sein')
		.max(10, 'Bewertung darf maximal 10 sein')
		.refine(
			(val) => Number.isFinite(val),
			'Bewertung muss eine gültige Zahl sein'
		),

	comment: z.string()
		.max(1000, 'Kommentar darf maximal 1000 Zeichen lang sein')
		.optional()
		.default('')
});

// ==================== FILE UPLOAD SCHEMAS ====================

export const ImageUploadSchema = z.object({
	size: z.number()
		.max(100 * 1024 * 1024, 'Bild darf maximal 100MB groß sein'),

	type: z.string()
		.refine(
			(type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
			'Nur JPEG, PNG und WebP Bilder sind erlaubt'
		),

	name: z.string()
		.max(255, 'Dateiname darf maximal 255 Zeichen lang sein')
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate data against a schema and return formatted errors
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {Object} {success: boolean, data?: any, errors?: string[]}
 */
export function validate(schema, data) {
	try {
		const validated = schema.parse(data);
		return { success: true, data: validated };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.errors.map(err => {
				const path = err.path.join('.');
				return path ? `${path}: ${err.message}` : err.message;
			});
			return { success: false, errors };
		}
		return { success: false, errors: ['Validation fehlgeschlagen'] };
	}
}

/**
 * Validate and throw error if invalid (for use in endpoints)
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {any} Validated data
 * @throws {Error} If validation fails
 */
export function validateOrThrow(schema, data) {
	const result = validate(schema, data);
	if (!result.success) {
		const error = new Error(result.errors.join(', '));
		error.status = 400;
		throw error;
	}
	return result.data;
}
