<script lang="ts">
	export let label = '';
</script>

<div>
	<div class="m-4">
		<span>{label}</span>
		<input class="input" type="text" min="00:00" max="23:59" />
	</div>
</div>
