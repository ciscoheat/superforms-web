<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import careswitch from './img/careswitch.png';
  import nicholas from './img/nicholas.png';
  import torwent from './img/torwent.jpg';
  import matus from './img/matus.png';

  const sponsors = [
    [careswitch, 'Careswitch', 'https://www.careswitch.com/', 'rounded-none'],
    [nicholas, 'Nicholas Singh', 'https://github.com/adonis2611'],
    [torwent, 'Torwent', 'https://github.com/Torwent'],
    [matus, 'Vicente Matus', 'https://github.com/vicentematus']
  ];
</script>

<div class="sponsors">
  {#each sponsors as sponsor}
    <div>
      <a href={sponsor[2]}>
        <Avatar
          src={sponsor[0]}
          background="transparent"
          width="w-32 md:w-24"
          rounded={sponsor[3] || 'rounded-full'} />
        <span class="name mt-1">{sponsor[1]}</span>
      </a>
    </div>
  {/each}
</div>

<style lang="scss">
  :global(figure.avatar) {
    max-width: 128px;
    max-height: 128px;
    margin: 0;

    @media screen and (max-width: 768px) {
      max-width: 96px;
      max-height: 96px;
    }
  }

  :global(#sponsoring) {
    margin-top: 1rem;
  }

  .sponsors {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    text-align: center;
    margin-bottom: 1rem;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none !important;
    }
  }
</style>
