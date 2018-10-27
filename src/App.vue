<template>
  <div id="app">
    <header id="header" class="m10">
      <h1 class="mb5">Movie Swiper</h1>
      <p class="mb10">There are too many movies to watch. Narrow down which movie to watch right now.</p>
      <i
      v-if="!showFilters"
      v-on:click="showFilters = !showFilters"
      class="fas fa-bars fs20"></i>
      <div
      id="filters"
      v-if="showFilters"
      class="flex flexWrap">
        <i
        v-on:click="showFilters = false;"
        class="mr10 fas fa-times-circle fs20"></i>
        <select
        v-model="params.primary_release_year"
        v-on:change="updateFilters()"
        class="mr10">
          <option value="">Any Year</option>
          <option
          v-for="(year, index) in years"
          v-bind:key="index"
          v-bind:value="year">{{ year }}</option>
        </select>
        <select
        v-model="params.with_genres"
        v-on:change="updateFilters()"
        class="mr10">
          <option value="">Any Genre</option>
          <option
          v-for="(genre, index) in genres"
          v-bind:key="index"
          v-bind:value="genre.id">{{ genre.name }}</option>
        </select>
        <select
        v-model="params.certification"
        v-on:change="updateFilters()"
        class="mr10">
          <option value="">Any Rating</option>
          <option
          v-for="(rating, index) in ratings"
          v-bind:key="index"
          v-bind:value="rating">{{ rating }}</option>
        </select>
        <select
        v-on:change="updateStarsMinimum"
        class="mr10">
          <option value="">Any Minimum Stars</option>
          <option
          v-for="(review, index) in stars"
          v-bind:key="index"
          v-bind:value="review.min">{{ review.label }}</option>
        </select>
        <select
        v-on:change="updateStarsExact"
        class="mr10">
          <option value="">Any Exact Stars</option>
          <option
          v-for="(review, index) in stars"
          v-bind:key="index"
          v-bind:data-max="review.max"
          v-bind:data-min="review.min">{{ review.label }}</option>
        </select>
      </div>
    </header>
    <div
    id="swipeContainer"
    class="mxAuto mb10 posRelative overflowHidden">
      <div
      id="slides"
      v-bind:style="{ left: slidesX + 'px' }"
      class="flex posAbsolute">
        <div
        id="preserve"
        v-bind:style="{ width: slideWidth + 'px' }"
        class="flex justifyCenter alignCenter bgGreen">
          <i class="txtGreen fas fa-thumbs-up"></i>
        </div>
        <div
        id="posterContainer"
        v-on:mousedown="mouseDown"
        v-on:touchstart="touchStart">
          <img
          id="poster"
          v-if="media.length > 0 && media[currentIndex]"
          v-bind:src="`https://image.tmdb.org/t/p/original${media[currentIndex].poster_path}`"
          class="csrPointer"/>
        </div>
        <div
        id="dismiss"
        v-bind:style="{ width: slideWidth + 'px' }"
        class="flex justifyCenter alignCenter bgRed">
          <i class="txtRed fas fa-thumbs-down"></i>
        </div>
      </div>
    </div>
    <div id="debug" class="m10 overflowHidden">
      <p>DEBUG</p>
      <p>index: {{ currentIndex }}/{{ media.length }}/{{ mediaTotal }}</p>
      <p>page: {{ params.page }}/{{ pagesTotal }}</p>
      <pre>preservedMedia: {{ preservedMedia }}</pre>
      <pre>dismissedMedia: {{ dismissedMedia }}</pre>
    </div>
  </div>
</template>

