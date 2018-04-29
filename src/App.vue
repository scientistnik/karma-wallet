<!--
/*
 * file: App.vue
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */
-->

<template>
  <div id="app">
    <div class="flex">
      <nav class="flex-item columns">
        <p class="column has-text-centered is-1" @click="isShowMenu = !isShowMenu">
          <b-icon icon="close" size="is-small" v-if="isShowMenu"></b-icon>
          <b-icon icon="reorder-horizontal" size="is-small" v-else></b-icon>
        </p>
        <p class="column has-text-centered" v-if="isShowMenu">
          <a class="link is-info">Deposit / Windrow</a>
        </p>
        <p class="column has-text-centered" v-if="isShowMenu">
          <router-link to="/proposal" class="link is-info">Proposal</router-link>
        </p>
        <p class="column has-text-centered">
          <router-link to="/" class="link is-info">KARMA</router-link>
        </p>
        <p class="column has-text-centered" v-if="isShowMenu">
          <router-link to="/transfer" class="link is-info">Transfer</router-link>
        </p>
        <p class="column has-text-centered" v-if="isShowMenu">
          <template v-if="isLogin">
            <a class="link is-info" @click="isModalActive = true">Sign in</a> or
            <router-link to="/register" class="link is-info">Sign up</router-link>
          </template>
          <template v-else>
            <a calss="link is-info" @click="account = ''">Log Out</a>
          </template>
        </p>
      </nav>
    </div>
    <router-view @clicked="getAccount"></router-view>
    <b-modal :active.sync="isModalActive" has-modal-card>
      <Login @clicked="getAccount" />
    </b-modal>
  </div>
</template>

<script>
import Login from './components/Login.vue'
import Transfer from './components/Transfer.vue'

export default {
  name: 'app',
  data() {
    return {
      isModalActive: false,
      account: '',
      isShowMenu: true
    }
  },
  methods: {
    async connected() {
      console.log("connected")
      //this.isModalActive = true
      //console.log(await this.$karma.accounts['testbr5'])
      console.log(await this.$karma.db.get_global_properties())
    },

    getAccount(account) {
      this.account = account
      //this.$route
    }
  },
  created() {

    this.$karma.subscribe('connected',this.connected)
  },
  components: {
    Login,
    Transfer
  },
  computed: {
    isLogin() {
      return this.account == ''
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}

.flex {
  display: flex;
  min-height: 100%;
  width: 100%;
  flex-direction: column;
}

.flex-item, .column {
  border: 1px solid black;
}

.flex-item-center {
  flex-grow: 1;
}

.columns.flex-item {
  margin: 0;
  margin-bottom: 0;
}

.columns .without-pedding {
  padding: 0;
}
</style>
