<script>
    import Spinner from './Spinner.svelte';
  import { onMount } from 'svelte';
  let ready = false;
  onMount(() => {
    setTimeout(() => {
      ready = true;
    }, 2000);
  });
    export let alt = false;
    let date = new Date();
    date.setDate(date.getDate() + 13);
    date.setHours(date.getHours() + 7);
    date.setMinutes(date.getMinutes() + 56);
    date.setSeconds(date.getSeconds() + 15);
    let seconds;
    let minutes;
    let hours;
    let days;
    function countdown() {
        let timeLeft = date - new Date();
        seconds = Math.floor((timeLeft / 1000) % 60);
        minutes = Math.floor((timeLeft / 1000 / 60) % 60);
        hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    }
    countdown();
    setInterval(countdown, 1000);
</script>


<div class="nk-wrap">
    <header class="nk-header page-header is-transparent is-sticky is-shrink is-dark" id="header">
      <!-- Header @s -->
      <div class="header-main">
        <div class="header-container container">
          <div class="header-wrap">
            <!-- Logo @s -->
            <div class="header-logo logo animated" data-animate="fadeInDown" data-delay=".65">
              <a href="./" class="logo-link">
                <img class="logo-dark" src="images/logo.png" srcset="images/logo2x.png 2x" alt="logo" />
                <img class="logo-light" src="images/logo-white.png" srcset="images/logo-white2x.png 2x" alt="logo" />
              </a>
            </div>
  
            <!-- Menu Toogle @s -->
            <div class="header-nav-toggle">
              <!-- svelte-ignore a11y-invalid-attribute -->
              <a href="#" class="navbar-toggle" data-menu-toggle="example-menu-04">
                <div class="toggle-line">
                  <span></span>
                </div>
              </a>
            </div>
  
            <!-- Menu @s -->
            <div class="header-navbar header-navbar-s1">
              <nav class="header-menu" id="example-menu-04">
                <ul class="menu menu-s2 animated" data-animate="fadeInDown" data-delay=".75">
                  <li class="menu-item"><a class="menu-link nav-link" href="#ico">About</a></li>
                  <li class="menu-item"><a class="menu-link nav-link" href="#token">Tokenomics</a></li>
                  <li class="menu-item"><a class="menu-link nav-link" href="#roadmap">Roadmap</a></li>
                  <li class="menu-item"><a class="menu-link nav-link" href="#news">News</a></li>
                  <li class="menu-item"><a class="menu-link nav-link" href="LandingPage">RU RDY?</a></li>
                  <li class="menu-item">
                    <a class="menu-link nav-link" href="https://pbom.rocketbunny.io/wrap.html">Wrap $BUNNY</a>
                  </li>
                </ul>
                <ul class="menu-btns animated" data-animate="fadeInDown" data-delay=".85">
                  <li>
                    <a
                      href="https://drop.rocketbunny.io/"
                      target="_blank"
                      class="btn btn-rg btn-auto btn-outline btn-grad on-bg-theme btn-round"><span>ROCKET DROP</span></a
                    >
                  </li>
                </ul>
              </nav>
            </div>
            <!-- .header-navbar @e -->
          </div>
        </div>
      </div>
      </header>
</div>

<br><br><br><br><br><br><br><br>


<div class="container" class:alt={alt}>

    <p>ARE YOU READY? ON <span>{`${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`}</span></p>
    <div class="time-wrapper">
        <div class="cell">
            <span class="number">{days}</span>
            <span class="label">days</span>
        </div>

        <div class="cell">
            <span class="number">{hours.toString().padStart(2, '0')}</span>
            <span class="label">hours</span>
        </div>

        <div class="cell">
            <span class="number">{minutes}</span>
            <span class="label">min</span>
        </div>

        <div class="cell">
            <span class="number">{seconds}</span>
            <span class="label">sec</span>
        </div>
    </div>
</div>
<br><br><br>
<footer class="nk-footer bg-theme-alt section-connect">
    <div class="section section-m pb-0 tc-light ov-h">
      <div class="section section-footer section-s tc-light bg-transparent">
        <div class="container">
          <!-- Block @s -->
          <div class="nk-block block-footer">
            <div class="row">
              <div class="col">
                <div class="wgs wgs-text text-center mb-3">
                  <ul class="social pdb-m justify-content-center">
                    <li>
                      <a href="https://t.me/RocketBunnyChat" target="_blank">
                        <em class="social-icon fab fa-telegram"></em>
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com/RocketBunny2021" target="_blank">
                        <em class="social-icon fab fa-twitter"></em>
                      </a>
                    </li>
                    <li>
                      <a href="https://rocketbunny.medium.com/" target="_blank">
                        <em class="social-icon fab fa-medium-m"></em>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/channel/UCyaV80BMsZPoT_bxPZ_rg4Q" target="_blank">
                        <em class="social-icon fab fa-youtube"></em>
                      </a>
                    </li>
                  </ul>
                  <div class="copyright-text copyright-text-s3 pdt-m">
                    <p><span class="d-sm-block">Copyright &copy; 2021, <a href="./">ROCKET BUNNY</a></span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- .block @e -->
        </div>
      </div>
    </div>
  </footer>


{#if !ready}
  <Spinner />
{/if}


<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    p,
    .number, 
    .label {
        color: white;
        font-weight: 700;
    }
    .alt p {
        color: var(--color-very-dark-grey);
    }
    .alt .number {
        color: var(--color-blue);
    }
    .alt .label {
        color: var(--color-grey);
    }
    p {
        margin-bottom: 2.25rem;
        font-size: 2rem;
        letter-spacing: 5px;
        line-height: 6rem;
        text-transform: uppercase;
    }
    p span {
        color: var(--color-blue);
    }
    .time-wrapper {
        display: flex;
        margin-bottom: 5rem;
    }
    /* time cells */
    .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 9rem;
        border-radius: 4px;
        padding-top: 1.25rem;
        background-color: var(--color-dark-grey);
    }
    .alt .cell {
        background-color:rgba(233, 237, 251);
    }
    .cell:not(:last-child) {
        margin-right: 1.625rem;
    }
    .number {
        font-size: 4rem;
        line-height: 6rem;
    }
    .label {
        margin-bottom: 1.25rem;
        font-size: 1.5rem;
        line-height: 3.5rem;
        opacity: .5;
    }
    /* media queries */
    @media only screen and (min-width: 750px) {
        .cell {
            width: 12.5rem;
            border-radius: 13px;
            padding-top: 3rem;
        }
        .number {
            margin-bottom: 5.28px;
            font-size: 7rem;
        }
        .label {
            margin-bottom: 13.88px;
            font-size: 2rem;
        }
    }
    @media only screen and (min-width: 1200px) {
        .container {
            align-items: flex-start;
            text-align: start;
        }
        .time-wrapper {
            margin-bottom: 0;
        }
        p {
            margin-bottom: 0;
        }
        .cell {
            padding-top: 4rem;
        }
        .cell:not(:last-child) {
            margin-right: 2rem;
        }
    }
</style>
