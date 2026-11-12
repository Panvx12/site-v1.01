<script>
	import items from '#lib/dataset/in-progress.json';
</script>

<section class="progress-section">
	{#each items as item}
		<div class="progress-card">
			<div class="card-header">
				<h1 class="title">{item.title}</h1>
				<span class="badge">{item.status} {item.progress}</span>
			</div>

			<p class="description">{item.description}</p>

			<div class="tech-tags">
				{#each item.techStack as tech}
					<span class="tag">{tech}</span>
				{/each}
			</div>

			<div class="progress-bar-container">
				<div class="progress-bar" style="width: {item.progress};"></div>
			</div>
		</div>
	{/each}
</section>

<style>
	.progress-section {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.progress-card {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #e0e0e0;
		padding: 20px;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		gap: 12px;
		overflow: hidden;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		width: 100%;
		box-sizing: border-box;
	}

	.title {
		margin: 0;
		font-size: 1.35rem;
		color: #1a1a1a;
		flex: 1;
		min-width: 0;

		word-break: break-all;
		overflow-wrap: break-word;
	}

	.badge {
		font-size: 0.8rem;
		padding: 4px 12px;
		border-radius: 999px;
		font-weight: 600;
		background-color: #e3f2fd;
		color: #1976d2;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.description {
		margin: 0;
		color: #555;
		font-size: 0.95rem;
		line-height: 1.5;
		width: 100%;
		box-sizing: border-box;
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.tech-tags {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tag {
		background-color: #f5f5f5;
		color: #333;
		font-size: 0.8rem;
		padding: 4px 8px;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	.tag:hover {
		cursor: pointer;
		background-color: #e0e0e0;
	}

	.progress-bar-container {
		width: 100%;
		height: 8px;
		background-color: #eee;
		border-radius: 999px;
		overflow: hidden;
		margin-top: 4px;
	}

	.progress-bar {
		height: 100%;
		background: #00f2fe;
		box-shadow: 0 0 5px #00f2fe;
		border-radius: 999px;
		transition: width 0.4s ease;
	}
	@media (max-width: 1100px) {
		.progress-section {
			display: flex;
			flex-direction: column;
		}
	}
</style>
