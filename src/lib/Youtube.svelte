<script lang="ts">
	export let id: string;
</script>

<div class="flex justify-center">
	<div class="video-container">
		<iframe
			title="Youtube video"
			src={`https://www.youtube.com/embed/${id}`}
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		/>
	</div>
</div>

<style>
	.video-container {
		overflow: hidden;
		position: relative;
		width: 100%;
		max-width: 600px;
	}

	.video-container::after {
		padding-top: 56.25%;
		display: block;
		content: '';
	}

	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
