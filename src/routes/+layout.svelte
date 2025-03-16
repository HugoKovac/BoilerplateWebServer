<script>
	import { goto } from '$app/navigation';
	import '../app.postcss';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { AppBar, AppShell, Avatar, Drawer, storePopup, Toast } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { AlignLeft, UserRound, Heading1, Heading2, Heading3 } from 'lucide-svelte';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	/** @type {import('./$types').LayoutData} */

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	export let data;

	const drawerStore = getDrawerStore();

	const handleClick = () => {
		console.log('click');
		drawerStore.open();
	};

	$: classesActive = (href) => (href === $page.url.pathname ? '!bg-primary-500' : '');

	const drawerClose = () => {
		drawerStore.close();
	};
</script>

<Toast />
<Drawer>
	<div class="flex flex-col m-5">
		<a href="/" class={classesActive('/') + 'h-12 text-xl mb-5 font-bold'} on:click={drawerClose}
			>🥚 Boiler</a
		>
		<div class="flex flex-col justify-between">
			<nav class="list-nav">
				<ul>
					<li>
						<a href="/test/one" class={classesActive('/test/one')} on:click={drawerClose}>
							<span class="badge bg-primary-500"><Heading1 /></span>
							<span class="flex-auto">One</span>
						</a>
					</li>
					<li>
						<a href="/test/two" class={classesActive('/test/two')} on:click={drawerClose}>
							<span class="badge bg-primary-500"><Heading2 /></span>
							<span class="flex-auto">Two</span>
						</a>
					</li>
					<li>
						<a href="/test/three" class={classesActive('/test/three')} on:click={drawerClose}>
							<span class="badge bg-primary-500"><Heading3 /></span>
							<span class="flex-auto">Three</span>
						</a>
					</li>
				</ul>
			</nav>
			<nav class="list-nav">
				<ul>
					<li>
						<a href="/me" class={classesActive('/me')} on:click={drawerClose}>
							<span class="badge bg-primary-500"><UserRound /></span>
							<span class="flex-auto">Profile</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
	</div>
</Drawer>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar slotDefault="place-self-center" slotTrail="place-content-end">
			<svelte:fragment slot="lead">
				<button
					class="h-12 text-xl font-bold"
					on:click={() => {
						goto('/');
					}}>🥚 Boiler</button
				>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if data.avatar_letters}
					<!-- <Avatar
						initials={data.avatar_letters}
						width="w-12"
						heigth="h-12"
						background="bg-primary-500"
						border="border-4 border-surface-300-600-token hover:!border-primary-500"
						cursor="cursor-pointer"
						on:click={() => {
							goto('/me');
						}}
					/> -->
					<button on:click={handleClick}>
						<AlignLeft class="w-12 hover:opacity-75 hover:cursor-pointer" />
					</button>
				{:else if !data?.display_log_btn}
					<a href="/login" type="button" class="btn variant-ringed-secondary">Login</a>
					<a href="/register" type="button" class="btn variant-ringed-primary">Register</a>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot />
</AppShell>
