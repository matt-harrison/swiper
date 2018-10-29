<template>
  <div id="app">
    <header id="header" class="m10">
      <h1 class="mb5">Movie Swiper</h1>
      <p class="mb10">There are too many movies to watch. Narrow down which movie to watch.</p>
      <p class="mb10">{{ mediaTotal }} movies to swipe.</p>
      <p class="mb10">{{ mediaYes.length }} swiped right.</p>
      <p class="mb10">{{ mediaNo.length }} swiped left.</p>
      <p
      v-if="mediaUndecided.length === 0 && mediaYes.length === 1"
      class="mb10">Enjoy your movie: {{ mediaYes[0].original_title }}</p>
      <div id="buttons" class="flex">
        <i
        v-on:click.prevent="showInstructions = true;"
        class="mr10 fas fa-chalkboard-teacher fs20 csrPointer"></i>
        <i
        v-on:click.prevent="showFilters = !showFilters"
        class="mr10 fas fa-filter fs20 csrPointer"></i>
        <i
        v-on:click.prevent="reviewMediaYes"
        class="mr10 fas fa-thumbs-up fs20 csrPointer"></i>
        <i
        v-on:click.prevent="reviewMediaUndecided"
        class="mr10 fas fa-question-circle fs20 csrPointer"></i>
        <i
        v-on:click.prevent="reviewMediaNo"
        class="mr10 fas fa-thumbs-down fs20 csrPointer"></i>
        <i
        v-on:click.prevent="resetAll"
        class="fas fa-trash fs20 csrPointer"></i>
      </div>
    </header>
    <div
    id="swipeContainer"
    class="mxAuto mb10 posRelative overflowHidden">
      <div
      id="slides"
      v-if="currentMediaList.length > 0 && currentMediaList[currentIndex]"
      v-bind:style="{ left: slidesX + 'px' }"
      class="flex posAbsolute">
        <div
        id="preserve"
        class="flex justifyCenter alignCenter bgGreen posterSize">
          <i class="txtGreen fas fa-thumbs-up fs165"></i>
        </div>
        <div
        id="posterContainer"
        v-on:mousedown.prevent="mouseDown"
        v-on:touchstart.prevent="touchStart"
        class="posRelative csrPointer">
          <img
          id="poster"
          v-bind:src="`https://image.tmdb.org/t/p/w500${currentMediaList[currentIndex].poster_path}`"/>
          <div
          v-if="currentMediaList === mediaYes"
          class="flex justifyCenter alignCenter posterSize">
            <div class="posAbsolute top0 posterSize bgBlack opac50"></div>
            <div class="posAbsolute top0 flex justifyCenter alignCenter posterSize">
              <i class="fas fa-thumbs-up fs165 txtGreen"></i>
            </div>
          </div>
          <div
          v-if="currentMediaList === mediaNo"
          class="flex justifyCenter alignCenter posterSize">
            <div class="posAbsolute top0 posterSize bgBlack opac50"></div>
            <div class="posAbsolute top0 flex justifyCenter alignCenter posterSize">
              <i class="fas fa-thumbs-down fs165 txtRed"></i>
            </div>
          </div>
        </div>
        <div
        id="dismiss"
        class="flex justifyCenter alignCenter bgRed posterSize">
          <i class="txtRed fas fa-thumbs-down fs165"></i>
        </div>
      </div>
      <img
      v-if="mediaUndecided.length === 0 && mediaYes.length === 1"
      v-on:mousedown.prevent.prevent=""
      v-bind:src="`https://image.tmdb.org/t/p/w500${mediaYes[0].poster_path}`"
      class="posterSize"/>
    </div>
    <Menu
    id="instructions"
    v-bind:open="showInstructions"
    v-on:close="showInstructions = false;"
    class="bgWhite">
      <p>Swipe right to keep a movie in consideration.</p>
      <p>Swipe left to dismiss.</p>
      <p>Keep swiping until you've found the movie to watch.</p>
      <p>Use filters to focus your search.</p>
    </Menu>
    <Menu
    id="filters"
    v-bind:open="showFilters"
    v-on:close="updateFilters"
    class="bgWhite">
      <div class="flex flexWrap mt10">
        <select
        v-model="params.primary_release_year"
        class="mr10">
          <option value="">Any Year</option>
          <option
          v-for="(year, index) in years"
          v-bind:key="index"
          v-bind:value="year">{{ year }}</option>
        </select>
        <select
        v-model="params.with_genres"
        class="mr10">
          <option value="">Any Genre</option>
          <option
          v-for="(genre, index) in genres"
          v-bind:key="index"
          v-bind:value="genre.id">{{ genre.name }}</option>
        </select>
        <select
        v-model="params.certification"
        class="mr10">
          <option value="">Any Rating</option>
          <option
          v-for="(rating, index) in ratings"
          v-bind:key="index"
          v-bind:value="rating">{{ rating }}</option>
        </select>
        <select
        v-on:change.prevent="updateStarsMinimum"
        class="mr10">
          <option value="">Any Minimum Stars</option>
          <option
          v-for="(review, index) in stars"
          v-bind:key="index"
          v-bind:value="review.min">{{ review.label }}</option>
        </select>
        <select
        v-on:change.prevent="updateStarsExact"
        class="mr10">
          <option value="">Any Exact Stars</option>
          <option
          v-for="(review, index) in stars"
          v-bind:key="index"
          v-bind:data-max="review.max"
          v-bind:data-min="review.min">{{ review.label }}</option>
        </select>
      </div>
    </Menu>
    <div id="debug" class="flex">
      <pre>
        <p>current ({{ currentMediaList.length }}):</p>
        {{ currentMediaList }}
      </pre>
      <pre>
        <p>undecided ({{ mediaUndecided.length }}):</p>
        {{ mediaUndecided }}
      </pre>
      <pre>
        <p>yes ({{ mediaYes.length }}):</p>
        {{ mediaYes }}
      </pre>
      <pre>
        <p>no ({{ mediaNo.length }}):</p>
        {{ mediaNo }}
      </pre>
    </div>
  </div>
