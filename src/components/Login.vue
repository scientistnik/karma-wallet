<!--
/*
 * file: Login.vue
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */
-->

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Sign in</p>
    </header>
    <section class="modal-card-body">
      <b-field label="Login" horizontal :type="loginValidate.type" :message="loginValidate.msg">
        <b-input
          v-model="login"
          placeholder="Your login"
          required>
        </b-input>
      </b-field>

      <b-field label="Pass" horizontal :type="passwordType" :message="errorMessage">
        <b-input
          v-model="password"
          password-reveal
          placeholder="Your password"
          required>
        </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Close</button>
      <button class="button is-primary" @click="checkLogin()">Login</button>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: '',
      password: '',
      errorMessage: ''
    }
  },
  computed: {
    loginValidate() {
      if (this.login.indexOf(' ') > 0)
        return {type: 'is-danger', msg: 'without spaces'}

      if (this.errorMessage != '')
        return {type: 'is-danger', msg: ''}

      return {type: '', msg: ''}
    },

    passwordType() {
      return this.errorMessage != '' ? 'is-danger' : ''
    }
  },
  methods: {
    async checkLogin() {
      try {
        let bot = await this.$karma.login(this.login, this.password);
        this.$emit('clicked', bot)
        this.$parent.close()
      } catch(err) {
        this.errorMessage = `The pair of login and password do not match!${err}`
      }
    }
  }
}
</script>