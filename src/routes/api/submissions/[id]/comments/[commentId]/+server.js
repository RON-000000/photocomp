import { json } from '@sveltejs/kit';
import { deleteComment } from '$lib/server/models.js';
import { requireAuth } from '$lib/server/auth.js';

export async function DELETE(event) {
    try {
        // Require authentication
        const user = await requireAuth(event);

        const submissionId = event.params.id;
        const commentId = event.params.commentId;

        await deleteComment(submissionId, commentId, user._id, user.role);

        return json({ success: true });
    } catch (error) {
        console.error('Comment cleanup error:', error);
        return json({ error: error.message }, { status: error.status || 500 });
    }
}
