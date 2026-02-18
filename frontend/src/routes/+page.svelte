<script lang="ts">
	let { data } = $props<{ data: { showcases: { key: string; display_name: string }[] } }>();
</script>

<ul>
	{#each data.showcases as showcase}
		<li>
			<a href="/{showcase.key}">{showcase.display_name}</a>
		</li>
	{/each}
</ul>
