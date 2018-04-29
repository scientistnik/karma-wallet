<!--
/*
 * file: Main.vue
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */
-->

<template>
  <div>
    <div class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Hello to Karma Wallet
          </h1>
          <h2 class="subtitle">
            {{ connectMessage }}
          </h2>
        </div>
      </div>
    </div>
    <div>
      <button @click="$parent.isModalActive = true" class="button is-primary">Sign in</button> or
      <router-link to="/register" class="button is-primary">Sign up</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      connectMessage: 'Connecting, please wait...'
    }
  },
  created() {
    this.$karma.subscribe('connected',this.connected)
  },
  methods: {
    connected() {
      this.connectMessage = 'Connected'
    }
  }
}
</script>