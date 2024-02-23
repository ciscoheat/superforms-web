<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import nicholas from './img/nicholas.png';
  import torwent from './img/torwent.jpg';
  import matus from './img/matus.png';
  import bradenw from './img/braden-w.jpg';
  import saturnonearth from './img/saturnonearth.jpg';
  import huntabyte from './img/huntabyte.jpg';
  import jitpackjoyride from './img/jitpackjoyride.jpg';
  import sillvva from './img/sillvva.jpg';
  import bugbug from './img/bugbug.png';
  import risk21 from './img/21risk.png';

  const sponsors = [
    [nicholas, 'Nicholas Singh', 'https://github.com/adonis2611'],
    [torwent, 'Torwent', 'https://github.com/Torwent'],
    [matus, 'Vicente Matus', 'https://github.com/vicentematus'],
    [bradenw, 'Braden Wong', 'https://github.com/braden-w'],
    [saturnonearth, 'Cory Tyburski', 'https://github.com/saturnonearth'],
    [huntabyte, 'Hunter Johnston', 'https://github.com/huntabyte'],
    [jitpackjoyride, 'Ajit Krishna', 'https://github.com/JitPackJoyride'],
    [sillvva, 'Matt DeKok', 'https://github.com/sillvva'],
    [bugbug, 'bugbug.io', 'https://bugbug.io'],
    [risk21, '21RISK', 'https://21risk.com']
  ];
</script>

<div class="sponsors">
  {#each sponsors as sponsor}
    <div>
      <a href={sponsor[2]} target="_blank">
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
    justify-content: center;
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
