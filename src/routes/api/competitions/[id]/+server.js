import { json } from '@sveltejs/kit';
import { getCompetitionById, updateCompetition, deleteCompetition, checkAndUpdateCompetitionStatus, getSubmissionsByCompetitionId } from '$lib/server/models.js';
import { requireRole } from '$lib/server/auth.js';
import { CompetitionUpdateSchema, validateOrThrow } from '$lib/server/validation.js';
import { deleteImage, deleteImages } from '$lib/server/cloudinary.js';

export async function GET({ params }) {
	try {
		// Check and update status automatically
		const competition = await checkAndUpdateCompetitionStatus(params.id);

		if (!competition) {
			return json({ error: 'Competition nicht gefunden' }, { status: 404 });
		}

		return json(competition);
	} catch (error) {
		console.error('Get competition error:', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		const updates = await event.request.json();

		// Validate with Zod schema (partial update)
		const validated = validateOrThrow(CompetitionUpdateSchema, updates);

		// Additional date validation if both dates provided
		if (validated.startDate && validated.deadline) {
			const startDate = new Date(validated.startDate);
			const deadline = new Date(validated.deadline);
			if (startDate >= deadline) {
				return json({ error: 'Deadline muss nach dem Startdatum liegen' }, { status: 400 });
			}
		}

		await updateCompetition(event.params.id, validated);
		const updatedCompetition = await getCompetitionById(event.params.id);

		return json(updatedCompetition);
	} catch (error) {
		console.error('Update competition error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}

export async function DELETE(event) {
	try {
		// Require admin role
		await requireRole(event, 'admin');

		// Get competition to delete its image
		const competition = await getCompetitionById(event.params.id);

		if (!competition) {
			return json({ error: 'Competition nicht gefunden' }, { status: 404 });
		}

		// Get all submissions for this competition to delete their images
		const submissions = await getSubmissionsByCompetitionId(event.params.id);
		const submissionImageUrls = submissions
			.map(sub => sub.imageUrl)
			.filter(url => url);

		// Delete competition hero image from Cloudinary
		if (competition.imageUrl) {
			await deleteImage(competition.imageUrl);
		}

		// Delete all submission images from Cloudinary
		if (submissionImageUrls.length > 0) {
			await deleteImages(submissionImageUrls);
		}

		// Delete competition from database (cascade deletes submissions)
		await deleteCompetition(event.params.id);

		return json({ success: true, message: 'Competition erfolgreich gelöscht' });
	} catch (error) {
		console.error('Delete competition error:', error);
		return json({ error: error.message }, { status: error.status || 500 });
	}
}