<script>
  import api from '@/api';

  export default {
    name: 'app',
    data() {
      return {
        currentIndex: 0,
        genres: [],
        media: [],
        dismissedMedia: [],
        preservedMedia: [],
        mediaTotal: null,
        pagesTotal: null,
        params: {
          certification_country: 'US',
          certification: '',
          certification_lte: null,
          include_adult: false,
          include_video: false,
          language: 'en-US',
          page: 0,
          'primary_release_date.gte': null,
          'primary_release_date.lte': null,
          primary_release_year: '',
          region: 'US',
          'release_date.gte': null,
          'release_date.lte': null,
          sort_by: null,
          'vote_average.gte': null,
          'vote_average.lte': null,
          'vote_count.gte': null,
          'vote_count.lte': null,
          with_cast: null,
          with_companies: null,
          with_crew: null,
          with_genres: '',
          with_keywords: null,
          without_genres: null,
          with_people: null,
          with_release_type: null,
          'with_runtime.gte': null,
          'with_runtime.lte': null,
          with_original_language: null,
          without_keywords: null,
          year: null,
        },
        ratings: [
          'G',
          'PG',
          'PG-13',
          'R',
          'NC-17',
          'NR'
        ],
        stars: [
          {
            label: '5 Stars',
            max: 10,
            min: 9
          },
          {
            label: '4+ Stars',
            max: 8.9,
            min: 8
          },
          {
            label: '3+ Stars',
            max: 7.9,
            min: 6
          },
          {
            label: '2+ Stars',
            max: 5.9,
            min: 4
          },
          {
            label: '1+ Star',
            max: 3.9,
            min: 2
          },
          {
            label: '0+ Stars',
            max: 1.9,
            min: 0
          }
        ],
        containerX: null,
        mousedownX: null,
        slidesX: null,
        slideWidth: null,
        showFilters: false
      };
    },
    computed: {
      years() {
        let years = [];
        let date = new Date;

        for (let i = date.getFullYear(); i >= 1874; i--) {
          years.push(i);
        }

        return years;
      }
    },
    methods: {
      getGenres() {
        api.getGenres().then((response) => {
          this.genres = response.data.genres;
        });
      },
      getMovies() {
        this.params.page++;
        api.getMovies(this.params).then((response) => {
          this.mediaTotal = response.data.total_results;
          this.pagesTotal = response.data.total_pages;

          response.data.results.forEach(movie => {
            this.media.push(movie);
          });
        });
      },
      dismissMedia() {
        this.dismissedMedia.push(this.media[this.currentIndex]);
        this.media.splice(this.currentIndex, 1);
        this.mediaTotal--;

        if (this.currentIndex >= this.media.length) {
          if (this.currentIndex >= this.mediaTotal) {
            this.currentIndex = 0;
          } else {
            if (this.params.page < this.pagesTotal) {
              this.getMovies();
            } else {
              this.currentIndex = 0;
            }
          }
        }

        setTimeout(this.showNextPoster, 500);
      },
      preserveMedia() {
        this.preservedMedia.push(this.media[this.currentIndex]);
        this.currentIndex++;

        if (this.currentIndex === this.media.length) {
          if (this.params.page < this.pagesTotal) {
            this.getMovies();
          } else {
            this.currentIndex = 0;
          }
        }

        setTimeout(this.showNextPoster, 500);
      },
      updateFilters() {
        this.currentIndex = 0;
        this.params.page = 0;
        this.media = [];
        this.getMovies();
      },
      updateStarsExact(event) {
        let max = event.target.options[event.target.selectedIndex].dataset.max;
        let min = event.target.options[event.target.selectedIndex].dataset.min;

        this.params['vote_average.gte'] = min;
        this.params['vote_average.lte'] = max;
        this.updateFilters();
      },
      updateStarsMinimum(event) {
        let min = event.target.value;

        this.params['vote_average.gte'] = min;
        this.updateFilters();
      },
      mouseDown(event) {
        if (event.type == 'mousedown') {
          event.preventDefault();
        }

        if (this.media.length > 1) {
          this.mousedownX = event.clientX;
          this.offset = this.slideWidth + event.clientX - this.containerX;
        }
      },
      mouseMove(event) {
        if (this.offset) {
          let mouseX = event.clientX - this.containerX;
          let slidesX = mouseX - this.offset;

          if (slidesX < 0 - this.slideWidth * 2) {
            slidesX = 0 - this.slideWidth * 2;
          } else if (slidesX > 0) {
            slidesX = 0;
          }

          this.slidesX = slidesX;
        }
      },
      mouseUp(event) {
        if (this.offset) {
          if (event.clientX > this.mousedownX + 10) {
            this.slidesX = 0;
            this.preserveMedia();
          } else if (event.clientX < this.mousedownX - 10) {
            this.slidesX = 0 - this.slideWidth * 2;
            this.dismissMedia();
          } else {
            this.slidesX = 0 - this.slideWidth;
          }

          this.offset = null;

        }
      },
      touchStart(event) {
        event.preventDefault();
        this.mouseDown(event.touches[0]);
      },
      touchMove(event) {
        event.preventDefault();
        this.mouseMove(event.changedTouches[0]);
      },
      touchEnd(event) {
        event.preventDefault();
        this.mouseUp(event.changedTouches[0]);
      },
      showNextPoster() {
        this.slidesX = 0 - this.slideWidth;
      }
    },
    mounted() {
      this.containerX = document.getElementById('swipeContainer').getBoundingClientRect().left;
      this.slideWidth = document.getElementById('posterContainer').getBoundingClientRect().width;
      this.slidesX = 0 - this.slideWidth;

      this.getGenres();
      this.getMovies();

      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
      document.getElementById('swipeContainer').addEventListener('touchmove', this.touchMove);
      document.getElementById('swipeContainer').addEventListener('touchend', this.touchEnd);
    }
  }
</script>

<style scoped>
  #swipeContainer, #posterContainer, #poster {
    width: 200px;
    height: 300px;
  }
  #dismiss, #preserve {
    font-size: 165px;
  }
  #debug {
    width: calc(100vw - 50px);
  }
  .fa-thumbs-down {
    transform: scaleX(-1);
  }
  .fs20 {font-size: 20px;}
</style>
