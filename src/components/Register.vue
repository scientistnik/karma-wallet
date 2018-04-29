<!--
/*
 * file: Register.vue
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
            Register new account
          </h1>
          <h2 class="subtitle">
            Haha
          </h2>
        </div>
      </div>
    </div>
    <div>
      <b-field label="Name" horizontal>
        <b-input v-model="name"></b-input>
      </b-field>
      <b-field label="Pass" horizontal>
        <b-input v-model="pass" password-reveal required></b-input>
      </b-field>
      <b-field label="Confirm pass" horizontal>
        <b-input v-model="confirmPass" password-reveal required></b-input>
      </b-field>
      <button class="button is-primary" :class="{'is-loading':isLoading}" @click="register()">Register</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      pass: '',
      confirmPass: '',
      isLoading: false
    }
  },
  methods: {
    async register() {
      if (this.name == '') {
        this.$snackbar.open('Pelase, set name!')
        return
      }

      if (this.pass == '' || this.confirmPass == '') {
        this.$snackbar.open('Pelase, set pass and confirm Pass!')
        return
      }

      if (this.pass !== this.confirmPass) {
        this.$snackbar.open('Pass and confirm pass not equal!')
        return
      }

      let request = `${window.location.protocol}//testnet-faucet.karma.red/api/v1/accounts`
      let obj
      try {
        console.log("generate keys:",this.name,this.pass)
        obj = this.$karma.generateKeys(this.name, this.pass)
      } catch(err) {
        this.$snackbar.open({message: `Error when generage keys: ${err}`,type:'is-danger',indefinite:true})
        return
      }
      
      let ownerKey = obj.owner.toPublicKey().toString(),
          activeKey = obj.active.toPublicKey().toString();
      console.log(ownerKey, activeKey)

      let json = {
        account: {
          name: this.name,
          owner_key: ownerKey,
          active_key: activeKey,
          memo_key: activeKey,
          refcode: null,
          referrer: null
        }
      }

      console.log(json)
      this.isLoading = true
      let response = await this.axios.post(request,json)

      if (response.data.error)
        this.$snackbar.open({message:response.data.error.base[0],type:'is-danger',indefinite:true})
      else {
        this.$snackbar.open("Account created")
        let account = await this.$karma.login(this.name, this.pass)
        this.$emit('clicked', account)
      }
      this.isLoading = false
      console.log("account created", response)
    }
  }
}
</script>