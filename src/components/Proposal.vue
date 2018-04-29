<!--
/*
 * file: Proposal.vue
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
            Proposal Transfer
          </h1>
          <h2 class="subtitle">
            please set all fields
          </h2>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header-title has-text-centered is-full">
        Transfer
      </div>
      <div class="card-context">
        <b-field horizontal label="from">
          <b-autocomplete
            v-model="from"
            :data="findFrom"
            placeholder="from account"
            @select="option => selected = option">
            <template slot="empty">No results found</template>
          </b-autocomplete>
        </b-field>
        <b-field horizontal label="to">
          <b-autocomplete
            v-model="to"
            :data="findTo"
            placeholder="to account"
            @select="option => selected = option">
            <template slot="empty">No results found</template>
          </b-autocomplete>
        </b-field>
        <b-field horizontal label="Amount">
          <b-input v-model="amount"></b-input>
        </b-field>
        <b-field><button class="button is-primary" :class="{'is-loading':isLoading}" @click="transfer()">Proposal Transfer</button></b-field>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      from: '',
      to: '',
      amount: 0,
      findFrom: [],
      findTo: [],
      isLoading: false
    }
  },
  created() {
    this.debouncedGetAccount = _.debounce(this.getAccount, 500)
  },
  methods: {
    async getAccount(type) {
      let db = await this.$karma.db.lookup_accounts(type == 'to' ? this.to : this.from,3)

      let array = db.map(arr => arr[0])
      type == 'to' ? (this.findTo = array) : (this.findFrom = array)
    },

    async transfer() {
      let account = this.$parent.account
      console.log(account)

      if (account == '') {
        this.$snackbar.open('Pelase, Sing in!')
        return
      }

      if (this.from == '') {
        this.$snackbar.open('Pelase, set From account!')
        return
      }

      if (this.to == '') {
        this.$snackbar.open('Pelase, set To account!')
        return
      }

      if (isNaN(+this.amount) || +this.amount <= 0) {
        this.$snackbar.open('Pelase, set correct amount!')
        return
      }

      let from, to;

      try {
        from = await this.$karma.accounts[this.from]
      } catch(err) {
        this.$snackbar.open('Not found From account!')
        return
      }

      try {
        to = await this.$karma.accounts[this.to]
      } catch(err) {
        this.$snackbar.open('Not found To account!')
        return
      }
      
      let tomorrow = (new Date()).getTime() + 70000000; // 700

      console.log(tomorrow, new Date(tomorrow))
      this.isLoading = true
      try {
        await account.proposalTransfer(from.name, to.name, 'KRMT', +this.amount, new Date(tomorrow))
        console.log("transfer finished!")
      } catch(err) {
        this.$snackbar.open(`Error when create proposal: ${err}`)
      }
      this.isLoading = false
    }
  },
  watch: {
    from() {this.debouncedGetAccount('from')},
    to() {this.debouncedGetAccount('to')}
  }
}
</script>