</template>

<script>
  import api from '@/api';
  import Menu from '@/components/Menu.vue';

  export default {
    name: 'app',
    components: {
      Menu
    },
    data() {
      return {
        currentIndex: 0,
        genres: [],
        mediaUndecided: [],
        mediaYes: [],
        mediaNo: [],
        currentMediaList: [],
        mediaTotal: null,
        offset: null,
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
          year: null
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
        showFilters: false,
        showInstructions: false
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
      resetParams() {
        this.params = {
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
          year: null
        };
      },
      getGenres() {
        api.getGenres().then((response) => {
          this.genres = response.data.genres;
        });
      },
      getMovies() {
        this.params.page++;
        api.getMovies(this.params).then((response) => {
          this.mediaTotal = (this.mediaTotal) ? this.mediaTotal : response.data.total_results;
          this.pagesTotal = response.data.total_pages;

          response.data.results.forEach(movie => {
            this.mediaUndecided.push(movie);
          });

          this.currentMediaList = this.mediaUndecided;
        });
      },
      checkCurrentList() {
        if (this.currentMediaList.length === 0) {
          if (this.currentMediaList === this.mediaYes) {
            if (this.mediaUndecided.length > 0) {
              this.reviewMediaUndecided();
            }
          } else if (this.currentMediaList === this.mediaNo) {
            if (this.mediaUndecided.length > 0) {
              this.reviewMediaUndecided();
            } else {
              this.reviewMediaYes();
            }
          } else {
            if (this.params.page < this.pagesTotal) {
              this.getMovies();
            } else {
              if (this.mediaYes.length > 0) {
                this.reviewMediaYes();
              }
            }
          }
        }
      },
      dismissMedia() {
        if (this.currentMediaList === this.mediaYes) {
          this.mediaNo.push(this.currentMediaList[this.currentIndex]);
          this.currentMediaList.splice(this.currentIndex, 1);
        } else if (this.currentMediaList === this.mediaNo) {
          this.currentIndex++;
        } else {
          this.mediaNo.push(this.currentMediaList[this.currentIndex]);
          this.currentMediaList.splice(this.currentIndex, 1);
          this.mediaTotal--;
        }

        this.checkCurrentList();

        setTimeout(this.showNextPoster, 500);
      },
      preserveMedia() {
        if (this.currentMediaList === this.mediaYes) {
          this.currentIndex++;
        } else if (this.currentMediaList === this.mediaNo) {
          this.mediaYes.unshift(this.currentMediaList[this.currentIndex]);
          this.currentMediaList.splice(this.currentIndex, 1);
        } else {
          this.mediaYes.push(this.currentMediaList[this.currentIndex]);
          this.currentMediaList.splice(this.currentIndex, 1);
          this.mediaTotal--;
        }

        this.checkCurrentList();

        setTimeout(this.showNextPoster, 500);
      },
      updateFilters() {
        this.showFilters = false;
        this.currentIndex = 0;
        this.params.page = 0;
        this.mediaUndecided = [];
        this.mediaTotal = null;

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
        if (this.mediaUndecided.length > 0 || this.mediaYes.length > 0) {
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
        if (event.touches.length > 1) {
          this.touchCancel();
        } else {
          this.mouseDown(event.touches[0]);
        }
      },
      touchMove(event) {
        if (event.touches.length > 1) {
          this.touchCancel();
        } else {
          this.mouseMove(event.changedTouches[0]);
        }
      },
      touchEnd(event) {
        this.mouseUp(event.changedTouches[0]);
      },
      touchCancel() {
        this.slidesX = 0 - this.slideWidth;
        this.offset = null;
      },
      showNextPoster() {
        this.slidesX = 0 - this.slideWidth;
      },
      resetAll() {
        let confirmation = confirm('Are you sure you want to permanently clear your selections and filters?');

        if (confirmation) {
          this.currentIndex = 0;
          this.mediaUndecided = [];
          this.mediaYes = [];
          this.mediaNo = [];

          this.resetParams();
          this.getMovies();
        }
      },
      reviewMediaYes() {
        if (this.mediaYes.length > 0) {
          this.currentMediaList = this.mediaYes;
          this.currentIndex = 0;
        } else {
          alert('There are no approved movies to dismiss. Swipe right to add movies to consider.');
          this.reviewMediaUndecided();
        }
      },
      reviewMediaNo() {
        if (this.mediaNo.length > 0) {
          this.currentMediaList = this.mediaNo;
          this.currentIndex = 0;
        } else {
          alert('There are no dismissed movies to reconsider. Swipe left to dismiss a movie.');
          this.reviewMediaUndecided();
        }
      },
      reviewMediaUndecided() {
        if (this.mediaUndecided.length > 0) {
          this.currentMediaList = this.mediaUndecided;
          this.currentIndex = 0;
        } else {
          alert("All movies matching your filters have been swiped. Now it's time to make some tough choices. Swipe left to dismiss.");
          this.reviewMediaYes();
        }
      }
    },
    mounted() {
      this.containerX = document.getElementById('swipeContainer').getBoundingClientRect().left;
      this.slideWidth = 200;//document.getElementById('posterContainer').getBoundingClientRect().width;
      this.slidesX = 0 - this.slideWidth;

      this.resetParams();
      this.getGenres();
      this.getMovies();

      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
      document.getElementById('swipeContainer').addEventListener('touchmove', this.touchMove);
      document.getElementById('swipeContainer').addEventListener('touchend', this.touchEnd);
      document.getElementById('swipeContainer').addEventListener('touchcancel', this.touchCancel);
    }
  }
</script>

<style scoped>
  #swipeContainer, #posterContainer, #poster, .posterSize {
    width: 200px;
    height: 300px;
  }
  pre {
    width: 25%;
    overflow: hidden;
  }
</style>
