<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import bradenw from './img/braden-w.jpg';
  import huntabyte from './img/huntabyte.jpg';
  import sillvva from './img/sillvva.jpg';
  import bugbug from './img/bugbug.png';
  import tylergaw from './img/tylergaw.jpg';
  import knd775 from './img/knd775.jpg';
  import chbert from './img/chbert.jpg';
  import cgalo5758 from './img/cgalo5758.png';
  import toucantix from './img/toucantix.png';
  import exceptionless from './img/exceptionless.png';
  import hemalr from './img/hemalr.webp';
  import teknikgeek from './img/teknikgeek.png';

  const sponsors = [
    [bradenw, 'Braden Wong', 'https://github.com/braden-w'],
    [huntabyte, 'Hunter Johnston', 'https://github.com/huntabyte'],
    [sillvva, 'Matt DeKok', 'https://github.com/sillvva'],
    [bugbug, 'bugbug.io', 'https://bugbug.io'],
    [tylergaw, 'Tyler Gaw', 'https://github.com/tylergaw'],
    [knd775, 'Ben Ayles', 'https://github.com/knd775'],
    [chbert, 'chbert', 'https://github.com/chbert'],
    [exceptionless, 'Exceptionless', 'https://exceptionless.com/'],
    [cgalo5758, 'Christian Galo', 'https://cgalo.dev/'],
    [toucantix, 'Toucantix', 'https://toucantix.com'],
    [hemalr, 'Hemal', 'https://github.com/HemalR'],
    [teknikgeek, 'TeknikGeek', 'https://teknikgeek.se']
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

    @media screen and (max-width: 861px) {
      max-width: 66px;
      max-height: 66px;
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
