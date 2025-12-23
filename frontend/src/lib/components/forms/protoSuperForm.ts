import { defaults, superForm } from 'sveltekit-superforms';

export function protoSuperForm<FormData>(
	id: string,
	fromObject: (data: { [key: string]: unknown }) => FormData,
	sendMessage: (data: FormData) => void,
	initialData: FormData,
	{
		onUpdated,
		cancelPred,
		resetForm,
		validationMethod
	}: {
		onUpdated?: () => void;
		cancelPred?: (data: FormData) => boolean;
		resetForm?: boolean;
		validationMethod?: 'auto' | 'oninput' | 'onblur' | 'onsubmit' | 'submit-only';
	} = {}
) {
	type T = FormData & Record<string, unknown>;
	const validator = {
		superFormValidationLibrary: 'custom' as const,
		async validate(
			data: unknown
		): Promise<{ success: false; issues: { message: string; path?: string[] }[] } | { success: true; data: T }> {
			try {
				return {
					success: true,
					data: fromObject(data as { [key: string]: unknown }) as T
				};
			} catch (e) {
				const errorMessage = String(e);
				// Try to map error messages to specific fields
				let path: string[] | undefined;
				if (errorMessage.includes('Name is required') || errorMessage.includes('name already exists')) {
					path = ['name'];
				} else if (errorMessage.includes('Price is required')) {
					path = ['price'];
				} else if (errorMessage.includes('Size is required')) {
					path = ['size'];
				} else if (errorMessage.includes('Buy It Now price')) {
					path = ['binPrice'];
				} else if (errorMessage.includes('Contact information')) {
					path = ['contact'];
				} else if (errorMessage.includes('Lot number')) {
					path = ['lotNumber'];
				} else if (errorMessage.includes('legal to auction')) {
					path = ['legalAffirmation'];
				} else if (errorMessage.includes('one active auction')) {
					path = ['name'];
				}
				
				return {
					success: false,
					issues: [{ message: errorMessage, path }]
				};
			}
		},
		jsonSchema: {}
	};

	const data = defaults(initialData as T, validator);

	return superForm(data, {
		id,
		SPA: true,
		validators: validator,
		validationMethod,
		clearOnSubmit: 'errors-and-message',
		resetForm: resetForm ?? true,
		onUpdate({ form, cancel }) {
			if (!form.valid) return;
			if (cancelPred && cancelPred(form.data)) {
				cancel();
				return;
			}
			sendMessage(form.data);
		},
		onUpdated() {
			if (onUpdated) {
				onUpdated();
			}
		}
	});
}
