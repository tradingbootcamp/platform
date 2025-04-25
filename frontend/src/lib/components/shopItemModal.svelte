<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	let {
		item,
		close
	} = $props<{
		item: {
			id: string;
			name: string;
			description: string;
			price: number;
			imageUrl: string;
		};
		close: () => void;
	}>();

	let isOpen = $state(true);

	function handlePurchase() {
		// Placeholder for purchase functionality
		console.log('Purchase item:', item);
		isOpen = false;
		close();
	}

	function handleOpenChange(open: boolean) {
		isOpen = open;
		if (!open) {
			close();
		}
	}
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{item.name}</Dialog.Title>
			<Dialog.Description>
				{item.description}
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4">
			<div class="aspect-square w-full bg-muted">
				<img
					src={item.imageUrl}
					alt={item.name}
					class="h-full w-full object-cover"
					onerror={() => event.currentTarget.src = 'https://placehold.co/400x400'}
				/>
			</div>
			<p class="mt-4 text-right text-xl font-bold">📎 {item.price}</p>
		</div>

		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={() => handleOpenChange(false)}>Cancel</Button>
			<Button onclick={handlePurchase}>Purchase</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>