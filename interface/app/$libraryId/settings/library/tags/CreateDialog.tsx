import { useLibraryMutation, usePlausibleEvent } from '@sd/client';
import { Dialog, UseDialogProps, useDialog } from '@sd/ui';
import { Input, useZodForm, z } from '@sd/ui/src/forms';
import { ColorPicker } from '~/components';

const schema = z.object({
	name: z.string().trim().min(1).max(24),
	color: z.string()
});

export default (props: UseDialogProps & { assignToObject?: number }) => {
	const submitPlausibleEvent = usePlausibleEvent();

	const form = useZodForm({
		schema: schema,
		defaultValues: { color: '#A717D9' }
	});

	const createTag = useLibraryMutation('tags.create', {
		onSuccess: (tag) => {
			submitPlausibleEvent({ event: { type: 'tagCreate' } });
			if (props.assignToObject !== undefined) {
				assignTag.mutate({
					tag_id: tag.id,
					object_ids: [props.assignToObject],
					unassign: false
				});
			}
		},
		onError: (e) => {
			console.error('error', e);
		}
	});

	const assignTag = useLibraryMutation('tags.assign', {
		onSuccess: () => {
			submitPlausibleEvent({ event: { type: 'tagAssign' } });
		}
	});

	return (
		<Dialog
			form={form}
			dialog={useDialog(props)}
			onSubmit={form.handleSubmit((data) => createTag.mutateAsync(data))}
			title="Create New Tag"
			description="Choose a name and color."
			ctaLabel="Create"
		>
			<div className="relative mt-3 ">
				<Input
					{...form.register('name', { required: true })}
					placeholder="Name"
					maxLength={24}
					icon={<ColorPicker control={form.control} name="color" />}
				/>
			</div>
		</Dialog>
	);
};
